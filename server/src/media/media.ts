import { spawn } from "node:child_process";
import ffprobePath from "ffprobe-static";
import { createStreamUrl } from "@storage/storage.js";
import { badInput } from "@core/errors.js";

function runFfprobe(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const args = [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=nw=1:nk=1",
      url
    ];

    const child = spawn(ffprobePath, args);
    let output = "";
    let errorOutput = "";

    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      errorOutput += chunk.toString();
    });

    child.on("error", (err) => reject(err));

    child.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(errorOutput || "ffprobe failed"));
      }
      const value = Number(output.trim());
      if (!Number.isFinite(value)) {
        return reject(new Error("Invalid ffprobe output"));
      }
      resolve(value);
    });
  });
}

export async function probeDurationSeconds(fileKey: string) {
  try {
    const { url } = await createStreamUrl(fileKey, 60 * 2);
    const seconds = await runFfprobe(url);
    return Math.round(seconds);
  } catch {
    throw badInput("Failed to read audio duration");
  }
}
