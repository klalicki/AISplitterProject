import { YoutubeTranscript } from "youtube-transcript";

const fetchTranscript = async (url: string) => {
  try {
    const data = await YoutubeTranscript.fetchTranscript(url);
    return data;
  } catch (error) {
    console.error(`Failed to fetch transcript: ${error}`);
    throw error;
  }
};

export { fetchTranscript };
