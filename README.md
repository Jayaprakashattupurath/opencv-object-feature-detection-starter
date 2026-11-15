# OpenCV Best Practice Starter: Object + Feature Detection

This small project demonstrates a **real-time access-control scenario**:

- Detect if a person is present in camera feed (**object detection**)
- Verify a known badge/logo in the frame using ORB feature matching (**feature detection**)
- Return a decision (`ok_for_gate_open`) from backend

## Why this is useful (real-world use case)

Example: office/lab gate automation.

1. A camera captures frames.
2. System detects human presence.
3. System checks whether a known ID badge pattern is visible.
4. Gate opens only when simple policy is met.

---

## Tech stack

- **Python + OpenCV**: actual detection logic
- **Node.js (Express)**: API layer to receive frames and execute Python script
- **React**: webcam UI for quick demo

---

## Source layout

- `src/python/detector.py` – object + feature detection
- `src/node/server.js` – upload endpoint and Python bridge
- `src/react/App.jsx` – webcam capture and result display

---

## Quick setup

## 1) Python deps
```bash
pip install opencv-python
```

Place your template image at:
`src/python/template_badge.jpg`

## 2) Node API
```bash
cd src/node
npm install
npm start
```

Runs on `http://localhost:8080`

## 3) React UI
```bash
cd src/react
npm install
npm start
```

Open the Vite URL (usually `http://localhost:5173`).

---

## Best practices used (and why)

1. **Frame throttling** (every 2s, not every frame)  
   Reduces CPU/network load for production stability.

2. **Resize before detection**  
   Improves speed with acceptable accuracy tradeoff.

3. **Feature ratio test (Lowe’s test)**  
   Filters weak ORB matches; improves precision.

4. **Simple confidence/threshold policy**  
   Keep logic deterministic; tune thresholds per environment.

5. **Separation of concerns**  
   Python handles CV; Node handles API; React handles UI.

---

## How to improve for production

- Use async queue/workers (RabbitMQ, Redis queues) for heavy load.
- Add model-based detector (YOLO/SSD) if HOG is insufficient.
- Add temporal smoothing (N consecutive positive frames).
- Add ROI masking to ignore irrelevant areas.
- Store logs/metrics (latency, false positives, false negatives).
- Containerize services with Docker and pin OpenCV version.
- Add HTTPS + auth for camera/API endpoints.

---

## Expected limitations of this starter

- HOG person detector is lightweight but not state-of-the-art.
- ORB matching can fail in low light, blur, or major occlusion.
- This is intentionally small and educational (not enterprise-ready).

---

## Safety note

Do not use this alone for high-security decisions.  
Use multi-factor checks and human override for critical systems.