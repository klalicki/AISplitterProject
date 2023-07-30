import sys
import json
from urllib.parse import unquote
from youtube_transcript_api import YouTubeTranscriptApi

# get URL from the command line argument
url = sys.argv[1]

# decode URL
decoded_url = unquote(url)

# parse out the video id from the url
video_id = decoded_url.split('=')[1]

# get the transcript
transcript = YouTubeTranscriptApi.get_transcript(video_id)

# convert the transcript to JSON and print
print(json.dumps(transcript))