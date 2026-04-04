import mongoose from "mongoose";
import dotenv from "dotenv";
import Art from "../src/models/art.model.js";

dotenv.config();

async function check() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/zebdb";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    const arts = await Art.find({ title: /test image4/i })
      .sort({ createdAt: -1 })
      .limit(10);
      
    console.log("Found Artworks Count:", arts.length);
    console.log(JSON.stringify(arts, null, 2));

  } catch (err) {
    console.error("Debug failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
