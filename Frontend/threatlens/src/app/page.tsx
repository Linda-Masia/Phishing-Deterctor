"use client";
import { useState, useEffect, useRef } from "react";
import { CircularProgress } from "@heroui/react";
import CircularProgressSvg from "./components/CircularProgressSvg";

const getConfidenceColor = (confidence: number, type?: string): string => {
  if (type === "Legitimate") {
    if (confidence > 0.85) return "green";
    if (confidence > 0.75) return "yellow";
    if (confidence > 0.65) return "orange";
    if (confidence < 0.4) return "red";
    return "blue";
  } else {
    if (confidence > 0.85) return "red";
    if (confidence > 0.75) return "orange";
    if (confidence > 0.6) return "yellow";
    if (confidence < 0.4) return "green";
    return "blue";
  }
};

export default function Home() {
  const [emailText, setEmailText] = useState("");
  const [response, setResponse] = useState<{
    label: string;
    confidence: number;
    explanation: { phrase: string; confidence: number }[];
    highlightedText: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/plain")
      return setError("Only .txt files are allowed.");
    if (file.size > 500 * 1024)
      return setError("File is too large. Max 500KB.");

    const reader = new FileReader();
    reader.onload = (event) => setEmailText(event.target?.result as string);
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    if (!emailText.trim()) {
      setError("Please provide email content before submitting.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ text: emailText }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        console.error(err);
        setError("Something went wrong while contacting the API.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Scroll down when response changes
  useEffect(() => {
    if (response && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [response]);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#f5f5f5",
        color: "#212529",
        fontFamily: "Segoe UI, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "0.5rem 2rem 0.5rem",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <div style={{ width: "100%", maxWidth: "900px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/logo.png"
            alt="Threat Lens Logo"
            style={{ width: 80, height: 80 }}
          />
          <h1 style={{ color: "#007BFF", fontSize: "2rem", margin: 0 }}>
            ThreatLens
          </h1>
        </div>

        <p style={{ fontStyle: "italic", marginBottom: "0.5rem" }}>
          Analyze emails for potential phishing threats.
        </p>

        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ fontWeight: "bold" }}>
            Upload Email (.txt):
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              style={{ marginLeft: "1rem" }}
              disabled={loading}
            />
          </label>
        </div>

        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ fontWeight: "bold" }}>
            Or paste email content:
            <textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              rows={10}
              style={{
                width: "100%",
                padding: "0.75rem",
                marginTop: "0.5rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                color: "black",
              }}
              placeholder="Paste your email content here..."
              disabled={loading} // <-- disable textarea while loading
            />
          </label>
        </div>

        <button
          onClick={handleSubmit}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "16px",
            cursor: "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Submit for Analysis"}
        </button>

        {loading && (
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CircularProgress size="lg" color="primary" />
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "2rem",
              color: "#721c24",
              backgroundColor: "#f8d7da",
              padding: "1rem",
              borderRadius: "8px",
            }}
          >
            {error}
          </div>
        )}

        {response && !loading && (
          <div ref={resultRef} style={{ marginTop: "2rem" }}>
            <h2 style={{ color: "#333" }}>Analysis Result</h2>
            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color: response.label === "Phishing" ? "red" : "green",
                }}
              >
                {response.label}
              </span>
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "1rem 0 2rem",
              }}
            >
              <CircularProgressSvg
                value={Math.round(response.confidence * 100)}
                color={getConfidenceColor(response.confidence, response.label)}
              />
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <h3>Highlighted Email Content and Confidence:</h3>
              <ul style={{ paddingLeft: "1rem" }}>
                {response.explanation.map((item, index) => (
                  <li key={index} style={{ marginBottom: "0.5rem" }}>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: getConfidenceColor(item.confidence),
                      }}
                    >
                      {item.phrase}
                    </span>{" "}
                    - Confidence: {(item.confidence * 100).toFixed(1)}%
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
