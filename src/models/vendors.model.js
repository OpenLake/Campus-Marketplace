import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const vendorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    shopName: { type: String, required: true },
    description: { type: String },
    licenseNo: { type: String },
    categories: [{ type: String }],
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        value: Number,
      },
    ],
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

vendorSchema.plugin(mongoosePaginate);

export const Vendor = mongoose.model("Vendor", vendorSchema);
