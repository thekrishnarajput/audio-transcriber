import mongoose, { Schema, Document } from "mongoose";

export interface ITranscription extends Document {
  audioUrl: string;
  transcription: string;
  source: "default" | "azure";
  language?: string;
  createdAt: Date;
}

const TranscriptionSchema = new Schema<ITranscription>(
  {
    audioUrl: {
      type: String,
      required: true,
      index: true,
    },
    transcription: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ["default", "azure"],
      default: "default",
      index: true,
    },
    language: {
      type: String,
      default: "en-US",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index for efficient querying of last 30 days
// This index supports queries filtering by createdAt date range
TranscriptionSchema.index({ createdAt: -1 });

// Compound index for source and createdAt (useful for filtering by source and date)
TranscriptionSchema.index({ source: 1, createdAt: -1 });

export const Transcription = mongoose.model<ITranscription>(
  "Transcription",
  TranscriptionSchema
);
