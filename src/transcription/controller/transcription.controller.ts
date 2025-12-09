import { HttpStatus } from "../../utils/common/enums/httpStatusCodes";
import { messages } from "../../utils/common/functions/message";
import { printLogger } from "../../utils/common/functions/logger";
import { LoggerType } from "../../utils/common/functions/logger";
import {
  INextFunction,
  IRequest,
  IResponse,
} from "../../utils/common/interfaces/types.interface";
import { response } from "../../utils/middlewares/response";
import { TranscriptionService } from "../service/transcription.service";
import { AzureSpeechService } from "../service/azureSpeech.service";
import {
  TranscriptionRequest,
  AzureTranscriptionRequest,
} from "../interface/transcription.interface";

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
    req: IRequest,
    res: IResponse,
    next: INextFunction
  ): Promise<void> => {
    try {
      const { audioUrl } = req.body;

      const transcription =
        await this.transcriptionService.transcribeAudio(audioUrl);
      const document = await this.transcriptionService.createTranscription(
        audioUrl,
        transcription,
        "default"
      );

      return response(
        res,
        HttpStatus.Created,
        true,
        messages.transcriptionCreated(),
        {
          id: document._id,
        }
      );
    } catch (error: any) {
      console.error("Catch error:-", error);
      printLogger(
        LoggerType.error,
        error.message,
        "createTranscription",
        req?.subdomain || "NA"
      );
      next(error);
    }
  };

  /**
   * GET /transcriptions
   * Fetches transcriptions created in the last 30 days.
   */
  getTranscriptions = async (
    req: IRequest,
    res: IResponse,
    next: INextFunction
  ): Promise<void> => {
    try {
      const days = parseInt((req.query.days as string) || "30");
      const transcriptions =
        await this.transcriptionService.getRecentTranscriptions(days);

      return response(res, HttpStatus.Ok, true, messages.dataFound(), {
        count: transcriptions.length,
        transcriptions,
      });
    } catch (error: any) {
      console.error("Catch error:-", error);
      printLogger(
        LoggerType.error,
        error.message,
        "getTranscriptions",
        req?.subdomain || "NA"
      );
      next(error);
    }
  };

  /**
   * POST /azure-transcription
   * Creates a transcription using Azure Speech-to-Text service.
   */
  createAzureTranscription = async (
    req: IRequest,
    res: IResponse,
    next: INextFunction
  ): Promise<void> => {
    try {
      const { audioUrl, language = "en-US" } = req.body;

      const transcription = await this.azureSpeechService.transcribeAudio(
        audioUrl,
        language
      );
      const document = await this.transcriptionService.createTranscription(
        audioUrl,
        transcription,
        "azure",
        language
      );

      return response(
        res,
        HttpStatus.Created,
        true,
        messages.azureTranscriptionCreated(),
        {
          id: document._id,
          source: "azure",
        }
      );
    } catch (error: any) {
      console.error("Catch error:-", error);
      printLogger(
        LoggerType.error,
        error.message,
        "createAzureTranscription",
        req?.subdomain || "NA"
      );
      next(error);
    }
  };
}
