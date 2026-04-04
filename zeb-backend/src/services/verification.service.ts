import { generatePHash } from "../utils/verification/image.js";
import { generateAudioSignature } from "../utils/verification/audio.js";
import { generateVideoSignature } from "../utils/verification/video.js";
import { normalizeText } from "../utils/verification/text.js";
import { generateContentHash } from "../utils/verification/hashing.js";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { FileType, SimilarityMethod } from "../models/Art.model.js";

export interface VerificationResult {
  fileType: FileType;
  contentHash: string;
  similarityHash: string | null;
  similarityMethod: SimilarityMethod;
}

export class VerificationService {
  static async verify(buffer: Buffer, mimeType: string): Promise<VerificationResult> {
    const contentHash = generateContentHash(buffer);
    
    let fileType: FileType = FileType.TEXT;
    let similarityHash: string | null = null;
    let similarityMethod: SimilarityMethod = SimilarityMethod.NONE;

    if (mimeType.startsWith("image/")) {
      fileType = FileType.IMAGE;
      similarityHash = await generatePHash(buffer);
      similarityMethod = SimilarityMethod.PHASH;
    } else if (mimeType.startsWith("video/")) {
      fileType = FileType.VIDEO;
      
      // Temporary file for video processing
      const tempId = crypto.randomBytes(8).toString("hex");
      const tempPath = path.resolve(`temp_video_${tempId}.mp4`);
      fs.writeFileSync(tempPath, buffer);
      
      try {
        const frameHashes = await generateVideoSignature(tempPath);
        similarityHash = frameHashes[0] || null;
        similarityMethod = SimilarityMethod.FRAME_PHASH;
      } finally {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    } else if (mimeType.startsWith("audio/")) {
      fileType = FileType.AUDIO;
      similarityHash = generateAudioSignature(buffer);
      similarityMethod = SimilarityMethod.AUDIO_SIGNATURE;
    } else if (mimeType.startsWith("text/") || mimeType === "application/pdf") {
      fileType = FileType.TEXT;
      similarityHash = normalizeText(buffer.toString("utf-8"));
      similarityMethod = SimilarityMethod.TEXT_NORMALIZED_HASH;
    }

    return {
      fileType,
      contentHash,
      similarityHash,
      similarityMethod
    };
  }
}
