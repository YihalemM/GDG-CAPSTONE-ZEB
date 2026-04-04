import crypto from "crypto";

/**
 * Generates a simple audio signature for MVP.
 * Currently hashes the first 128KB of the audio file to detect exact or near-identical headers/content.
 * @param buffer - The audio buffer.
 */
export function generateAudioSignature(buffer: Buffer): string {
  // Taking a slice for a "weak" signature that might catch some modifications or clones
  // If the file is smaller than 128KB, we use the whole thing.
  const sliceSize = Math.min(buffer.length, 128 * 1024);
  const slice = buffer.slice(0, sliceSize);
  
  return crypto.createHash("md5").update(slice).digest("hex");
}
