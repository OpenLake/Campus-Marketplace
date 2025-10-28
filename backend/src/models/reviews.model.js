import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

reviewSchema.plugin(mongoosePaginate);

export const Review = mongoose.model("Review", reviewSchema);
