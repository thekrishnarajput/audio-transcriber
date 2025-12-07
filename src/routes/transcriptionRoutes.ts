import { Router } from 'express';
import { TranscriptionController } from '../controllers/TranscriptionController';
import { TranscriptionService } from '../services/TranscriptionService';
import { AzureSpeechService } from '../services/AzureSpeechService';
import { TranscriptionRepository } from '../repositories/TranscriptionRepository';
import {
  validateTranscriptionRequest,
  validateAzureTranscriptionRequest,
  handleValidationErrors,
} from '../middleware/validation';

const router = Router();

// Initialize services
const transcriptionRepository = new TranscriptionRepository();
const transcriptionService = new TranscriptionService(transcriptionRepository);
const azureSpeechService = new AzureSpeechService();
const transcriptionController = new TranscriptionController(
  transcriptionService,
  azureSpeechService
);

// Routes
router.post(
  '/transcription',
  validateTranscriptionRequest,
  handleValidationErrors,
  transcriptionController.createTranscription
);

router.get('/transcriptions', transcriptionController.getTranscriptions);

router.post(
  '/azure-transcription',
  validateAzureTranscriptionRequest,
  handleValidationErrors,
  transcriptionController.createAzureTranscription
);

export default router;

