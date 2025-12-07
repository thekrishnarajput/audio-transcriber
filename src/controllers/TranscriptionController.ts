import { Request, Response, NextFunction } from 'express';
import { TranscriptionService } from '../services/TranscriptionService';
import { AzureSpeechService } from '../services/AzureSpeechService';
import { AppError } from '../middleware/errorHandler';
import { TranscriptionRequest, AzureTranscriptionRequest } from '../types';

export class TranscriptionController {
  private transcriptionService: TranscriptionService;
  private azureSpeechService: AzureSpeechService;

  constructor(
    transcriptionService: TranscriptionService,
    azureSpeechService: AzureSpeechService
  ) {
    this.transcriptionService = transcriptionService;
    this.azureSpeechService = azureSpeechService;
  }

  /**
   * POST /transcription
   * Creates a transcription using the default mock transcription service.
   */
  createTranscription = async (
    req: Request<{}, {}, TranscriptionRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { audioUrl } = req.body;

      const transcription = await this.transcriptionService.transcribeAudio(audioUrl);
      const document = await this.transcriptionService.createTranscription(
        audioUrl,
        transcription,
        'default'
      );

      res.status(201).json({
        id: document._id,
        message: 'Transcription created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /transcriptions
   * Fetches transcriptions created in the last 30 days.
   */
  getTranscriptions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const transcriptions = await this.transcriptionService.getRecentTranscriptions(days);

      res.json({
        count: transcriptions.length,
        transcriptions,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /azure-transcription
   * Creates a transcription using Azure Speech-to-Text service.
   */
  createAzureTranscription = async (
    req: Request<{}, {}, AzureTranscriptionRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { audioUrl, language = 'en-US' } = req.body;

      const transcription = await this.azureSpeechService.transcribeAudio(audioUrl, language);
      const document = await this.transcriptionService.createTranscription(
        audioUrl,
        transcription,
        'azure',
        language
      );

      res.status(201).json({
        id: document._id,
        message: 'Azure transcription created successfully',
        source: 'azure',
      });
    } catch (error) {
      const appError: AppError = error instanceof Error ? error : new Error(String(error));
      appError.statusCode = 500;
      next(appError);
    }
  };
}

