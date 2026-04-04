import { v2 as cloudinary } from "cloudinary";
import { VerificationService } from "./verification.service.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key:    process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

export class ArtService {

  static async storeFile(file: Express.Multer.File) {
    if (!file) {
      throw new Error("No file provided");
    }

    const { fileType, contentHash, similarityHash, similarityMethod } =
      await VerificationService.verify(file.buffer, file.mimetype);

    // Upload to Cloudinary using a stream from the buffer
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "zeb-arts",
          public_id: contentHash,        // use content hash as stable ID
          resource_type: "auto",         // handles image, video, raw
          overwrite: false,              // skip re-upload if already exists
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error("Cloudinary upload failed"));
          resolve(result as { secure_url: string });
        }
      );
      uploadStream.end(file.buffer);
    });

    return {
      contentHash,
      similarityHash,
      similarityMethod,
      fileType,
      mimeType: file.mimetype,
      filePath: uploadResult.secure_url,   // permanent Cloudinary URL
    };
  }
}
