import ytdl from "@distube/ytdl-core";

export function getYoutubeAudioStream(url: string) {
  return ytdl(url, { quality: "highestaudio" });
}
