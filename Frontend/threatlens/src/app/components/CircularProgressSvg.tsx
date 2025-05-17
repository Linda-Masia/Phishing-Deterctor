"use client";

import { useEffect, useState } from "react";
import "./circularProgress.css";

interface CircularProgressSvgProps {
  value: number; // percentage from 0 to 100
  size?: number;
  color?: string; // stroke color for the progress
}

export default function CircularProgressSvg({
  value,
  size = 250,
  color = "#5394fd",
}: CircularProgressSvgProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progressVal = Math.min((elapsed / 1500) * value, value); // 1.5s animation
      setProgress(progressVal);
      if (progressVal < value) {
        frame = requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (progress / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} className="circular-progress" viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="fg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{
            stroke: color,
            transition: "stroke-dasharray 0.3s linear",
          }}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          fontFamily: "Segoe UI, sans-serif",
        }}
      >
        <div style={{ fontSize: "32px", fontWeight: "bold", color: "#333" }}>
          {Math.round(progress)}%
        </div>
        <div style={{ fontSize: "14px", color: "#666" }}>Confidence</div>
      </div>
    </div>
  );
}
