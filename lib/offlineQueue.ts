/**
 * Offline Queue System using IndexedDB (Dexie)
 * Queues mutations locally before syncing to Supabase
 */

import Dexie, { Table } from "dexie";
import { supabaseBrowser } from "./supabaseBrowser";

export interface QueuedItem {
  id?: number;
  type: "insert" | "update" | "delete" | "file_upload";
  endpoint: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  payload: Record<string, any>;
  createdAt: Date;
  retries: number;
  maxRetries?: number;
  // For file uploads
  fileId?: string; // Reference to stored file in IndexedDB
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

interface StoredFile {
  id: string;
  file: Blob;
  fileName: string;
  fileType: string;
  createdAt: Date;
}

interface IdMapping {
  tempId: string;
  realId: string;
  resourceType: string; // 'visit', 'patient', etc.
  createdAt: Date;
}

class OfflineQueueDB extends Dexie {
  queue!: Table<QueuedItem>;
  files!: Table<StoredFile>;
  idMappings!: Table<IdMapping>;

  constructor() {
    super("telemedOfflineDB");
    this.version(1).stores({
      queue: "++id, type, createdAt, endpoint",
    });
    this.version(2).stores({
      queue: "++id, type, createdAt, endpoint",
      files: "id, createdAt",
    });
    this.version(3).stores({
      queue: "++id, type, createdAt, endpoint",
      files: "id, createdAt",
      idMappings: "tempId, resourceType, createdAt",
    });
  }
}

export const db = new OfflineQueueDB();

/**
 * Add a mutation to the queue
 */
export async function queueMutation(
  item: Omit<QueuedItem, "id" | "createdAt" | "retries">
): Promise<number> {
  const queuedItem: QueuedItem = {
    ...item,
    createdAt: new Date(),
    retries: 0,
    maxRetries: 3,
  };

  const id = await db.queue.add(queuedItem);
  return id as number;
}

/**
 * Get all queued items, sorted by creation time (oldest first)
 */
export async function getQueuedItems(): Promise<QueuedItem[]> {
  return await db.queue.orderBy("createdAt").toArray();
}

/**
 * Remove a queued item after successful sync
 */
export async function removeQueuedItem(id: number): Promise<void> {
  await db.queue.delete(id);
}

/**
 * Find and remove a queued item by endpoint, method, and payload
 * Used to remove items that succeeded immediately
 */
export async function removeQueuedItemByMatch(
  endpoint: string,
  method: string,
  payload: Record<string, any>
): Promise<void> {
  const items = await db.queue.where("endpoint").equals(endpoint).toArray();

  for (const item of items) {
    if (item.method !== method) continue;

    // For visit creation, match by key fields (patient_id, status) instead of strict JSON match
    // This prevents issues with property order or _tempId differences
    if (endpoint === "/api/visits" && method === "POST") {
      const itemPayload = item.payload || {};
      const matchPayload = payload || {};

      // Match by patient_id and status (or default to "draft")
      const itemPatientId = itemPayload.patient_id;
      const matchPatientId = matchPayload.patient_id;
      const itemStatus = itemPayload.status || "draft";
      const matchStatus = matchPayload.status || "draft";

      if (itemPatientId === matchPatientId && itemStatus === matchStatus) {
        // Require _tempId to match - this ensures we remove the exact item we just executed
        const itemTempId = itemPayload._tempId;
        const matchTempId = matchPayload._tempId;
        if (matchTempId && itemTempId === matchTempId) {
          await db.queue.delete(item.id!);
          console.log(
            `Removed queued visit creation for patient ${itemPatientId} with tempId ${matchTempId}`
          );
          return; // Only remove one match
        }
      }
    } else {
      // For other endpoints, use flexible deep comparison of key fields
      // Normalize both payloads by removing metadata fields
      const normalizePayload = (p: any) => {
        const normalized = { ...p };
        delete normalized._tempId;
        delete normalized._queued;
        return normalized;
      };

      const itemNormalized = JSON.stringify(
        normalizePayload(item.payload || {})
      );
      const matchNormalized = JSON.stringify(normalizePayload(payload));

      if (itemNormalized === matchNormalized) {
        await db.queue.delete(item.id!);
        return; // Only remove one match
      }
    }
  }
}

/**
 * Increment retry count for a queued item
 */
export async function incrementRetry(id: number): Promise<void> {
  const item = await db.queue.get(id);
  if (item) {
    await db.queue.update(id, { retries: item.retries + 1 });
  }
}

/**
 * Get count of queued items
 */
export async function getQueueCount(): Promise<number> {
  return await db.queue.count();
}

/**
 * Clear all queued items (for testing/cleanup)
 */
export async function clearQueue(): Promise<void> {
  await db.queue.clear();
  await db.files.clear();
  await db.idMappings.clear();
}

/**
 * Store a mapping from temp ID to real ID
 */
export async function storeIdMapping(
  tempId: string,
  realId: string,
  resourceType: string
): Promise<void> {
  await db.idMappings.add({
    tempId,
    realId,
    resourceType,
    createdAt: new Date(),
  });
}

/**
 * Get real ID for a temp ID
 */
export async function getRealId(
  tempId: string,
  resourceType?: string
): Promise<string | null> {
  const mapping = resourceType
    ? await db.idMappings
        .where("tempId")
        .equals(tempId)
        .and((m) => m.resourceType === resourceType)
        .first()
    : await db.idMappings.where("tempId").equals(tempId).first();
  return mapping?.realId || null;
}

/**
 * Update queued items that reference a temp ID to use the real ID
 */
export async function updateQueuedItemsWithRealId(
  tempId: string,
  realId: string
): Promise<void> {
  const items = await db.queue.toArray();
  for (const item of items) {
    // Check if endpoint contains the temp ID
    if (item.endpoint.includes(tempId)) {
      const newEndpoint = item.endpoint.replace(tempId, realId);
      await db.queue.update(item.id!, { endpoint: newEndpoint });
    }
    // Also check payload for any ID references
    if (item.payload && typeof item.payload === "object") {
      const payloadStr = JSON.stringify(item.payload);
      if (payloadStr.includes(tempId)) {
        const newPayload = JSON.parse(
          payloadStr.replace(new RegExp(tempId, "g"), realId)
        );
        await db.queue.update(item.id!, { payload: newPayload });
      }
    }
  }
}

/**
 * Update queued items that reference a temp file path to use the real path
 */
export async function updateQueuedItemsWithRealPath(
  tempPath: string,
  realPath: string
): Promise<void> {
  const items = await db.queue.toArray();
  for (const item of items) {
    // Check payload for temp path references (in audio_url, path, etc.)
    if (item.payload && typeof item.payload === "object") {
      const payloadStr = JSON.stringify(item.payload);
      if (payloadStr.includes(tempPath)) {
        // Escape special regex characters in tempPath
        const escapedTempPath = tempPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const newPayload = JSON.parse(
          payloadStr.replace(new RegExp(escapedTempPath, "g"), realPath)
        );
        await db.queue.update(item.id!, { payload: newPayload });
        console.log(
          `Updated queued item ${item.id} path from ${tempPath} to ${realPath}`
        );
      }
    }
  }
}

/**
 * Store a file in IndexedDB for later upload
 */
export async function storeFileForUpload(file: File): Promise<string> {
  const fileId = `file_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  // Convert File to ArrayBuffer for storage
  const arrayBuffer = await file.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: file.type });

  await db.files.add({
    id: fileId,
    file: blob,
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
    createdAt: new Date(),
  });
  return fileId;
}

/**
 * Get a stored file by ID
 */
export async function getStoredFile(fileId: string): Promise<File | null> {
  const stored = await db.files.get(fileId);
  if (!stored) return null;

  // Convert Blob back to File with original metadata
  return new File([stored.file], stored.fileName, {
    type: stored.fileType,
  });
}

/**
 * Remove a stored file after successful upload
 */
export async function removeStoredFile(fileId: string): Promise<void> {
  await db.files.delete(fileId);
}

/**
 * Execute a queued item by making the API call
 */
async function executeQueuedItem(
  item: QueuedItem
): Promise<{ success: boolean; response?: any }> {
  try {
    const supabase = supabaseBrowser();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("You must be logged in.");
    }

    // Handle file uploads specially
    if (item.type === "file_upload" && item.fileId) {
      let file = await getStoredFile(item.fileId);
      if (!file) {
        throw new Error("Stored file not found");
      }

      // Check if file needs conversion to MP3
      if (item.payload?.action === "convert_to_mp3") {
        try {
          // Import convertToMP3 function
          const { _convertToMP3Internal } = await import("./audioConverter");

          // Convert the original blob to MP3
          const mp3Blob = await _convertToMP3Internal(file);

          // Create new MP3 file
          const mp3File = new File(
            [mp3Blob],
            file.name.replace(/\.[^/.]+$/, ".mp3"),
            {
              type: "audio/mpeg",
            }
          );

          // Update stored file with MP3 version
          const arrayBuffer = await mp3File.arrayBuffer();
          const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });

          await db.files.update(item.fileId, {
            file: blob,
            fileName: mp3File.name,
            fileType: "audio/mpeg",
          });

          file = mp3File;
        } catch (convertError) {
          console.error(
            "Failed to convert audio to MP3 during sync:",
            convertError
          );
          // Continue with original file if conversion fails
        }
      }

      // Get signed upload URL
      const { createSignedUploadUrl } = await import("./api");
      const { path, token, bucket } = await createSignedUploadUrl({
        filename: item.fileName || file.name,
        contentType: item.fileType || file.type || "audio/mpeg",
      });

      // Upload file to Supabase
      const { error } = await supabase.storage
        .from(bucket)
        .uploadToSignedUrl(path, token, file, {
          contentType: item.fileType || file.type || "audio/mpeg",
        });

      if (error) {
        throw new Error(error.message);
      }

      // Remove stored file after successful upload
      await removeStoredFile(item.fileId);

      // Update any queued items that reference the temp file path
      // This includes visit updates and transcription requests
      const tempPath = `temp_${item.fileId}`;
      const realPath = path;
      await updateQueuedItemsWithRealPath(tempPath, realPath);

      console.log(
        `File upload completed: ${tempPath} -> ${realPath}, updating queued items`
      );

      return { success: true, response: { path, bucket } };
    }

    console.log("Executing regular API call:", item);

    // For visit creation, check if we already have a mapping for this tempId
    // This prevents duplicate creation if the visit was already created but the queue item wasn't removed
    if (
      item.endpoint === "/api/visits" &&
      item.method === "POST" &&
      item.payload?._tempId
    ) {
      const existingMapping = await getRealId(item.payload._tempId, "visit");
      if (existingMapping) {
        console.log(
          `Visit with tempId ${item.payload._tempId} already exists with real ID ${existingMapping}, skipping duplicate creation`
        );
        // Return success with the existing ID - treat as already done
        return {
          success: true,
          response: { id: existingMapping },
        };
      }
    }

    // Handle regular API calls
    // Filter out metadata fields like _tempId before sending
    const cleanPayload = { ...item.payload };
    delete cleanPayload._tempId;

    const response = await fetch(item.endpoint, {
      method: item.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(cleanPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        errorText || `Request failed with status ${response.status}`
      );
    }

    const responseData = await response.json();

    // If this was a visit creation, store the ID mapping and update queued items
    if (
      item.endpoint === "/api/visits" &&
      item.method === "POST" &&
      responseData.id
    ) {
      const tempId = item.payload._tempId;
      if (tempId && tempId.startsWith("temp_visit_")) {
        const realId = responseData.id;
        console.log(`Storing ID mapping: ${tempId} -> ${realId}`);
        // Store the mapping
        await storeIdMapping(tempId, realId, "visit");
        // Update any queued items that reference this temp ID
        await updateQueuedItemsWithRealId(tempId, realId);
        console.log(`Updated queued items with real ID ${realId}`);
      } else {
        console.warn(
          `Visit created but no temp ID found in payload:`,
          item.payload
        );
      }
    }

    // If this was a visit update, check if it updated audio_url and update transcriptions
    if (
      item.endpoint.startsWith("/api/visits/") &&
      item.method === "PUT" &&
      item.payload?.audio_url
    ) {
      const audioUrl = item.payload.audio_url;
      // If this was a real path (not temp), update any transcriptions waiting for it
      if (!audioUrl.startsWith("temp_")) {
        // Find transcriptions that might be waiting for this visit's audio
        const visitId = item.endpoint.split("/api/visits/")[1];
        const transcriptions = await db.queue
          .where("endpoint")
          .equals("/api/transcribe")
          .toArray();

        for (const transItem of transcriptions) {
          if (
            transItem.payload?.visit_id === visitId &&
            transItem.payload?.path?.startsWith("temp_")
          ) {
            // Update transcription to use the real audio path
            transItem.payload.path = audioUrl;
            await db.queue.update(transItem.id!, {
              payload: transItem.payload,
            });
            console.log(
              `Updated transcription ${transItem.id} to use real audio path: ${audioUrl}`
            );
          }
        }
      }
    }

    return { success: true, response: responseData };
  } catch (error) {
    console.error(`Failed to execute queued item ${item.id}:`, error);
    return { success: false };
  }
}

// Sync lock to prevent concurrent syncs
let isSyncing = false;

/**
 * Sync all queued items to Supabase
 * Processes items in order and stops on first failure to preserve order
 */
export async function syncQueue(): Promise<{ synced: number; failed: number }> {
  if (typeof window === "undefined" || !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  // Prevent concurrent syncs
  if (isSyncing) {
    console.log("Sync already in progress, skipping...");
    return { synced: 0, failed: 0 };
  }

  isSyncing = true;
  try {
    const items = await getQueuedItems();
    if (items.length === 0) {
      return { synced: 0, failed: 0 };
    }

    let synced = 0;
    let failed = 0;

    // Sort items: file uploads first, then visit creations, then updates, then transcriptions, then by timestamp
    const sortedItems = items.sort((a, b) => {
      // File uploads first
      if (a.type === "file_upload" && b.type !== "file_upload") return -1;
      if (b.type === "file_upload" && a.type !== "file_upload") return 1;

      // Visit creations before updates
      if (
        a.endpoint === "/api/visits" &&
        a.method === "POST" &&
        b.endpoint.startsWith("/api/visits/") &&
        b.method === "PUT"
      )
        return -1;
      if (
        b.endpoint === "/api/visits" &&
        b.method === "POST" &&
        a.endpoint.startsWith("/api/visits/") &&
        a.method === "PUT"
      )
        return 1;

      // Updates before transcriptions
      if (
        a.endpoint.startsWith("/api/visits/") &&
        a.method === "PUT" &&
        b.endpoint === "/api/transcribe"
      )
        return -1;
      if (
        b.endpoint.startsWith("/api/visits/") &&
        b.method === "PUT" &&
        a.endpoint === "/api/transcribe"
      )
        return 1;

      // Then by timestamp
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    for (const item of sortedItems) {
      // Skip if max retries exceeded
      if (item.retries >= (item.maxRetries || 3)) {
        console.warn(`Skipping queued item ${item.id} - max retries exceeded`);
        await removeQueuedItem(item.id!);
        failed++;
        continue;
      }

      // Reload item from database to get any updates (e.g., ID mappings applied)
      const currentItem = await db.queue.get(item.id!);
      if (!currentItem) {
        // Item was removed, skip
        continue;
      }

      // Use the current item from database (may have been updated)
      const itemToExecute = currentItem;

      // For transcription requests, check if audio path is a temp path
      // If it is, it should have been updated by updateQueuedItemsWithRealPath
      // But if it's still temp, skip it for now (will be retried after file upload)
      if (
        itemToExecute.endpoint === "/api/transcribe" &&
        itemToExecute.payload?.path
      ) {
        const audioPath = itemToExecute.payload.path;
        if (audioPath.startsWith("temp_")) {
          console.warn(
            `Skipping transcription with temp path ${audioPath} - waiting for file upload to complete`
          );
          continue;
        }
      }

      // Also check if visit_id in transcription is a temp ID and resolve it
      if (
        itemToExecute.endpoint === "/api/transcribe" &&
        itemToExecute.payload?.visit_id
      ) {
        const visitId = itemToExecute.payload.visit_id;
        if (visitId.startsWith("temp_visit_")) {
          const realVisitId = await getRealId(visitId, "visit");
          if (realVisitId) {
            itemToExecute.payload.visit_id = realVisitId;
            await db.queue.update(itemToExecute.id!, {
              payload: itemToExecute.payload,
            });
            console.log(
              `Updated transcription visit_id from ${visitId} to ${realVisitId}`
            );
          } else {
            console.warn(
              `Skipping transcription - visit ${visitId} not created yet`
            );
            continue;
          }
        }
      }

      // Check if endpoint contains a temp visit ID and update it with real ID
      // This handles cases where a visit was created earlier in the sync
      const tempVisitIdMatch = itemToExecute.endpoint.match(
        /\/api\/visits\/(temp_visit_[^/]+)/
      );
      if (tempVisitIdMatch) {
        const tempId = tempVisitIdMatch[1];
        const realId = await getRealId(tempId, "visit");
        if (realId) {
          // Update the item's endpoint to use the real ID
          itemToExecute.endpoint = itemToExecute.endpoint.replace(
            tempId,
            realId
          );
          // Also update in database
          await db.queue.update(itemToExecute.id!, {
            endpoint: itemToExecute.endpoint,
          });
          console.log(
            `Updated queued item ${itemToExecute.id} endpoint from ${tempId} to ${realId}`
          );
        } else {
          // If we don't have a mapping yet, check if there's a visit creation in the queue
          // that should happen before this update
          const visitCreationInQueue = sortedItems.find(
            (i) =>
              i.endpoint === "/api/visits" &&
              i.method === "POST" &&
              i.payload?._tempId === tempId
          );

          if (
            visitCreationInQueue &&
            visitCreationInQueue.id !== itemToExecute.id
          ) {
            // Visit creation is in queue but hasn't been processed yet
            // Skip this update for now - it will be processed in next sync after visit is created
            console.warn(
              `Skipping update for temp visit ID ${tempId} - visit creation pending in queue`
            );
            continue;
          } else {
            // No visit creation found - this is an orphaned update, skip it
            console.warn(
              `Skipping orphaned update for temp visit ID ${tempId} - no visit creation found`
            );
            await removeQueuedItem(itemToExecute.id!);
            failed++;
            continue;
          }
        }
      }

      const result = await executeQueuedItem(itemToExecute);

      if (result.success) {
        await removeQueuedItem(itemToExecute.id!);
        synced++;
      } else {
        await incrementRetry(itemToExecute.id!);
        failed++;
        // Stop on failure to preserve order
        break;
      }

      // Small delay between requests to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return { synced, failed };
  } finally {
    isSyncing = false;
  }
}

/**
 * Setup automatic sync on online event
 */
export function setupAutoSync(
  onSyncComplete?: (synced: number, failed: number) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleOnline = async () => {
    console.log("Connection restored, syncing queue...");
    const result = await syncQueue();
    console.log(
      `Sync complete: ${result.synced} synced, ${result.failed} failed`
    );
    if (onSyncComplete) {
      onSyncComplete(result.synced, result.failed);
    }
  };

  window.addEventListener("online", handleOnline);

  // Also try to sync immediately if already online
  if (navigator.onLine) {
    handleOnline();
  }

  // Return cleanup function
  return () => {
    window.removeEventListener("online", handleOnline);
  };
}
