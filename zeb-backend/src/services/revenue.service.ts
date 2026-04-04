import Revenue, { RevenueType } from "../models/Revenue.model.js";
import mongoose from "mongoose";

export class RevenueService {
  /**
   * Logs a new revenue transaction to the database.
   */
  static async logRevenue(
    amount: number,
    type: RevenueType,
    sourceAddress: string,
    artId?: string | mongoose.Types.ObjectId
  ) {
    try {
      const revenue = new Revenue({
        amount,
        type,
        sourceAddress,
        artId: artId ? new mongoose.Types.ObjectId(artId.toString()) : undefined,
        timestamp: new Date()
      });
      await revenue.save();
      return revenue;
    } catch (error) {
      console.error("Error logging revenue:", error);
      // We don't throw here to avoid breaking the main transaction, 
      // but in production we'd want more robust logging/retries.
    }
  }

  /**
   * Gets aggregated revenue statistics for the admin dashboard.
   */
  static async getStats() {
    const stats = await Revenue.aggregate([
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    const recentTransactions = await Revenue.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate("artId", "title");

    return {
      stats: stats.reduce((acc: any, curr: any) => {
        acc[curr._id] = { total: curr.totalAmount, count: curr.count };
        return acc;
      }, {}),
      recentTransactions
    };
  }
}
