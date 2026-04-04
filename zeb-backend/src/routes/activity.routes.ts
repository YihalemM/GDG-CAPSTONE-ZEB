import express from "express";
import Activity, { ActivityType } from "../models/Activity.model.js";

const router = express.Router();

/**
 * GET /api/activity/art/:artId
 * Fetch all history for a specific artwork.
 */
router.get("/art/:artId", async (req, res) => {
  try {
    const activities = await Activity.find({ artId: req.params.artId }).sort({ timestamp: -1 });
    res.json({ status: "ok", data: activities });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

/**
 * POST /api/activity
 * Record a new activity (usually called after a successful blockchain TX)
 */
router.post("/", async (req, res) => {
  try {
    const { type, artId, from, to, amount, transactionHash } = req.body;
    const activity = await Activity.create({
      type,
      artId,
      from,
      to,
      amount,
      transactionHash,
    });
    res.status(201).json({ status: "ok", data: activity });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;
