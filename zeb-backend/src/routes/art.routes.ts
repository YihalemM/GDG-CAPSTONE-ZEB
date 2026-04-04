import express from "express";
import Art, { ArtStatus } from "../models/Art.model.js";
import Activity, { ActivityType } from "../models/Activity.model.js";
import {Types} from "mongoose";
import multer from "multer";
import { ArtService } from "../services/art.service.js";
import { calculateHammingDistance } from "../utils/verification/image.js";
import { RevenueService } from "../services/revenue.service.js";
import { RevenueType } from "../models/Revenue.model.js";

const router = express.Router();


const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "File is required"
      });
    }

    const {
      title,
      description,
      saleType,
      creatorBy,
      ownedBy,
      auctionEndTime,
      category = "image",
      minPrice = "0"
    } = req.body;

    if (!title || !creatorBy || !ownedBy) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields"
      });
    }

    const storeResult = await ArtService.storeFile(req.file);

    // Fallback: derive fileType/mimeType from the upload if verification didn't set them
    const resolvedMimeType = storeResult.mimeType || req.file!.mimetype || 'application/octet-stream';
    const resolvedFileType = storeResult.fileType || (() => {
      const m = resolvedMimeType;
      if (m.startsWith('image/')) return 'image';
      if (m.startsWith('video/')) return 'video';
      if (m.startsWith('audio/')) return 'audio';
      return 'text';
    })();

    const {
      contentHash,
      similarityHash,
      similarityMethod,
      filePath: serviceFilePath
    } = storeResult;
    const fileType = resolvedFileType;
    const mimeType = resolvedMimeType;

    // 1. Check for Exact Duplicates (Content Hash)
    const exactExisting = await Art.findOne({ contentHash });
    if (exactExisting) {
      if (exactExisting.creatorBy === creatorBy) {
        // Same creator: Allow resumption
        return res.status(200).json({
          status: "ok",
          message: "Artwork already exists for you. Resuming registration.",
          data: {
            artId: exactExisting._id,
            hash: contentHash
          }
        });
      } else {
        // Different creator: Conflict
        return res.status(409).json({
          status: "error",
          message: "Duplicate artwork detected (this content is already registered by another creator)"
        });
      }
    }

    // 2. Check for Similar Artworks (Hamming Distance for Images)
    let status = ArtStatus.ACTIVE;
    if (similarityHash) {
      // For now, simple fetch and compare (optimization: can use bitwise query in production)
      const potentialSimilars = await Art.find({ 
        similarityMethod, 
        status: { $ne: ArtStatus.REJECTED } 
      });

      for (const candidate of potentialSimilars) {
        if (candidate.similarityHash) {
          const distance = calculateHammingDistance(similarityHash, candidate.similarityHash);
          if (distance <= 5) { // Threshold for "Similar"
            if (candidate.creatorBy === creatorBy) {
              return res.status(200).json({
                status: "ok",
                message: "Similar artwork already exists for you. Resuming registration.",
                data: { artId: candidate._id, hash: contentHash }
              });
            } else {
              status = ArtStatus.FLAGGED;
              break; 
            }
          }
        }
      }
    }

    const art = await Art.create({
      title,
      description,
      filePath: serviceFilePath,
      fileType,
      saleType,
      auctionEndTime,
      mimeType,
      contentHash,
      similarityHash,
      similarityMethod,
      status: ArtStatus.PENDING, 
      creatorBy,
      ownedBy,
      category,
      minPrice: parseFloat(minPrice)
    } as any);

    // LOG REVENUE: Assume a flat registration fee of 10 ZEB (constant for now)
    await RevenueService.logRevenue(10, RevenueType.REGISTRATION, creatorBy, (art as any)._id);

    // LOG ACTIVITY: MINTED
    await Activity.create({
      type: ActivityType.MINTED,
      artId: (art as any)._id,
      to: creatorBy,
      timestamp: new Date()
    });

    res.status(201).json({
      status: status === ArtStatus.FLAGGED ? "flagged" : "ok",
      message: status === ArtStatus.FLAGGED 
        ? "Art created but flagged as similar to another artwork. Pending admin review."
        : "Art created successfully",
      data: {
        artId: (art as any)._id,
        hash: contentHash
      }
    });

  } catch (err: any) {
    console.error("CRITICAL: Create art error:", err);
    
    if (err.message.includes("Duplicate") || err.message.includes("Similar")) {
      return res.status(409).json({
        status: "error",
        message: err.message
      });
    }

    // Return more detail in 500 to help debug
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      detail: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});


router.post("/register", async (req, res) => {
  try{
    const { title, description,
            filePath, contentHash,
            creatorBy, ownedBy,
            category, minPrice } = req.body;

    const art = new Art({ title, description,
            filePath, contentHash,
            creatorBy, ownedBy,
            category, minPrice });

    await art.save();
    res.status(201).json({status: "ok", message: "Art created.", data: art._id});

  } catch(err){
    console.error("Error creating art", err);
    res.status(500).json({status:"error", message: "Error creating art"});
  }
});



router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      let art;
      
      if (Types.ObjectId.isValid(id)) {
        art = await Art.findById(id);
      } else {
        // Fallback for frontend that uses contentHash for routing
        art = await Art.findOne({ contentHash: id });
      }

      if (!art) {
        return res.status(404).json({ status: "error", message: "Art not found." });
      }
      
      res.status(200).json({ status: "ok", data: art });
    } catch (err) {
      res.status(500).json({ status: "error", message: "Error fetching artwork detail" });
    }
});


router.get("/hash/:hash", async (req, res) => {
  try {
    const art = await Art.findOne({ contentHash: req.params.hash });
    if (!art) return res.status(404).json({ status: "error", message: "Art not found." });
    res.status(200).json({ status: "ok", data: art });
  } catch(err){
    console.log("Error: " , err);
    res.status(500).json({status: "error", data: err});
  }
});



// GET all artworks (Marketplace)
router.get("/", async (req, res) => {
  try {
    const { sort = 'createdAt', order = 'desc', limit = '0' } = req.query;
    
    const sortField = sort as string;
    const sortOrder = order === 'desc' ? -1 : 1;
    const limitCount = parseInt(limit as string);

    const arts = await Art.find({ status: ArtStatus.ACTIVE })
      .sort({ [sortField]: sortOrder })
      .limit(limitCount);

    res.status(200).json({ status: "ok", data: arts });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Error fetching artworks" });
  }
});

// GET artworks by creator
router.get("/creator/:address", async (req, res) => {
  try {
    const arts = await Art.find({ creatorBy: req.params.address }).sort({ createdAt: -1 });
    res.status(200).json({ status: "ok", data: arts });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Error fetching creator's artworks" });
  }
});

// GET artworks by owner
router.get("/owner/:address", async (req, res) => {
  try {
    const arts = await Art.find({ ownedBy: req.params.address }).sort({ createdAt: -1 });
    res.status(200).json({ status: "ok", data: arts });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Error fetching owned artworks" });
  }
});


router.put("/price/:id", async (req, res) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ status: "error", message: "Invalid ID" });
    }
    const {minPrice} = req.body;
    const updated = await Art.findByIdAndUpdate(req.params.id, 
                                                {minPrice: minPrice},
                                                {returnDocument: 'after', runValidators: true});

    if (!updated) return res.status(404).json({status:"error", message:"art not found"});
    res.status(200).json({status:"ok", message:"minprice upadated", data: updated.minPrice});

  }catch (err){
    console.log("Error upadating minprice", err);
    res.status(500).json({status: "error", message:"Error upadating minprice", data : err});
  }
});

router.put("/owner/:id", async (req, res) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ status: "error", message: "Invalid ID" });
    }
    const {ownedBy} = req.body;
    const updated = await Art.findByIdAndUpdate(req.params.id, 
                                                {ownedBy: ownedBy},
                                                {returnDocument: 'after', runValidators: true});

    if (!updated) return res.status(404).json({status:"error", message:"art not found"});

    // LOG REVENUE: Direct Ownership Transfer Fee (Flat 5 ZEB)
    await RevenueService.logRevenue(5, RevenueType.TRANSFER, ownedBy, updated._id);

    res.status(200).json({status:"ok", message:"owner updated", data: updated.ownedBy});
  } catch (err){
    console.log("Error upadating owner", err);
    res.status(500).json({status: "error", message:"Error upadating owner", data : err});
  }
});

// Confirm artwork on-chain (post-Stellar transaction)
router.put("/confirm/:hash", async (req, res) => {
  try {
    const { hash } = req.params;
    const updatedArt = await Art.findOneAndUpdate(
      { contentHash: hash },
      { 
        status: ArtStatus.ACTIVE,
        isMinted: true
      },
      { new: true }
    );

    if (!updatedArt) {
      return res.status(404).json({ status: "error", message: "Artwork not found" });
    }

    res.status(200).json({ 
      status: "ok", 
      message: "Artwork confirmed on-chain", 
      data: updatedArt 
    });
  } catch (err) {
    console.error("Error confirming artwork:", err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});



export default router;

