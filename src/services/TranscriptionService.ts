import { TranscriptionRepository } from '../repositories/TranscriptionRepository';
import { mockDownloadAudio } from '../utils/audioDownload';
import { retryWithBackoff } from '../utils/retry';
import { config } from '../config/env';
import { TranscriptionDocument } from '../types';

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
      await retryWithBackoff(
        () => mockDownloadAudio(audioUrl),
        {
          maxAttempts: config.retry.maxAttempts,
          delayMs: config.retry.delayMs,
        }
      );

      // Return dummy transcription
      return 'transcribed text';
    } catch (error) {
      throw new Error(`Transcription failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createTranscription(
    audioUrl: string,
    transcription: string,
    source: 'default' | 'azure' = 'default',
    language?: string
  ): Promise<TranscriptionDocument> {
    const document = await this.repository.create({
      audioUrl,
      transcription,
      source,
      language,
    });

    return {
      _id: document._id?.toString() || '',
      audioUrl: document.audioUrl,
      transcription: document.transcription,
      source: document.source,
      language: document.language,
      createdAt: document.createdAt,
    };
  }

  async getRecentTranscriptions(days: number = 30): Promise<TranscriptionDocument[]> {
    const documents = await this.repository.findRecentTranscriptions(days);
    return documents.map((doc) => ({
      _id: doc._id?.toString() || '',
      audioUrl: doc.audioUrl,
      transcription: doc.transcription,
      source: doc.source,
      language: doc.language,
      createdAt: doc.createdAt,
    }));
  }
}

