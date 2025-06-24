import ytdl from "@distube/ytdl-core";

export async function getYoutubeAudioStream(url: string) {
  return ytdl(url, { quality: "highestaudio" });
}
