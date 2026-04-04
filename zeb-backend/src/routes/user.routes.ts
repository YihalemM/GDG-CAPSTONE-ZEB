import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.model.js";
import auth from "../middleware/auth.middleware.js"

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password, publickey } = req.body;
    
    let passwordHash = undefined;
    if (password) {
      const salt = 10;
      passwordHash = await bcrypt.hash(password, salt);
    }

    const user = new User({ username, passwordHash, publickey });
    await user.save();

    const userJson = user.toObject();
    delete userJson.passwordHash;
    res.status(201).json({ status: "ok", message: "User registered.", data: userJson });
  } catch(err){
    console.error("Error creating user.", err);
    res.status(500).json({ status: "error", message: "Error creating user" });
  }
});

router.post("/login-wallet", async (req, res) => {
  try {
    const { publickey } = req.body;
    const user = await User.findOne({ publickey });
    
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    const userJson = user.toObject();
    delete userJson.passwordHash;
    res.json({ status: "ok", message: "Login successful", data: userJson });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

router.post("/login", auth, async (req, res) => {
  const userJson = (req as any).user.toObject();
  delete userJson.passwordHash;
  res.json({ status: "ok", message: "Login successful", data: userJson });
});

router.get("/check/:publickey", async (req, res) => {
  try {
    const user = await User.findOne({ publickey: req.params.publickey });
    res.json({ status: "ok", exists: !!user });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Error checking user" });
  }
});

router.get("/profile/:publickey", async (req, res) => {
  try {
    const user = await User.findOne({ publickey: req.params.publickey });
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    const userJson = user.toObject();
    delete userJson.passwordHash;
    res.json({ status: "ok", data: userJson });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Error fetching user" });
  }
});

export default router;

