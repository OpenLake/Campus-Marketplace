import mongoose from "mongoose";

const idempotencyKeySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    actor: { type: String, required: true }, // postgres user uuid
    endpoint: { type: String, required: true },
    requestHash: { type: String }, // hash of body parameters (optional)
    responseBody: { type: mongoose.Schema.Types.Mixed }, // saved response payload
    responseStatus: { type: Number },
    expiresAt: { type: Date, required: true }
  },
  {
    timestamps: true,
    collection: "idempotency_keys"
  }
);

// TTL index to automatically remove idempotency keys after expiry
idempotencyKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const IdempotencyKey = mongoose.model("IdempotencyKey", idempotencyKeySchema);
