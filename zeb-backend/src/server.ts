import express from "express";
import {connectDB} from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from 'url';
import path from "path";

// __dirname not needed since uploads moved to Cloudinary

import users from "./routes/user.routes.js"
import arts from "./routes/art.routes.js"
import verification from "./routes/verification.routes.js"
import auction from "./routes/auction.routes.js"
import auctionRouter from "./routes/auction.routes.js";
import adminRouter from "./routes/admin.routes.js";
import activityRouter from "./routes/activity.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Files are now stored on Cloudinary — no local uploads directory needed

dotenv.config();

const PORT = process.env.PORT || 5000

app.use("/api/users", users);
app.use("/api/arts", arts);
app.use("/api/verify", verification);
app.use("/api/auctions", auctionRouter);
app.use("/api/admin", adminRouter);
app.use("/api/activity", activityRouter);

app.get("/", (req, res)=>{
  res.send("Zeb backend running");
});



connectDB().then(()=> {
  app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
  })
})




