import express from "express";
import Art, { ArtStatus } from "../models/Art.model.js";
import Revenue from "../models/Revenue.model.js";
import { RevenueService } from "../services/revenue.service.js";

const router = express.Router();

/**
 * GET /api/admin/revenue
 * Fetches total and broken-down revenue statistics and recent transactions.
 */
router.get("/revenue", async (req, res) => {
  try {
    const data = await RevenueService.getStats();
    res.status(200).json({ status: "ok", data });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ status: "error", message: "Error fetching revenue stats" });
  }
});

/**
 * GET /api/admin/revenue/:type
 * Returns all transactions of a specific type.
 */
router.get("/revenue/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const transactions = await Revenue.find({ type })
      .sort({ timestamp: -1 })
      .populate("artId", "title");
    res.status(200).json({ status: "ok", data: transactions });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error fetching transactions" });
  }
});

/**
 * GET /api/admin/flags
 * Returns all artworks with status FLAGGED.
 */
router.get("/flags", async (req, res) => {
  try {
    const flaggedArts = await Art.find({ status: ArtStatus.FLAGGED }).sort({ createdAt: -1 });
    res.status(200).json({ status: "ok", data: flaggedArts });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error fetching flagged artworks" });
  }
});

/**
 * PATCH /api/admin/flags/:id
 * Approves or Rejects a flagged artwork.
 */
router.patch("/flags/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (![ArtStatus.ACTIVE, ArtStatus.REJECTED].includes(status)) {
      return res.status(400).json({ status: "error", message: "Invalid status" });
    }

    const updated = await Art.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ status: "error", message: "Art not found" });
    }

    res.status(200).json({ 
      status: "ok", 
      message: `Artwork ${status === ArtStatus.ACTIVE ? "approved" : "rejected"}`, 
      data: updated 
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error resolving flag" });
  }
});

export default router;
