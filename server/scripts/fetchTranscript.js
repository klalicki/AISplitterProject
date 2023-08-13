const YoutubeTranscript = require("youtube-transcript").YoutubeTranscript;

const fetchTranscript = async (url) => {
  try {
    const data = await YoutubeTranscript.fetchTranscript(url);
    return data;
  } catch (error) {
    console.error(`Failed to fetch transcript: ${error}`);
    throw error;
  }
};
module.exports = fetchTranscript;
