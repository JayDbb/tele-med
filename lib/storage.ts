import { supabaseBrowser } from "./supabaseBrowser";
import { createSignedUploadUrl } from "./api";
import {
  queueMutation,
  storeFileForUpload,
  removeQueuedItemByMatch,
  removeStoredFile,
} from "./offlineQueue";

/**
 * Uploads a file to a private Supabase bucket using a signed URL scoped to the user.
 * Returns the storage path of the uploaded object.
 * Queues the upload if offline for later sync.
 */
export async function uploadToPrivateBucket(file: File) {
  const contentType = file.type || "application/octet-stream";

  // Store file in IndexedDB first
  const fileId = await storeFileForUpload(file);

  // Queue the upload operation
  await queueMutation({
    type: "file_upload",
    endpoint: "/api/upload", // This is just for tracking, actual upload uses Supabase storage
    method: "POST",
    payload: {
      filename: file.name,
      contentType,
    },
    fileId,
    fileName: file.name,
    fileType: contentType,
    fileSize: file.size,
  });

  // Try to upload immediately
  try {
    const { path, token, bucket } = await createSignedUploadUrl({
      filename: file.name,
      contentType,
    });

    const supabase = supabaseBrowser();
    const { error } = await supabase.storage
      .from(bucket)
      .uploadToSignedUrl(path, token, file, { contentType });

    if (error) throw new Error(error.message);

    // If successful, remove from queue and delete stored file
    await removeQueuedItemByMatch("/api/upload", "POST", {
      filename: file.name,
      contentType,
    });
    await removeStoredFile(fileId);

    return { path, bucket };
  } catch (error: any) {
    // If network error, the file is already queued and will sync later
    if (
      error.message?.includes("fetch") ||
      error.message?.includes("network") ||
      error.message?.includes("Failed to fetch")
    ) {
      // Return a temporary path for offline mode
      // The actual path will be set when sync completes
      return {
        path: `temp_${fileId}`,
        bucket: "temp",
        _queued: true,
      } as any;
    }
    // For other errors, remove the queued item and stored file
    await removeQueuedItemByMatch("/api/upload", "POST", {
      filename: file.name,
      contentType,
    });
    await removeStoredFile(fileId);
    throw error;
  }
}
