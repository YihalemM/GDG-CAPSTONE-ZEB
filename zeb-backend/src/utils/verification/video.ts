import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import { generatePHash } from "./image.js";

/**
 * Generates a video signature by extracting frames and hashing them.
 * @param videoPath - Path to the video file.
 */
export async function generateVideoSignature(videoPath: string): Promise<string[]> {
  const tempDir = path.resolve("temp_frames");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const framePaths: string[] = [];
  
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on("filenames", (filenames) => {
        filenames.forEach(f => framePaths.push(path.join(tempDir, f)));
      })
      .on("end", async () => {
        try {
          const hashes: string[] = [];
          for (const framePath of framePaths) {
            const buffer = fs.readFileSync(framePath);
            hashes.push(await generatePHash(buffer));
            fs.unlinkSync(framePath); // Clean up
          }
          resolve(hashes);
        } catch (err) {
          reject(err);
        }
      })
      .on("error", (err) => reject(err))
      .screenshots({
        count: 3, // Extract 3 representative frames
        folder: tempDir,
        size: "160x120"
      });
  });
}
