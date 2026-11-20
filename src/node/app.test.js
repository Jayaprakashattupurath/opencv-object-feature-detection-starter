import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import fs from "fs";
import { buildApp } from "./app.js";

describe("API tests", () => {
  it("GET /health returns ok", async () => {
    const app = buildApp({
      analyzeFrame: vi.fn()
    });

    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("POST /api/analyze returns 400 when frame is missing", async () => {
    const app = buildApp({
      analyzeFrame: vi.fn()
    });

    const res = await request(app).post("/api/analyze");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "No frame uploaded" });
  });

  it("POST /api/analyze returns detector result and removes uploaded file", async () => {
    let uploadedPath = null;
    const app = buildApp({
      analyzeFrame: vi.fn(async (imagePath) => {
        uploadedPath = imagePath;
        return {
          people_count: 1,
          people_boxes: [],
          feature_check: { good_matches: 25, is_match: true },
          ok_for_gate_open: true
        };
      })
    });

    const res = await request(app)
      .post("/api/analyze")
      .attach("frame", Buffer.from("fake-image"), "frame.jpg");

    expect(res.status).toBe(200);
    expect(res.body.ok_for_gate_open).toBe(true);

    await new Promise((r) => setTimeout(r, 30));
    expect(uploadedPath).toBeTruthy();
    expect(fs.existsSync(uploadedPath)).toBe(false);
  });

  it("POST /api/analyze returns 500 when detector fails", async () => {
    const app = buildApp({
      analyzeFrame: vi.fn(async () => {
        throw new Error("mock detector crash");
      })
    });

    const res = await request(app)
      .post("/api/analyze")
      .attach("frame", Buffer.from("fake-image"), "frame.jpg");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Python detection failed");
    expect(res.body.details).toContain("mock detector crash");
  });
});