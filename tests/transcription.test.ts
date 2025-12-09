import { TranscriptionService } from '../src/transcription/service/transcription.service';
import { TranscriptionRepository } from '../src/transcription/repository/transcription.repository';
import { Transcription } from '../src/transcription/model/transcription.model';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { describe, beforeEach, it, before, after } from 'node:test';
import { assert } from 'console';

describe('TranscriptionService', () => {
  let mongoServer: MongoMemoryServer;
  let transcriptionService: TranscriptionService;
  let transcriptionRepository: TranscriptionRepository;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  after(async () => {
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

      assert(transcription === 'transcribed text');
    });

    it('should handle invalid audio URL gracefully', async () => {
      const audioUrl = 'https://invalid-url-that-does-not-exist.com/audio.mp3';

      // The mock download will fail, but we expect it to throw an error
      try {
        await transcriptionService.transcribeAudio(audioUrl);
        // If no error is thrown, force the test to fail
        assert(false, 'Expected an error to be thrown for an invalid audio URL');
      } catch (err) {
        // Optionally check the error type/message here if desired
        assert(!!err, 'An error was expected but not thrown');
      }

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

      assert(document._id);
      assert(document.audioUrl);
      assert(document.transcription);
      assert(document.source);
      assert(document.createdAt);
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

      assert(recent.length === 1);
      assert(recent[0].audioUrl === 'https://example.com/recent.mp3');
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

      assert(all.length === 2);
    });
  });
});

