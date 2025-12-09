import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import helmet from "helmet";
import hpp from "hpp";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// Import modules
import { urlNotFound } from "./utils/middlewares/urlNotFoundHandler";
import { limiter } from "./utils/middlewares/rateLimiter";
import { errorHandler } from "./utils/middlewares/errorHandler";
import { swaggerUIExpress } from "./utils/common/functions/swagger";
import { transcriptionRouter } from "./transcription/router/transcription.routes";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { StreamingService } from "./streaming/service/streaming.service";
import { StreamingSessionRepository } from "./streaming/repository/streamingSession.repository";

const swaggerDocument = require("../swagger.json");

// Initialize the express app
const app = express();

// Create HTTP server for Socket.IO
const httpServer = createServer(app);

// If behind a proxy (e.g., when using services like Heroku, AWS ELB, etc.)
// Trust only 1 proxy (usually the first in the chain)
app.set("trust proxy", 1); // or true, trust all proxies in the chain (less secure, more permissive)

const PORT = process.env.PORT || 3000;

if (!PORT) {
  process.exit(1);
}

/* App configuration */

// cors() enables cross-origin requests for api
app.use(cors());

// express.json() parses JSON data in request bodies
app.use(express.json({ limit: "1024mb" }));

// To accept the data from nested fields in request
app.use(express.urlencoded({ extended: true, limit: "1024mb" }));

// helmet() adds security-related HTTP headers
app.use(helmet());

// Express middleware to protect against HTTP Parameter Pollution attacks
app.use(hpp());

// Rate limit to 100 per 15 minutes
app.use(limiter);

/* Routing */

// swagger
app.use(
  "/api-docs",
  swaggerUIExpress.serve,
  swaggerUIExpress.setup(swaggerDocument)
);

app.use("/health", (req, res) => {
  const { getDatabaseStatus } = require("./config/database");
  const dbStatus = getDatabaseStatus();

  res.status(200).json({
    status: "ok",
    message: "API is healthy",
    database: {
      connected: dbStatus.connected,
      host: dbStatus.host,
      name: dbStatus.name,
    },
  });
});

app.use("/api", transcriptionRouter);

// URL not found handler middleware
app.use(urlNotFound);

// Error handling middleware
app.use(errorHandler);

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*", // In production, specify allowed origins
    methods: ["GET", "POST"],
  },
});

// Initialize streaming service
const streamingRepository = new StreamingSessionRepository();
const streamingService = new StreamingService(io, streamingRepository);

// Handle WebSocket connections
io.on("connection", (socket) => {
  streamingService.handleConnection(socket);
});

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Attempt database connection (non-blocking)
    const dbConnected = await connectDatabase();
    if (!dbConnected) {
      console.warn(
        "⚠️ Server starting without database connection. Some endpoints may not work."
      );
    }

    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`WebSocket server: Ready for connections`);
      if (dbConnected) {
        console.log(`Database: Connected`);
      } else {
        console.log(`Database: Not connected (check MongoDB connection)`);
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await disconnectDatabase();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  await disconnectDatabase();
  process.exit(0);
});

startServer();
