export interface TranscriptionRequest {
  audioUrl: string;
}

export interface TranscriptionResponse {
  id: string;
  message?: string;
}

export interface TranscriptionDocument {
  _id?: string;
  audioUrl: string;
  transcription: string;
  source?: "default" | "azure";
  language?: string;
  createdAt: Date;
}

export interface AzureTranscriptionRequest {
  audioUrl: string;
  language?: string;
}
