import { Transcription, ITranscription } from '../models/Transcription';
import { TranscriptionDocument } from '../types';

export class TranscriptionRepository {
  async create(data: Omit<TranscriptionDocument, '_id' | 'createdAt'>): Promise<ITranscription> {
    const transcription = new Transcription({
      ...data,
      createdAt: new Date(),
    });
    return await transcription.save();
  }

  async findById(id: string): Promise<ITranscription | null> {
    return await Transcription.findById(id);
  }

  async findRecentTranscriptions(days: number = 30): Promise<ITranscription[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return await Transcription.find({
      createdAt: { $gte: dateThreshold },
    })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(): Promise<ITranscription[]> {
    return await Transcription.find().sort({ createdAt: -1 }).exec();
  }
}

