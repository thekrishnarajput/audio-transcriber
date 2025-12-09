import mongoose from "mongoose";
import { config } from "./env";

let isConnected = false;
let connectionAttempted = false;

/**
 * Connects to MongoDB database with graceful error handling.
 * If connection fails, the application will still start but database operations will fail.
 *
 * @returns {Promise<boolean>} Returns true if connected successfully, false otherwise
 */
export const connectDatabase = async (): Promise<boolean> => {
  if (isConnected) {
    return true;
  }

  connectionAttempted = true;

  try {
    // Set connection options for better error handling
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    await mongoose.connect(config.mongodbUri, options);
    isConnected = true;
    console.log("✅ Connected to MongoDB");

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
      isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
      isConnected = true;
    });

    return true;
  } catch (error: any) {
    isConnected = false;
    console.error("❌ MongoDB connection error:", error.message);
    console.warn(
      "⚠️ Application will start without database connection. Some features may not work."
    );
    console.warn(
      "💡 To fix: Ensure MongoDB is running or set MONGODB_URI environment variable"
    );
    return false;
  }
};

/**
 * Disconnects from MongoDB database.
 */
export const disconnectDatabase = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ MongoDB disconnection error:", error);
  }
};

/**
 * Checks if MongoDB is currently connected.
 *
 * @returns {boolean} True if connected, false otherwise
 */
export const isDatabaseConnected = (): boolean => {
  return isConnected && mongoose.connection.readyState === 1;
};

/**
 * Gets the current database connection status.
 *
 * @returns {object} Connection status information
 */
export const getDatabaseStatus = () => {
  return {
    connected: isDatabaseConnected(),
    attempted: connectionAttempted,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || "N/A",
    name: mongoose.connection.name || "N/A",
  };
};
