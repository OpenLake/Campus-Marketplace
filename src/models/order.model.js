import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "in-progress", "delivered"],
      default: "pending",
    },
    address: {
      hostel: String,
      roomNo: String,
      city: String,
      state: String,
      pincode: String,
    },
    transactionId: { type: String }, // Razorpay/Stripe txn ID
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
