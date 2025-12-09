export interface StreamingEvent {
  type: "partial" | "final" | "error" | "status";
  data: {
    partial?: string;
    transcription?: string;
    message?: string;
    status?: string;
    sessionId?: string;
  };
}

export interface AudioChunk {
  chunk: string | Buffer;
  chunkIndex: number;
  sessionId?: string;
  timestamp?: number;
}

export interface StreamingSessionDocument {
  _id?: string;
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
