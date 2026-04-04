import mongoose, { Schema, Document } from "mongoose";

export enum RevenueType {
  REGISTRATION = "registration",
  TRANSFER = "transfer",
  BIDDING = "bidding"
}

export interface IRevenue extends Document {
  amount: number;
  type: RevenueType;
  sourceAddress: string;
  artId?: mongoose.Types.ObjectId;
  timestamp: Date;
}

const revenueSchema: Schema<IRevenue> = new Schema<IRevenue>({
  amount: { type: Number, required: true },
  type: { type: String, enum: Object.values(RevenueType), required: true },
  sourceAddress: { type: String, required: true },
  artId: { type: Schema.Types.ObjectId, ref: "Art" },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IRevenue>("Revenue", revenueSchema);
