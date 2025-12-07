import { TranscriptionService } from '../src/services/TranscriptionService';
import { TranscriptionRepository } from '../src/repositories/TranscriptionRepository';
import { Transcription } from '../src/models/Transcription';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('TranscriptionService', () => {
  let mongoServer: MongoMemoryServer;
  let transcriptionService: TranscriptionService;
  let transcriptionRepository: TranscriptionRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Transcription.deleteMany({});
    transcriptionRepository = new TranscriptionRepository();
    transcriptionService = new TranscriptionService(transcriptionRepository);
  });

  describe('transcribeAudio', () => {
    it('should return a dummy transcription', async () => {
      const audioUrl = 'https://example.com/sample.mp3';
      const transcription = await transcriptionService.transcribeAudio(audioUrl);
      
      expect(transcription).toBe('transcribed text');
    });

    it('should handle invalid audio URL gracefully', async () => {
      const audioUrl = 'https://invalid-url-that-does-not-exist.com/audio.mp3';
      
      // The mock download will fail, but we expect it to throw an error
      await expect(
        transcriptionService.transcribeAudio(audioUrl)
      ).rejects.toThrow();
    });
  });

  describe('createTranscription', () => {
    it('should create a transcription document in MongoDB', async () => {
      const audioUrl = 'https://example.com/sample.mp3';
      const transcription = 'test transcription';
      
      const document = await transcriptionService.createTranscription(
        audioUrl,
        transcription,
        'default'
      );

      expect(document._id).toBeDefined();
      expect(document.audioUrl).toBe(audioUrl);
      expect(document.transcription).toBe(transcription);
      expect(document.source).toBe('default');
      expect(document.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('getRecentTranscriptions', () => {
    it('should return transcriptions from the last 30 days', async () => {
      const now = new Date();
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35); // 35 days ago

      // Create old transcription
      await Transcription.create({
        audioUrl: 'https://example.com/old.mp3',
        transcription: 'old transcription',
        source: 'default',
        createdAt: oldDate,
      });

      // Create recent transcription
      await Transcription.create({
        audioUrl: 'https://example.com/recent.mp3',
        transcription: 'recent transcription',
        source: 'default',
        createdAt: now,
      });

      const recent = await transcriptionService.getRecentTranscriptions(30);

      expect(recent.length).toBe(1);
      expect(recent[0].audioUrl).toBe('https://example.com/recent.mp3');
    });

    it('should return all transcriptions when using custom days parameter', async () => {
      const now = new Date();
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35);

      await Transcription.create({
        audioUrl: 'https://example.com/old.mp3',
        transcription: 'old transcription',
        source: 'default',
        createdAt: oldDate,
      });

      await Transcription.create({
        audioUrl: 'https://example.com/recent.mp3',
        transcription: 'recent transcription',
        source: 'default',
        createdAt: now,
      });

      const all = await transcriptionService.getRecentTranscriptions(40);

      expect(all.length).toBe(2);
    });
  });
});

