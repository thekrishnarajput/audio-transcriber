export const messages = {
  errorMessage: () => {
    return `Oops! something went wrong, please try again.`;
  },

  validationError: () => {
    return `Please check field's validation!`;
  },

  noDataFound: () => {
    return `Sorry, no data fetched!`;
  },

  dataFound: () => {
    return `Data fetched successfully!`;
  },

  urlNotFound: () => {
    return "Oops! The URL you requested was not found on this server.";
  },

  transcriptionCreated: () => {
    return "Transcription created successfully";
  },

  azureTranscriptionCreated: () => {
    return "Azure transcription created successfully";
  },

  rateLimitExceeded: () => {
    return `"100 requests exceeded from this IP, please try again after 15 minutes"`;
  },
};
