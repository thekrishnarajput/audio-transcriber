import { Router } from "express";
import { TranscriptionController } from "../controller/transcription.controller";
import { TranscriptionService } from "../service/transcription.service";
import { AzureSpeechService } from "../service/azureSpeech.service";
import { TranscriptionRepository } from "../repository/transcription.repository";
import { validations } from "../../utils/middlewares/validationHandler";

export const transcriptionRouter = Router();

// Initialize services
const transcriptionRepository = new TranscriptionRepository();
const transcriptionService = new TranscriptionService(transcriptionRepository);
const azureSpeechService = new AzureSpeechService();
const transcriptionController = new TranscriptionController(
  transcriptionService,
  azureSpeechService
);

// Routes
transcriptionRouter.post(
  "/transcription",
  validations(["audioUrl"]),
  transcriptionController.createTranscription
);

transcriptionRouter.get(
  "/transcriptions",
  transcriptionController.getTranscriptions
);

transcriptionRouter.post(
  "/azure-transcription",
  validations(["audioUrl"]),
  transcriptionController.createAzureTranscription
);
