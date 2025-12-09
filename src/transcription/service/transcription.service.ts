import { TranscriptionRepository } from "../repository/transcription.repository";
import { mockDownloadAudio } from "../../utils/common/functions/audioDownload";
import { retryWithBackoff } from "../../utils/common/functions/retry";
import { config } from "../../config/env";
import { TranscriptionDocument } from "../interface/transcription.interface";

export class TranscriptionService {
  private repository: TranscriptionRepository;

  constructor(repository: TranscriptionRepository) {
    this.repository = repository;
  }

  /**
   * Mock transcription: Downloads audio (mocked) and returns a dummy transcription.
   */
  async transcribeAudio(audioUrl: string): Promise<string> {
    try {
      // Mock download with retry logic
      // Skip validation in development mode to allow testing with any URL
      await retryWithBackoff(
        () => mockDownloadAudio(audioUrl, config.nodeEnv !== "production"),
        {
          maxAttempts: config.retry.maxAttempts,
          delayMs: config.retry.delayMs,
        }
      );

      // Return dummy transcription
      return "transcribed text";
    } catch (error) {
      // Only throw error if it's a URL format error, not a validation error
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("Invalid URL format")) {
        throw new Error(`Transcription failed: ${errorMessage}`);
      }
      // For other errors (like 404/403), continue with mock transcription in development
      if (config.nodeEnv === "development") {
        console.warn(
          `⚠️ Development mode: Continuing with mock transcription despite error: ${errorMessage}`
        );
        return "transcribed text";
      }
      throw new Error(`Transcription failed: ${errorMessage}`);
    }
  }

  async createTranscription(
    audioUrl: string,
    transcription: string,
    source: "default" | "azure" = "default",
    language?: string
  ): Promise<TranscriptionDocument> {
    const document = await this.repository.create({
      audioUrl,
      transcription,
      source,
      language,
    });

    return {
      _id: document._id?.toString() || "",
      audioUrl: document.audioUrl,
      transcription: document.transcription,
      source: document.source,
      language: document.language,
      createdAt: document.createdAt,
    };
  }

  async getRecentTranscriptions(
    days: number = 30
  ): Promise<TranscriptionDocument[]> {
    const documents = await this.repository.findRecentTranscriptions(days);
    return documents.map((doc) => ({
      _id: doc._id?.toString() || "",
      audioUrl: doc.audioUrl,
      transcription: doc.transcription,
      source: doc.source,
      language: doc.language,
      createdAt: doc.createdAt,
    }));
  }
}
