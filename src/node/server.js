import express from "express";
import cors from "cors";
import multer from "multer";
import { execFile } from "child_process";
import path from "path";
import fs from "fs";

const app = express();
app.use(cors());

const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

app.get("/health", (_, res) => res.json({ ok: true }));

app.post("/api/analyze", upload.single("frame"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No frame uploaded" });

  const pythonScript = path.resolve("../python/detector.py");
  const templatePath = path.resolve("../python/template_badge.jpg"); // put your template here

  execFile(
    "python",
    [pythonScript, "--image", req.file.path, "--template", templatePath],
    { timeout: 10000 },
    (err, stdout, stderr) => {
      fs.unlink(req.file.path, () => {});
      if (err) {
        return res.status(500).json({
          error: "Python detection failed",
          details: stderr || err.message
        });
      }

      try {
        const parsed = JSON.parse(stdout);
        res.json(parsed);
      } catch {
        res.status(500).json({ error: "Invalid detector output", raw: stdout });
      }
    }
  );
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));