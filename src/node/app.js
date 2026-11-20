import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";

export function buildApp({ analyzeFrame }) {
  const app = express();
  app.use(cors());

  const uploadDir = path.resolve("uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const upload = multer({ dest: uploadDir });

  app.get("/health", (_, res) => res.json({ ok: true }));

  app.post("/api/analyze", upload.single("frame"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No frame uploaded" });

    try {
      const result = await analyzeFrame(req.file.path);
      res.json(result);
    } catch (err) {
      res.status(500).json({
        error: "Python detection failed",
        details: err.message
      });
    } finally {
      fs.unlink(req.file.path, () => {});
    }
  });

  return app;
}