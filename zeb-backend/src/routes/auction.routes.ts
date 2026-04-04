import express from "express";
import { Types } from "mongoose";
import Auction from "../models/Auction.model.js";
import Art from "../models/Art.model.js";
import Activity, { ActivityType } from "../models/Activity.model.js";
import { RevenueService } from "../services/revenue.service.js";
import { RevenueType } from "../models/Revenue.model.js";

const router = express.Router();
/**
 * GET ALL ACTIVE AUCTIONS
 */
router.get("/", async (req, res) => {
  try {
    const auctions = await Auction.aggregate([
      {
        $match: {
          end_time: { $gt: new Date() }
        }
      },
      {
        $lookup: {
          from: "arts",
          localField: "art_hash",
          foreignField: "contentHash",
          as: "artwork"
        }
      },
      {
        $unwind: "$artwork"
      },
      {
        $sort: { start_time: -1 }
      }
    ]);

    return res.status(200).json({
      status: "ok",
      data: auctions
    });
  } catch (err) {
    console.error("Error fetching auctions:", err);
    return res.status(500).json({ status: "error", message: "error fetching auctions" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { art_hash, seller, end_time } = req.body;

    const artwork = await Art.findOne({ contentHash: art_hash });
    if (!artwork) {
      return res.status(404).json({ status: "error", message: "Art not found" });
    }

    const existing = await Auction.findOne({ art_hash });
    if (existing && existing.end_time.getTime() > Date.now()) {
      return res.status(401).json({ status: "error", message: "auction exists" });
    }
    
    if (new Date(end_time).getTime() < Date.now()) 
      return res.status(401).json({status: "error", message:"Invalid Auction"});

    const auction = new Auction({
      art_hash,
      seller,
      end_time
    });

    await auction.save();

    // LOG ACTIVITY: LISTING
    await Activity.create({
       type: ActivityType.LISTING,
       artId: artwork._id,
       from: seller,
       timestamp: new Date()
    });

    return res.status(201).json({
      status: "ok",
      message: "auction created",
      data: auction
    });
  } catch (err) {
    console.log("Error creating an auction", err);
    return res.status(500).json({ status: "error", message: "error creating auction" });
  }
});

router.put("/bid", async (req, res) => {
  try {
    const { art_hash, bidder, amount } = req.body;

    const updated = await Auction.findOneAndUpdate(
      {
        art_hash,
        highest_bid: { $lt: amount },
        seller: { $ne: bidder },
        end_time: { $gt: new Date() }
      },
      {
        $set: {
          highest_bid: amount,
          highest_bidder: bidder
        },
        $addToSet: { bidders: bidder }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(400).json({
        status: "error",
        message: "invalid bid or auction not found"
      });
    }

    const artwork = await Art.findOne({ contentHash: art_hash });
    if (!artwork) return res.status(404).json({ status: "error", message: "Artwork not found" });

    // LOG ACTIVITY: BID
    await Activity.create({
       artId: artwork._id,
       type: ActivityType.BID,
       from: bidder,
       amount: amount,
       timestamp: new Date()
    });

    return res.status(200).json({
      status: "ok",
      message: "bid placed",
      data: updated._id
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: "error placing bid" });
  }
});

router.get("/id/:id", async (req, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ status: "error", message: "invalid id" });
  }

  const auction = await Auction.findById(req.params.id);
  if (!auction) {
    return res.status(404).json({ status: "error", message: "auction not found" });
  }

  return res.status(200).json({ status: "ok", data: auction });
});

router.get("/art/:art_hash", async (req, res) => {
  const auction = await Auction.findOne({ art_hash: req.params.art_hash });
  if (!auction) {
    return res.status(404).json({ status: "error", message: "auction not found" });
  }

  return res.status(200).json({ status: "ok", data: auction });
});

router.delete("/close/:art_hash", async (req, res) => {
  try {
    const { art_hash } = req.params;
    const { seller } = req.body;

    const auction = await Auction.findOne({ art_hash });
    if (!auction) {
      return res.status(404).json({
        status: "error",
        message: "auction not found"
      });
    }

    if (auction.seller !== seller) {
      return res.status(403).json({
        status: "error",
        message: "not authorized"
      });
    }

    const closed = await Auction.findOneAndUpdate(
      { art_hash },
      { $set: { end_time: new Date() } },
      { new: true }
    );

    if (closed && closed.highest_bidder) {
      const artwork = await Art.findOneAndUpdate(
        { contentHash: art_hash },
        { $set: { ownedBy: closed.highest_bidder } }
      );

      // LOG REVENUE: 
      // 1. Ownership Transfer Fee (Flat 5 ZEB)
      await RevenueService.logRevenue(5, RevenueType.TRANSFER, closed.highest_bidder, undefined);
      
      // 2. Bidding Commission (2.5% of final bid)
      const commission = closed.highest_bid * 0.025;
      await RevenueService.logRevenue(commission, RevenueType.BIDDING, closed.seller, undefined);

      // LOG ACTIVITY: SALE
      if (artwork) {
        await Activity.create({
           type: ActivityType.SALE,
           artId: artwork._id,
           from: closed.seller,
           to: closed.highest_bidder,
           amount: closed.highest_bid,
           timestamp: new Date()
        });
      }
    }

    return res.status(200).json({
      status: "ok",
      message: closed && closed.highest_bidder ? `auction closed and owner updated to ${closed.highest_bidder}` : "auction closed (no bids)",
      data: closed?._id
    });

  } catch (err) {
    console.error("error closing auction", err);
    return res.status(500).json({
      status: "error",
      message: "error closing auction"
    });
  }
});

router.get("/bidders/:art_hash", async (req, res) => {
  try{
    const auction = await Auction.findOne({art_hash: req.params.art_hash});
    if (!auction) {
      return res.status(404).json({
        status: "error",
        message: "auction not found"
      });
    }
    res.status(200).json({status: "ok", data: auction.bidders});
  }catch (err) {
    console.error("error fetching bidders", err);
    return res.status(500).json({
      status: "error",
      message: "error feching bidders"
    });
  }
});


router.get("/highest_bid/:art_hash", async (req, res) => {
  try{
    const auction = await Auction.findOne({art_hash: req.params.art_hash});
    if (!auction) {
      return res.status(404).json({
        status: "error",
        message: "auction not found"
      });
    }
    res.status(200).json({status: "ok", data: [auction.highest_bidder, auction.highest_bid]});
  }catch (err) {
    console.log("error fetching highest_bid", err);
    return res.status(500).json({
      status: "error",
      message: "error fetching highest_bid"
    });
  }
});



export default router;
