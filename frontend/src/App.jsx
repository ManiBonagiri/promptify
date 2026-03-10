import { useState } from "react";
import "./App.css";

const API = " ";

export default function App() {
  const [simplePrompt, setSimplePrompt] = useState("");
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [imageBase64, setImageBase64] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [optimizeError, setOptimizeError] = useState("");
  const [generateError, setGenerateError] = useState("");
  const [optimizeDone, setOptimizeDone] = useState(false);

  async function handleOptimize() {
    if (!simplePrompt.trim()) return;
    setOptimizing(true);
    setOptimizeError("");
    setOptimizedPrompt("");
    setOptimizeDone(false);
    setImageBase64(null);
    try {
      const res = await fetch(`${API}/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: simplePrompt }),
      });
      if (!res.ok) throw new Error("Optimization failed");
      const data = await res.json();
      setOptimizedPrompt(data.optimized);
      setOptimizeDone(true);
    } catch (e) {
      setOptimizeError("Could not reach backend. Is it running?");
    } finally {
      setOptimizing(false);
    }
  }

  async function handleGenerate() {
    if (!optimizedPrompt.trim()) return;
    setGenerating(true);
    setGenerateError("");
    setImageBase64(null);
    try {
      const res = await fetch(`${API}/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: optimizedPrompt }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setImageBase64(data.image_base64);
    } catch (e) {
      setGenerateError("Image generation failed. Check your HF_TOKEN.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="app">
      {/* Grain overlay */}
      <div className="grain" />

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-mark">P</span>
            <span className="logo-text">Promptify</span>
          </div>
          <p className="tagline">Turn simple ideas into stunning image prompts</p>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        <div className="panel-grid">

          {/* LEFT — Prompt workflow */}
          <div className="panel panel-left">
            <section className="step">
              <label className="step-label">
                <span className="step-num">01</span>
                Your idea
              </label>
              <textarea
                className="textarea"
                rows={3}
                placeholder="a dog in a forest…"
                value={simplePrompt}
                onChange={(e) => setSimplePrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleOptimize();
                }}
              />
              <button
                className={`btn btn-primary ${optimizing ? "loading" : ""}`}
                onClick={handleOptimize}
                disabled={optimizing || !simplePrompt.trim()}
              >
                {optimizing ? (
                  <span className="btn-inner">
                    <span className="spinner" /> Optimizing…
                  </span>
                ) : (
                  <span className="btn-inner">
                    Optimize prompt <Arrow />
                  </span>
                )}
              </button>
              {optimizeError && <p className="error">{optimizeError}</p>}
            </section>

            {/* Divider with animation */}
            <div className={`flow-line ${optimizeDone ? "active" : ""}`} />

            <section className={`step step-optimized ${optimizeDone ? "revealed" : ""}`}>
              <label className="step-label">
                <span className="step-num">02</span>
                Optimized prompt
                {optimizeDone && <span className="badge">Ready</span>}
              </label>
              <textarea
                className="textarea textarea-optimized"
                rows={5}
                placeholder="Your optimized prompt will appear here…"
                value={optimizedPrompt}
                onChange={(e) => setOptimizedPrompt(e.target.value)}
                readOnly={!optimizeDone}
              />
              <button
                className={`btn btn-accent ${generating ? "loading" : ""}`}
                onClick={handleGenerate}
                disabled={generating || !optimizedPrompt.trim()}
              >
                {generating ? (
                  <span className="btn-inner">
                    <span className="spinner spinner-white" /> Generating…
                  </span>
                ) : (
                  <span className="btn-inner">
                    Generate image <Sparkle />
                  </span>
                )}
              </button>
              {generateError && <p className="error">{generateError}</p>}
            </section>
          </div>

          {/* RIGHT — Image result */}
          <div className="panel panel-right">
            <div className="image-frame">
              {imageBase64 ? (
                <>
                  <img
                    src={`data:image/png;base64,${imageBase64}`}
                    alt="Generated"
                    className="generated-image"
                  />
                  <div className="image-meta">
                    <span>Generated via SDXL</span>
                    <a
                      href={`data:image/png;base64,${imageBase64}`}
                      download="promptify-output.png"
                      className="download-link"
                    >
                      Download ↓
                    </a>
                  </div>
                </>
              ) : generating ? (
                <div className="image-placeholder generating">
                  <div className="pulse-ring" />
                  <p className="placeholder-text">Generating your image…</p>
                  <p className="placeholder-sub">This may take 10–30 seconds</p>
                </div>
              ) : (
                <div className="image-placeholder">
                  <div className="placeholder-icon">
                    <ImageIcon />
                  </div>
                  <p className="placeholder-text">Your image appears here</p>
                  <p className="placeholder-sub">
                    Optimize a prompt, then hit Generate
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Built with GPT-2 · LoRA fine-tuning · Stable Diffusion XL</p>
      </footer>
    </div>
  );
}

// Icons
function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Sparkle() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1v3M8 12v3M1 8h3M12 8h3M3.05 3.05l2.12 2.12M10.83 10.83l2.12 2.12M3.05 12.95l2.12-2.12M10.83 5.17l2.12-2.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="8" width="32" height="24" rx="3" stroke="#D0C9BF" strokeWidth="1.5" />
      <circle cx="13" cy="16" r="3" stroke="#D0C9BF" strokeWidth="1.5" />
      <path d="M4 26l8-6 6 5 5-4 13 11" stroke="#D0C9BF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}