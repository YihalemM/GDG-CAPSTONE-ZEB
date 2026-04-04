import mongoose, { Schema, Document } from "mongoose";

export enum ActivityType {
  MINTED = "minted",
  LISTING = "listing",
  SALE = "sale",
  BID = "bid",
  CANCELLED = "cancelled",
}

export interface IActivity extends Document {
  type: ActivityType;
  artId: mongoose.Types.ObjectId;
  from?: string; // Wallet address
  to?: string;   // Wallet address
  amount?: number;
  transactionHash?: string; // On-chain TX
  timestamp: Date;
}

const ActivitySchema: Schema = new Schema(
  {
    type: { type: String, enum: Object.values(ActivityType), required: true },
    artId: { type: Schema.Types.ObjectId, ref: "Art", required: true },
    from: { type: String },
    to: { type: String },
    amount: { type: Number },
    transactionHash: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IActivity>("Activity", ActivitySchema);
