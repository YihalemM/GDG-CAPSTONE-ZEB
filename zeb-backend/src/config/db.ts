import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("connected to database.");
  } catch(error) {
    console.error("Faild to connect to databse.", error);
    process.exit(1);
  }
}
