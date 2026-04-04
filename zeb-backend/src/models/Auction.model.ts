import mongoose, { Schema, Document } from "mongoose";

export interface IAuction extends Document {
  art_hash: string;
  seller: string;
  bidders: string[];
  highest_bidder: string;
  highest_bid: number;
  start_time: Date;
  end_time: Date;
}

const auctionSchema:Schema<IAuction> = new Schema<IAuction>({
  art_hash: { type: String, required: true, unique: true },
  seller: { type: String, required: true },
  bidders: { type: [String], default: [] },
  highest_bidder: { type: String, default: "" },
  highest_bid: { type: Number, default: 0 },
  start_time: { type: Date, default: Date.now },
  end_time: { type: Date, required: true }
});

export default mongoose.model<IAuction>("Auction", auctionSchema);
