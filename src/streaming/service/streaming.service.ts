import { Server as SocketIOServer, Socket } from "socket.io";
import { randomUUID } from "crypto";
import { StreamingSessionRepository } from "../repository/streamingSession.repository";
import { StreamingEvent, AudioChunk } from "../interface/streaming.interface";
import { isDatabaseConnected } from "../../config/database";

export class StreamingService {
  private repository: StreamingSessionRepository;
  private io: SocketIOServer;
  private activeSessions: Map<string, NodeJS.Timeout> = new Map();

  constructor(io: SocketIOServer, repository: StreamingSessionRepository) {
    this.io = io;
    this.repository = repository;
  }

  /**
   * Handles new WebSocket connections
   */
  handleConnection(socket: Socket): void {
    console.log(`Client connected: ${socket.id}`);

    // Generate a unique session ID for this connection
    const sessionId = randomUUID();

    // Send session ID to client
    socket.emit("session:created", { sessionId });

    // Handle audio chunk reception
    socket.on("audio:chunk", async (data: AudioChunk) => {
      try {
        await this.handleAudioChunk(socket, data, sessionId);
      } catch (error) {
        console.error("Error handling audio chunk:", error);
        socket.emit("transcription:error", {
          type: "error",
          data: {
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
            sessionId,
          },
        });
      }
    });

    // Handle session start
    socket.on("session:start", async (data: { audioUrl?: string }) => {
      try {
        await this.startSession(socket, sessionId, data.audioUrl);
      } catch (error) {
        console.error("Error starting session:", error);
        socket.emit("transcription:error", {
          type: "error",
          data: {
            message:
              error instanceof Error
                ? error.message
                : "Failed to start session",
            sessionId,
          },
        });
      }
    });

    // Handle session end
    socket.on("session:end", async () => {
      try {
        await this.endSession(socket, sessionId);
      } catch (error) {
        console.error("Error ending session:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log(`Client disconnected: ${socket.id}`);
      await this.cleanupSession(sessionId);
    });
  }

  /**
   * Starts a new streaming session
   */
  private async startSession(
    socket: Socket,
    sessionId: string,
    audioUrl?: string
  ): Promise<void> {
    if (!isDatabaseConnected()) {
      socket.emit("transcription:error", {
        type: "error",
        data: {
          message: "Database not connected",
          sessionId,
        },
      });
      return;
    }

    try {
      // Create session in database
      await this.repository.create({
        sessionId,
        audioUrl,
        transcription: "",
        partialTranscriptions: [],
        status: "active",
        metadata: {
          chunksReceived: 0,
        },
      });

      socket.emit("session:started", {
        type: "status",
        data: {
          status: "active",
          sessionId,
        },
      });
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  }

  /**
   * Handles incoming audio chunks and streams back transcription
   */
  private async handleAudioChunk(
    socket: Socket,
    data: AudioChunk,
    sessionId: string
  ): Promise<void> {
    if (!isDatabaseConnected()) {
      return;
    }

    // Mock transcription processing - simulate real-time transcription
    // In a real implementation, this would process the audio chunk
    const chunkIndex = data.chunkIndex || 0;

    // Simulate partial transcription (mock)
    const partialTexts = [
      "Hello",
      "Hello world",
      "Hello world, this",
      "Hello world, this is",
      "Hello world, this is a",
      "Hello world, this is a test",
      "Hello world, this is a test transcription",
    ];

    // Get a partial transcription based on chunk index
    const partialIndex = Math.min(chunkIndex, partialTexts.length - 1);
    const partialTranscription = partialTexts[partialIndex];

    // Save partial transcription to database
    try {
      await this.repository.addPartialTranscription(
        sessionId,
        partialTranscription
      );
    } catch (error) {
      console.error("Error saving partial transcription:", error);
    }

    // Emit partial transcription to client
    const event: StreamingEvent = {
      type: "partial",
      data: {
        partial: partialTranscription,
        sessionId,
      },
    };

    socket.emit("transcription:partial", event);

    // Simulate final transcription after a few chunks
    if (chunkIndex >= 5) {
      const finalTranscription = "Hello world, this is a test transcription";

      // Complete the session
      try {
        await this.repository.completeSession(sessionId, finalTranscription);
      } catch (error) {
        console.error("Error completing session:", error);
      }

      // Emit final transcription
      const finalEvent: StreamingEvent = {
        type: "final",
        data: {
          transcription: finalTranscription,
          sessionId,
        },
      };

      socket.emit("transcription:final", finalEvent);
    }
  }

  /**
   * Ends a streaming session
   */
  private async endSession(socket: Socket, sessionId: string): Promise<void> {
    if (!isDatabaseConnected()) {
      return;
    }

    try {
      const session = await this.repository.findBySessionId(sessionId);
      if (session && session.status === "active") {
        // Complete the session with current transcription
        const finalTranscription =
          session.transcription ||
          session.partialTranscriptions[
            session.partialTranscriptions.length - 1
          ] ||
          "";

        await this.repository.completeSession(sessionId, finalTranscription);

        socket.emit("session:ended", {
          type: "status",
          data: {
            status: "completed",
            sessionId,
            transcription: finalTranscription,
          },
        });
      }
    } catch (error) {
      console.error("Error ending session:", error);
      await this.repository.markSessionError(
        sessionId,
        error instanceof Error ? error.message : "Unknown error"
      );
    }

    this.cleanupSession(sessionId);
  }

  /**
   * Cleans up session resources
   */
  private async cleanupSession(sessionId: string): Promise<void> {
    // Clear any timers associated with this session
    const timeout = this.activeSessions.get(sessionId);
    if (timeout) {
      clearTimeout(timeout);
      this.activeSessions.delete(sessionId);
    }
  }
}
