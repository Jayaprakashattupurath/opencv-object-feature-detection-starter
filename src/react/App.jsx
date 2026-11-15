import React, { useEffect, useRef, useState } from "react";

const API = "http://localhost:8080/api/analyze";

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    });
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = 640;
      canvas.height = 480;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
      const form = new FormData();
      form.append("frame", blob, "frame.jpg");

      const res = await fetch(API, { method: "POST", body: form });
      const data = await res.json();
      setResult(data);
    }, 2000); // Best practice: throttle frame uploads (not every frame)

    return () => clearInterval(timer);
  }, [running]);

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 900, margin: "20px auto" }}>
      <h2>Real-time Gate Check (Person + Badge Feature Match)</h2>
      <video ref={videoRef} autoPlay playsInline width={640} height={480} style={{ border: "1px solid #ddd" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div style={{ marginTop: 10 }}>
        <button onClick={() => setRunning((v) => !v)}>
          {running ? "Stop Analysis" : "Start Analysis"}
        </button>
      </div>
      <pre style={{ background: "#f6f8fa", padding: 12, marginTop: 12 }}>
        {result ? JSON.stringify(result, null, 2) : "No result yet..."}
      </pre>
    </div>
  );
}