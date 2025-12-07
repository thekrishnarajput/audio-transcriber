import { retryWithBackoff } from '../../src/utils/retry';

describe('retryWithBackoff', () => {
  it('should succeed on first attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await retryWithBackoff(fn, {
      maxAttempts: 3,
      delayMs: 100,
    });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and succeed', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');

    const result = await retryWithBackoff(fn, {
      maxAttempts: 3,
      delayMs: 10,
    });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should throw error after max attempts', async () => {
    const error = new Error('persistent failure');
    const fn = jest.fn().mockRejectedValue(error);

    await expect(
      retryWithBackoff(fn, {
        maxAttempts: 3,
        delayMs: 10,
      })
    ).rejects.toThrow('persistent failure');

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should use exponential backoff when enabled', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');

    const startTime = Date.now();
    await retryWithBackoff(fn, {
      maxAttempts: 3,
      delayMs: 100,
      exponentialBackoff: true,
    });
    const elapsed = Date.now() - startTime;

    // With exponential backoff: 100ms (2^0) + 200ms (2^1) = ~300ms minimum
    expect(elapsed).toBeGreaterThanOrEqual(290);
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

