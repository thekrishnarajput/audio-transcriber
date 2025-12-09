import {
  StreamingSession,
  IStreamingSession,
} from "../model/streamingSession.model";
import { StreamingSessionDocument } from "../interface/streaming.interface";
import { isDatabaseConnected } from "../../config/database";

export class StreamingSessionRepository {
  private checkConnection(): void {
    if (!isDatabaseConnected()) {
      throw new Error(
        "Database not connected. Please ensure MongoDB is running and accessible."
      );
    }
  }

  async create(
    data: Omit<StreamingSessionDocument, "_id" | "createdAt">
  ): Promise<IStreamingSession> {
    this.checkConnection();
    const session = new StreamingSession({
      ...data,
      createdAt: new Date(),
    });
    return await session.save();
  }

  async findBySessionId(sessionId: string): Promise<IStreamingSession | null> {
    this.checkConnection();
    return await StreamingSession.findOne({ sessionId });
  }

  async updateSession(
    sessionId: string,
    updates: Partial<StreamingSessionDocument>
  ): Promise<IStreamingSession | null> {
    this.checkConnection();
    return await StreamingSession.findOneAndUpdate(
      { sessionId },
      { $set: updates },
      { new: true }
    );
  }

  async addPartialTranscription(
    sessionId: string,
    partial: string
  ): Promise<IStreamingSession | null> {
    this.checkConnection();
    // Find the session first to ensure it exists
    const session = await StreamingSession.findOne({ sessionId });
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Initialize metadata if it doesn't exist
    if (!session.metadata) {
      session.metadata = { chunksReceived: 0 };
    }

    // Add partial transcription and increment chunk count
    if (!session.partialTranscriptions) {
      session.partialTranscriptions = [];
    }
    session.partialTranscriptions.push(partial);
    session.metadata.chunksReceived =
      (session.metadata.chunksReceived || 0) + 1;

    return await session.save();
  }

  async completeSession(
    sessionId: string,
    finalTranscription: string
  ): Promise<IStreamingSession | null> {
    this.checkConnection();
    return await StreamingSession.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          transcription: finalTranscription,
          status: "completed",
          completedAt: new Date(),
        },
      },
      { new: true }
    );
  }

  async markSessionError(
    sessionId: string,
    errorMessage: string
  ): Promise<IStreamingSession | null> {
    this.checkConnection();
    return await StreamingSession.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          status: "error",
          transcription: errorMessage,
          completedAt: new Date(),
        },
      },
      { new: true }
    );
  }
}
