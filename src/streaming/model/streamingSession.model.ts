import mongoose, { Schema, Document } from "mongoose";

export interface IStreamingSession extends Document {
  sessionId: string;
  audioUrl?: string;
  transcription: string;
  partialTranscriptions: string[];
  status: "active" | "completed" | "error";
  createdAt: Date;
  completedAt?: Date;
  metadata?: {
    chunksReceived: number;
    totalDuration?: number;
  };
}

const StreamingSessionSchema = new Schema<IStreamingSession>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    audioUrl: {
      type: String,
    },
    transcription: {
      type: String,
      default: "",
    },
    partialTranscriptions: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "completed", "error"],
      default: "active",
      index: true,
    },
    completedAt: {
      type: Date,
    },
    metadata: {
      chunksReceived: {
        type: Number,
        default: 0,
      },
      totalDuration: {
        type: Number,
      },
    },
  },
  {
    timestamps: false,
  }
);

// Index for querying active sessions
StreamingSessionSchema.index({ status: 1, createdAt: -1 });
// Index for session lookup
StreamingSessionSchema.index({ sessionId: 1 });

export const StreamingSession = mongoose.model<IStreamingSession>(
  "StreamingSession",
  StreamingSessionSchema
);
