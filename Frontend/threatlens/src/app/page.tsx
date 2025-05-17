"use client";
import DOMPurify from "dompurify";
import { useState } from "react";
import { CircularProgress } from "@heroui/react";
import CircularProgressSvg from "./components/CircularProgressSvg"; // adjust path accordingly

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "text/plain") {
      setError("Only .txt files are allowed.");
      return;
    }

    // Limit file size (e.g., 500KB)
    if (file.size > 500 * 1024) {
      setError("File is too large. Maximum size is 500KB.");
      return;
    }

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setEmailText(text);
    };
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
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({ text: emailText }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`);
      }

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        console.error("API Error:", { message: err.message, stack: err.stack });
        setError("Something went wrong while contacting the API.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Segoe UI, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}
      >
        <img
          src="horizon-5.jpg"
          alt="Threat Lens Logo"
          style={{ width: "50px", height: "50px", marginRight: "1rem" }}
        />
        <h1 style={{ color: "#007BFF", fontSize: "2.5rem", margin: 0 }}>
          ThreatLens
        </h1>
      </div>

      <p style={{ fontStyle: "italic", marginBottom: "2rem" }}>
        Analyze emails for potential phishing threats.
      </p>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontWeight: "bold" }}>
          Upload Email (.txt):
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            style={{ marginLeft: "1rem" }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontWeight: "bold" }}>
          Or paste email content:
          <textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value.trim())}
            rows={10}
            style={{
              width: "100%",
              padding: "0.75rem",
              marginTop: "0.5rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
            placeholder="Paste your email content here..."
          />
        </label>
      </div>

      <button
        onClick={handleSubmit}
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "#007BFF",
          color: "white",
          border: "none",
          borderRadius: "4px",
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
            color: "red",
            backgroundColor: "#ffe5e5",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          {error}
        </div>
      )}

      {response && !loading && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ color: "#333" }}>Analysis Result</h2>
          <p>
            <strong>Status:</strong>{" "}
            <span
              style={{ color: response.label === "Phishing" ? "red" : "green" }}
            >
              {response.label}
            </span>
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "1rem",
              marginBottom: "2rem",
            }}
          >
            <CircularProgressSvg
              value={Math.round(response.confidence * 100)}
              color={response.label === "Phishing" ? "#dc3545" : "#28a745"}
            />
          </div>

          <div>
            <h3 style={{ marginBottom: "0.5rem" }}>
              Highlighted Email Content:
            </h3>
            <pre
              style={{
                backgroundColor: "#f8f9fa",
                padding: "1rem",
                borderRadius: "8px",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                lineHeight: "1.5",
                fontFamily: "Consolas, monospace",
              }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(response.highlightedText),
              }}
            />
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <h3>Key Phrases and Confidence:</h3>
            <ul style={{ paddingLeft: "1rem" }}>
              {response.explanation.map((item, index) => {
                let color = "green";
                if (item.confidence > 0.7) color = "red";
                else if (item.confidence > 0.4) color = "orange";

                return (
                  <li key={index} style={{ marginBottom: "0.5rem" }}>
                    <span style={{ fontWeight: "bold", color }}>
                      {item.phrase}
                    </span>{" "}
                    - Confidence: {(item.confidence * 100).toFixed(1)}%
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
