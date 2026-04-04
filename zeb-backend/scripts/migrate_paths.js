import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import Art from "../src/models/art.model.js";
import mime from "mime-types";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const uploadDir = path.join(__dirname, '..', 'uploads');
async function migrate() {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/zebdb";
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB for migration");
        const arts = await Art.find({});
        console.log(`Found ${arts.length} artworks to check`);
        let migratedCount = 0;
        let skippedCount = 0;
        for (const art of arts) {
            // e.g., uploads/HASH
            const currentPath = art.filePath;
            const fullPath = path.join(__dirname, '..', currentPath);
            // Check if file exists exactly as named in DB
            if (!fs.existsSync(fullPath)) {
                // Check if it exists WITH an extension already but DB is missing it
                const possibleExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
                let foundWithExt = false;
                for (const e of possibleExts) {
                    if (fs.existsSync(fullPath + e)) {
                        console.log(`[FIXING DB ONLY] ${art.title}: File found with extension ${e}. Updating DB path.`);
                        art.filePath = currentPath + e;
                        await art.save();
                        migratedCount++;
                        foundWithExt = true;
                        break;
                    }
                }
                if (!foundWithExt) {
                    console.log(`[SKIPPING] File not found even with extensions: ${fullPath}`);
                    skippedCount++;
                }
                continue;
            }
            const ext = path.extname(currentPath);
            if (ext) {
                console.log(`[OK] ${art.title} already has extension: ${ext}`);
                skippedCount++;
                continue;
            }
            // No extension in DB AND file exists without extension on disk.
            // Rename on disk and update DB
            const mimeType = art.mimeType;
            let newExt = mime.extension(mimeType) || 'png';
            // Normalize jpeg
            if (newExt === 'jpe')
                newExt = 'jpg';
            const newFileName = `${path.basename(currentPath)}.${newExt}`;
            const newFilePath = `uploads/${newFileName}`;
            const newFullPath = path.join(uploadDir, newFileName);
            console.log(`[MIGRATING] ${art.title}: ${currentPath} -> ${newFilePath}`);
            // Rename on disk
            fs.renameSync(fullPath, newFullPath);
            // Update in DB
            art.filePath = newFilePath;
            await art.save();
            migratedCount++;
            console.log(`[DONE] ${art.title} updated`);
        }
        console.log(`\nMigration Summary:`);
        console.log(`- Migrated/Fixed: ${migratedCount}`);
        console.log(`- Skipped (OK/Missing): ${skippedCount}`);
        console.log("Migration completed successfully");
    }
    catch (err) {
        console.error("Migration failed:", err);
    }
    finally {
        await mongoose.disconnect();
    }
}
migrate();
//# sourceMappingURL=migrate_paths.js.map