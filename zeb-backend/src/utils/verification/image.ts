import sharp from "sharp";

/**
 * Generates a basic perceptual hash (pHash) for an image.
 * This version resizes the image to 8x8, converts to grayscale, 
 * and calculates a bitstring based on whether pixels are above/below the mean.
 * @param buffer - The image buffer.
 */
export async function generatePHash(buffer: Buffer): Promise<string> {
  const { data, info } = await sharp(buffer)
    .resize(8, 8, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const mean = data.reduce((sum, val) => sum + val, 0) / (info.width * info.height);
  
  let hash = "";
  for (const pixel of data) {
    hash += pixel >= mean ? "1" : "0";
  }

  // Convert binary string to hex
  let hexHash = "";
  for (let i = 0; i < hash.length; i += 4) {
    hexHash += parseInt(hash.substring(i, i + 4), 2).toString(16);
  }

  return hexHash;
}

/**
 * Calculates the Hamming distance between two hex hashes.
 * @param h1 - Hex string hash 1.
 * @param h2 - Hex string hash 2.
 */
export function calculateHammingDistance(h1: string, h2: string): number {
  if (h1.length !== h2.length) return Infinity;
  
  let distance = 0;
  for (let i = 0; i < h1.length; i++) {
    const b1 = parseInt(h1[i]!, 16).toString(2).padStart(4, "0");
    const b2 = parseInt(h2[i]!, 16).toString(2).padStart(4, "0");
    for (let j = 0; j < 4; j++) {
      if (b1[j] !== b2[j]) distance++;
    }
  }
  return distance;
}
