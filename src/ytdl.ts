import ytdl from "@distube/ytdl-core";

export function getYoutubeAudioStream(url: string, proxy?: string) {
  const agent = proxy ? ytdl.createProxyAgent(proxy) : undefined;

  return ytdl(url, { quality: "highestaudio", agent });
}
