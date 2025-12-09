import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri:
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://localhost:27017/voiceowl",
  azure: {
    speechKey: process.env.AZURE_SPEECH_KEY || "",
    speechRegion: process.env.AZURE_SPEECH_REGION || "",
  },
  retry: {
    maxAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || "3", 10),
    delayMs: parseInt(process.env.RETRY_DELAY_MS || "1000", 10),
  },
  // Allow app to start without database (for testing)
  allowStartWithoutDB: process.env.ALLOW_START_WITHOUT_DB === "true",
};
