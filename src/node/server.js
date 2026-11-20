import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { buildApp } from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function analyzeFrameWithPython(imagePath) {
  const pythonScript = path.resolve(__dirname, "../python/detector.py");
  const templatePath = path.resolve(__dirname, "../python/template_badge.jpg");

  return new Promise((resolve, reject) => {
    execFile(
      "python",
      [pythonScript, "--image", imagePath, "--template", templatePath],
      { timeout: 10000 },
      (err, stdout, stderr) => {
        if (err) {
          reject(new Error(stderr || err.message));
          return;
        }

        try {
          resolve(JSON.parse(stdout));
        } catch {
          reject(new Error(`Invalid detector output: ${stdout}`));
        }
      }
    );
  });
}

export const app = buildApp({ analyzeFrame: analyzeFrameWithPython });

const PORT = process.env.PORT || 8080;

if (process.argv[1] === __filename) {
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}