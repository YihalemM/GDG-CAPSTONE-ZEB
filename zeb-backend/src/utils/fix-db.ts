import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/zebdb";

async function fixDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear the arts collection for a clean start as requested for MVP debugging
    // OR just drop the problematic index
    const collection = mongoose.connection.collection("arts");
    
    console.log("Dropping old index hash_1...");
    try {
      await collection.dropIndex("hash_1");
      console.log("Old index 'hash_1' dropped.");
    } catch (err) {
      console.log("Index 'hash_1' not found or already dropped.");
    }

    // Also drop the collection to clear out old documents with incompatible schema
    console.log("Clearing collection 'arts' to ensure clean start...");
    await collection.deleteMany({});
    console.log("Collection 'arts' cleared.");

    process.exit(0);
  } catch (err) {
    console.error("Error fixing DB:", err);
    process.exit(1);
  }
}

fixDB();
