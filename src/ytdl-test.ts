import ytdl from "@distube/ytdl-core";
import { createWriteStream } from "node:fs";
console.log("Hello, World!");

const url = "http://www.youtube.com/watch?v=aqz-KE-bpKQ";

async function main() {
  ytdl(url, { quality: "highestaudio" }).pipe(
    createWriteStream("./output.mp3")
  );
}

main();
