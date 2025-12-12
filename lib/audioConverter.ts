"use client";

/**
 * Converts a WebM/Opus audio blob to MP3 format
 * @param audioBlob - The audio blob (typically WebM format from MediaRecorder)
 * @returns A Promise that resolves to an MP3 blob
 */
export async function convertToMP3(audioBlob: Blob): Promise<Blob> {
  // Ensure we're in browser environment
  if (typeof window === 'undefined') {
    throw new Error('convertToMP3 can only be used in browser environment');
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
      samples[i * numberOfChannels + channel] = sample < 0 
        ? sample * 0x8000 
        : sample * 0x7FFF;
    }
  }
  
  // Create MP3 encoder
  const mp3encoder = new Mp3Encoder(numberOfChannels, sampleRate, 128); // 128 kbps bitrate
  const sampleBlockSize = 1152; // MP3 frame size
  const mp3Data: Int8Array[] = [];
  
  // Encode in chunks
  for (let i = 0; i < samples.length; i += sampleBlockSize * numberOfChannels) {
    const sampleChunk = samples.subarray(i, i + sampleBlockSize * numberOfChannels);
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
  const mp3Blob = new Blob(mp3Data, { type: "audio/mp3" });
  
  // Close audio context
  await audioContext.close();
  
  return mp3Blob;
}

