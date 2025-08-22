import mongoose from "mongoose";

const MESSAGE_TYPES = ["text", "image", "file"];
const CHAT_TYPES = ["direct", "group"];

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageType: {
      type: String,
      enum: MESSAGE_TYPES,
      default: "text",
    },
    content: {
      type: String,
      required: function () {
        return this.messageType === "text";
      },
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    attachments: [
      {
        type: String,
        enum: ["image", "document"],
        url: { type: String, required: true },
        fileName: { type: String },
      },
    ],
    readBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        readAt: { type: Date, default: Date.now },
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const chatSchema = new mongoose.Schema(
  {
    chatType: {
      type: String,
      enum: CHAT_TYPES,
      default: "direct",
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        joinedAt: { type: Date, default: Date.now },
        lastSeen: { type: Date, default: Date.now },
      },
    ],
    messages: [messageSchema],
    lastMessage: {
      content: { type: String },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      timestamp: { type: Date },
    },
    isActive: { type: Boolean, default: true },
    relatedListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
    },
  },
  {
    timestamps: true,
  }
);

// Virtuals
chatSchema.virtual("isDirectMessage").get(function () {
  return this.chatType === "direct" && this.participants.length === 2;
});

// Middleware
chatSchema.pre("save", function (next) {
  // Update last message
  if (this.isModified("messages") && this.messages.length > 0) {
    const lastMsg = this.messages[this.messages.length - 1];
    this.lastMessage = {
      content: lastMsg.content,
      sender: lastMsg.sender,
      timestamp: lastMsg.createdAt || new Date(),
    };
  }
  next();
});

// Message Methods
messageSchema.methods.markAsRead = function (userId) {
  const existingRead = this.readBy.find(
    (r) => r.user.toString() === userId.toString()
  );
  if (!existingRead) {
    this.readBy.push({ user: userId });
  }
};

// Chat Methods
chatSchema.methods.addMessage = function (
  senderId,
  content,
  messageType = "text"
) {
  const message = {
    sender: senderId,
    content,
    messageType,
  };

  this.messages.push(message);
  return this.save();
};

chatSchema.methods.addParticipant = function (userId) {
  const existing = this.participants.find(
    (p) => p.user.toString() === userId.toString()
  );
  if (!existing) {
    this.participants.push({ user: userId });
  }
  return this.save();
};

// Static Methods
chatSchema.statics.findOrCreateDirectChat = async function (user1Id, user2Id) {
  let chat = await this.findOne({
    chatType: "direct",
    "participants.user": { $all: [user1Id, user2Id] },
  }).populate("participants.user", "name username");

  if (!chat) {
    chat = new this({
      chatType: "direct",
      participants: [{ user: user1Id }, { user: user2Id }],
    });
    await chat.save();
    await chat.populate("participants.user", "name username");
  }

  return chat;
};

chatSchema.statics.getChatsForUser = function (userId, limit = 20) {
  return this.find({
    "participants.user": userId,
    isActive: true,
  })
    .populate("participants.user", "name username")
    .populate("lastMessage.sender", "name username")
    .sort({ updatedAt: -1 })
    .limit(limit);
};

// Indexes
chatSchema.index({ "participants.user": 1 });
chatSchema.index({ chatType: 1, isActive: 1 });
chatSchema.index({ relatedListing: 1 });
messageSchema.index({ sender: 1, createdAt: -1 });

export default mongoose.model("Chat", chatSchema);
