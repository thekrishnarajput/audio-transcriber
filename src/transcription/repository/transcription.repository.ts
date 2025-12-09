import { Transcription, ITranscription } from "../model/transcription.model";
import { TranscriptionDocument } from "../interface/transcription.interface";
import { isDatabaseConnected } from "../../config/database";

export class TranscriptionRepository {
  private checkConnection(): void {
    if (!isDatabaseConnected()) {
      throw new Error(
        "Database not connected. Please ensure MongoDB is running and accessible."
      );
    }
  }

  async create(
    data: Omit<TranscriptionDocument, "_id" | "createdAt">
  ): Promise<ITranscription> {
    this.checkConnection();
    const transcription = new Transcription({
      ...data,
      createdAt: new Date(),
    });
    return await transcription.save();
  }

  async findById(id: string): Promise<ITranscription | null> {
    this.checkConnection();
    return await Transcription.findById(id);
  }

  async findRecentTranscriptions(days: number = 30): Promise<ITranscription[]> {
    this.checkConnection();
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return await Transcription.find({
      createdAt: { $gte: dateThreshold },
    })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(): Promise<ITranscription[]> {
    this.checkConnection();
    return await Transcription.find().sort({ createdAt: -1 }).exec();
  }
}
