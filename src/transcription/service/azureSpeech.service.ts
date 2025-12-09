import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { config } from "../../config/env";
import { mockDownloadAudio } from "../../utils/common/functions/audioDownload";
import { retryWithBackoff } from "../../utils/common/functions/retry";

export class AzureSpeechService {
  private speechConfig: sdk.SpeechConfig | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const { speechKey, speechRegion } = config.azure;

    if (
      speechKey &&
      speechRegion &&
      speechKey !== "your_azure_speech_key_here"
    ) {
      try {
        this.speechConfig = sdk.SpeechConfig.fromSubscription(
          speechKey,
          speechRegion
        );
        this.isConfigured = true;
        console.log("✅ Azure Speech Service configured");
      } catch (error) {
        console.warn(
          "⚠️ Azure Speech Service configuration failed, will use mock:",
          error
        );
        this.isConfigured = false;
      }
    } else {
      console.warn(
        "⚠️ Azure Speech credentials not provided, will use mock transcription"
      );
      this.isConfigured = false;
    }
  }

  /**
   * Transcribes audio using Azure Speech-to-Text or returns mock transcription if not configured.
   */
  async transcribeAudio(
    audioUrl: string,
    language: string = "en-US"
  ): Promise<string> {
    if (!this.isConfigured || !this.speechConfig) {
      // Fallback to mock transcription
      return this.mockTranscribe(audioUrl);
    }

    try {
      // Mock download (in production, you'd use the actual audio file)
      // Skip validation in development mode to allow testing with any URL
      await retryWithBackoff(
        () => mockDownloadAudio(audioUrl, config.nodeEnv !== "production"),
        {
          maxAttempts: config.retry.maxAttempts,
          delayMs: config.retry.delayMs,
          exponentialBackoff: true,
        }
      );

      // For this implementation, we'll use a push audio input stream
      // In production, you'd configure this based on your audio format
      // const pushStream = sdk.AudioInputStream.createPushStream();

      // Since we're mocking the download, we'll use a mock transcription
      // In a real implementation, you would:
      // 1. Convert audioBuffer to the correct format
      // 2. Push it to pushStream
      // 3. Create audioConfig from pushStream
      // 4. Create recognizer and perform recognition

      // For now, return mock transcription with exponential backoff retry simulation
      return await this.performAzureTranscription(audioUrl, language);
    } catch (error) {
      console.error("Azure transcription error:", error);
      // Fallback to mock on error
      return this.mockTranscribe(audioUrl);
    }
  }

  private async performAzureTranscription(
    audioUrl: string,
    language: string
  ): Promise<string> {
    // Since we're mocking audio downloads, we'll use mock transcription
    // In production, you would:
    // 1. Download the actual audio file from audioUrl
    // 2. Convert it to a format Azure supports (WAV, MP3, etc.)
    // 3. Use sdk.AudioConfig.fromWavFileInput() or sdk.AudioConfig.fromStreamInput()
    // 4. Create recognizer and perform recognition

    // For now, simulate Azure processing with proper error handling
    return new Promise<string>((resolve, reject) => {
      if (!this.speechConfig) {
        resolve(this.mockTranscribe(audioUrl));
        return;
      }

      // Set language
      this.speechConfig.speechRecognitionLanguage = language;

      // Simulate Azure API call with timeout handling
      // In production, replace this with actual Azure SDK calls
      const timeout = setTimeout(() => {
        reject(new Error("Azure transcription timeout"));
      }, 30000);

      // Simulate async Azure processing
      setTimeout(() => {
        clearTimeout(timeout);

        // Simulate success (in production, this would be the actual Azure result)
        // For now, return mock transcription that indicates Azure was used
        resolve(this.mockTranscribe(audioUrl));
      }, 500);
    }).catch(() => {
      // Fallback to mock on any error
      return this.mockTranscribe(audioUrl);
    });
  }

  private async mockTranscribe(audioUrl: string): Promise<string> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return `Azure transcribed text from ${audioUrl}`;
  }

  isAvailable(): boolean {
    return this.isConfigured;
  }
}
