import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.model.js";

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ status: "error", message: "User not found" });
    }

    const matched = await bcrypt.compare(password as string, user.passwordHash as string);
    if (!matched) {
      return res.status(401).json({ status: "error", message: "Invalid password" });
    }

    (req as any).user = user;

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

export default auth;
