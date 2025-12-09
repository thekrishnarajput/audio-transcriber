import axios from "axios";

/**
 * Mocks downloading an audio file from a URL.
 * In a real implementation, this would download and validate the audio file.
 * For mock mode, we validate the URL format but don't require the URL to be accessible.
 *
 * @param audioUrl - The URL of the audio file to download (mocked)
 * @param skipValidation - If true, skip URL accessibility check (default: false in production, true in development)
 * @returns A mock buffer representing the audio file
 */
export async function mockDownloadAudio(
  audioUrl: string,
  skipValidation: boolean = process.env.NODE_ENV !== "production"
): Promise<Buffer> {
  // Validate URL format
  try {
    new URL(audioUrl);
  } catch (error) {
    throw new Error(`Invalid URL format: ${audioUrl}`);
  }

  // In mock mode (development), skip actual URL validation to allow testing with any URL
  if (skipValidation) {
    // Simulate a small delay to mimic network request
    await new Promise((resolve) => setTimeout(resolve, 100));
    return Buffer.from("mock-audio-data");
  }

  // In production or when validation is required, attempt to validate URL accessibility
  try {
    await axios.head(audioUrl, {
      timeout: 5000,
      validateStatus: (status) => status < 500, // Accept any status < 500
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to download audio from URL: ${error.message}`);
    }
    throw error;
  }

  // Return a mock buffer representing the audio file
  return Buffer.from("mock-audio-data");
}
