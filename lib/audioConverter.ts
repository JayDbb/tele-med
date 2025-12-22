"use client";

import { storeFileForUpload, queueMutation } from "./offlineQueue";

/**
 * Internal conversion function - does the actual MP3 conversion
 * Exported for use in offline sync
 */
export async function _convertToMP3Internal(audioBlob: Blob): Promise<Blob> {
  // Ensure we're in browser environment
  if (typeof window === "undefined") {
    throw new Error("convertToMP3 can only be used in browser environment");
  }

  // Dynamically import lamejs only on client side to avoid SSR issues
  // The library exports Mp3Encoder directly
  const { Mp3Encoder } = await import("@breezystack/lamejs");

  // Create an audio context to decode the audio
  const audioContext = new AudioContext();

  // Convert blob to array buffer
  const arrayBuffer = await audioBlob.arrayBuffer();

  // Decode the audio data
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Get the sample rate and channels
  const sampleRate = audioBuffer.sampleRate;
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;

  // Convert AudioBuffer to PCM data (interleaved for stereo)
  const samples = new Int16Array(length * numberOfChannels);

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      // Convert float32 (-1.0 to 1.0) to int16 (-32768 to 32767)
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      samples[i * numberOfChannels + channel] =
        sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
  }

  // Create MP3 encoder
  const mp3encoder = new Mp3Encoder(numberOfChannels, sampleRate, 128); // 128 kbps bitrate
  const sampleBlockSize = 1152; // MP3 frame size
  const mp3Data: Uint8Array[] = [];

  // Encode in chunks
  for (let i = 0; i < samples.length; i += sampleBlockSize * numberOfChannels) {
    const sampleChunk = samples.subarray(
      i,
      i + sampleBlockSize * numberOfChannels
    );
    const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
  }

  // Flush remaining data
  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
  }

  // Combine all MP3 chunks into a single blob
  const mp3Blob = new Blob(mp3Data as BlobPart[], { type: "audio/mp3" });

  // Close audio context
  await audioContext.close();

  return mp3Blob;
}

/**
 * Converts a WebM/Opus audio blob to MP3 format
 * Stores the original blob first for offline persistence
 * @param audioBlob - The audio blob (typically WebM format from MediaRecorder)
 * @returns A Promise that resolves to an MP3 blob, or throws if offline and conversion fails
 */
export async function convertToMP3(audioBlob: Blob): Promise<Blob> {
  // Store the original blob first for offline persistence
  const originalFile = new File([audioBlob], `recording-${Date.now()}.webm`, {
    type: audioBlob.type || "audio/webm",
  });

  let fileId: string | null = null;
  try {
    // Store original file in IndexedDB first
    fileId = await storeFileForUpload(originalFile);
  } catch (error) {
    console.warn("Failed to store original audio file:", error);
  }

  // Try to convert immediately
  try {
    const mp3Blob = await _convertToMP3Internal(audioBlob);

    // If successful and we stored it, we can optionally remove it
    // But we'll keep it in case the upload fails later

    return mp3Blob;
  } catch (error: any) {
    // Check if it's a network/API error from lamejs
    const isNetworkError =
      error.message?.includes("fetch") ||
      error.message?.includes("network") ||
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("API") ||
      !navigator.onLine;

    if (isNetworkError && fileId) {
      // Queue the conversion+upload for later
      // The file is already stored, we'll convert and upload during sync
      await queueMutation({
        type: "file_upload", // Reuse file_upload type, but mark it as needing conversion
        endpoint: "/api/convert-audio", // Placeholder endpoint
        method: "POST",
        payload: {
          action: "convert_to_mp3",
          originalFileId: fileId,
        },
        fileId,
        fileName: originalFile.name,
        fileType: originalFile.type,
        fileSize: originalFile.size,
      });

      // Return the original blob - it will be wrapped as MP3 file by caller
      // The actual conversion will happen during sync before upload
      // Note: The upload will also be queued, but the sync will handle conversion first
      console.log(
        "Audio conversion queued for later sync. Original file stored and will be converted when online."
      );
      return audioBlob; // Return original - will be converted during sync
    }

    // For other errors, rethrow
    throw error;
  }
}
