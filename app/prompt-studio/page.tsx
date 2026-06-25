"use client";

import { useState } from "react";

const COLORS = {
  bg: "#0A0A0F",
  card: "#111118",
  border: "#1E1E2E",
  accent: "#7C6AF7",
  accentDim: "rgba(124, 106, 247, 0.12)",
  text: "#F0EEFF",
  muted: "#6B7280",
  success: "#34D399",
  error: "#F87171",
};

type TaskType =
  | "idea"
  | "bug"
  | "feature"
  | "refactor"
  | "ui"
  | "performance"
  | "api"
  | "auth"
  | "db";

const TASK_CHIPS: { id: TaskType; label: string; emoji: string }[] = [
  { id: "idea", label: "New Idea", emoji: "💡" },
  { id: "bug", label: "Bug Fix", emoji: "🐛" },
  { id: "feature", label: "New Feature", emoji: "✨" },
  { id: "refactor", label: "Refactor", emoji: "♻️" },
  { id: "ui", label: "UI/Design", emoji: "🎨" },
  { id: "performance", label: "Performance", emoji: "⚡" },
  { id: "api", label: "API/Backend", emoji: "🔌" },
  { id: "auth", label: "Auth", emoji: "🔐" },
  { id: "db", label: "Database", emoji: "🗄️" },
];

function countTokens(text: string): number {
  return Math.round(text.split(/\s+/).filter(Boolean).length * 1.3);
}

export default function PromptStudio() {
  const [tab, setTab] = useState<"input" | "output">("input");
  const [problem, setProblem] = useState("");
  const [context, setContext] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("idea");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!problem.trim()) {
      setError("Please describe your problem or task.");
      return;
    }
    setError("");
    setLoading(true);
    setTab("output");

    try {
      const res = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem, context, taskType }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Request failed.");
      }
      setOutput(data.prompt);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error.";
      setError(message);
      setTab("input");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClear() {
    setOutput("");
  }

  const inputPanel = (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.1em",
            color: COLORS.muted,
            textTransform: "uppercase",
          }}
        >
          Problem / Task
        </label>
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="e.g. payment button fires twice on first click..."
          style={{
            minHeight: 120,
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            color: COLORS.text,
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            padding: "12px 14px",
            resize: "vertical",
            outline: "none",
            lineHeight: 1.6,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = COLORS.accent)}
          onBlur={(e) => (e.currentTarget.style.borderColor = COLORS.border)}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.1em",
            color: COLORS.muted,
            textTransform: "uppercase",
          }}
        >
          Task Type
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TASK_CHIPS.map((chip) => {
            const active = taskType === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setTaskType(chip.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 20,
                  border: `1px solid ${active ? COLORS.accent : COLORS.border}`,
                  background: active ? COLORS.accentDim : "transparent",
                  color: active ? COLORS.accent : COLORS.muted,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {chip.emoji} {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.1em",
            color: COLORS.muted,
            textTransform: "uppercase",
          }}
        >
          Extra Context{" "}
          <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span>
        </label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g. Next.js 15, Prisma + PostgreSQL..."
          style={{
            minHeight: 80,
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            color: COLORS.text,
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            padding: "12px 14px",
            resize: "vertical",
            outline: "none",
            lineHeight: 1.6,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = COLORS.accent)}
          onBlur={(e) => (e.currentTarget.style.borderColor = COLORS.border)}
        />
      </div>

      {error && (
        <div
          style={{
            background: "rgba(248, 113, 113, 0.1)",
            border: `1px solid ${COLORS.error}`,
            borderRadius: 8,
            padding: "10px 14px",
            color: COLORS.error,
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          width: "100%",
          padding: "14px 0",
          background: loading ? "rgba(124, 106, 247, 0.5)" : COLORS.accent,
          border: "none",
          borderRadius: 10,
          color: "#fff",
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: 15,
          letterSpacing: "0.05em",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "opacity 0.15s",
        }}
      >
        {loading ? "Generating..." : "GENERATE PROMPT"}
      </button>
    </div>
  );

  const outputPanel = (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: COLORS.text,
            flex: 1,
          }}
        >
          Output
        </span>
        {output && (
          <span
            style={{
              background: COLORS.accentDim,
              color: COLORS.accent,
              border: `1px solid ${COLORS.accent}`,
              borderRadius: 12,
              padding: "2px 10px",
              fontSize: 12,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
            }}
          >
            ~{countTokens(output)} tokens
          </span>
        )}
        {output && (
          <>
            <button
              onClick={handleCopy}
              style={{
                padding: "6px 14px",
                background: copied ? "rgba(52, 211, 153, 0.12)" : COLORS.accentDim,
                border: `1px solid ${copied ? COLORS.success : COLORS.accent}`,
                borderRadius: 8,
                color: copied ? COLORS.success : COLORS.accent,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleClear}
              style={{
                padding: "6px 14px",
                background: "transparent",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                color: COLORS.muted,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </>
        )}
      </div>

      {loading ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            minHeight: 200,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              border: `3px solid ${COLORS.border}`,
              borderTopColor: COLORS.accent,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <span style={{ color: COLORS.muted, fontFamily: "'Inter', sans-serif", fontSize: 14 }}>
            Generating...
          </span>
        </div>
      ) : output ? (
        <pre
          style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            padding: "16px",
            color: COLORS.text,
            fontFamily: "'JetBrains Mono', 'Fira Mono', monospace",
            fontSize: 13,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            margin: 0,
          }}
        >
          {output}
        </pre>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            minHeight: 200,
          }}
        >
          <span style={{ fontSize: 40, lineHeight: 1 }}>⌘</span>
          <span
            style={{
              color: COLORS.text,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            Ready to generate
          </span>
          <span
            style={{
              color: COLORS.muted,
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              textAlign: "center",
              maxWidth: 240,
            }}
          >
            Describe your problem and hit Generate to create a structured Claude Code prompt.
          </span>
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        textarea { color-scheme: dark; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 768px) {
          .tab-bar { display: none !important; }
          .mobile-panel { display: flex !important; }
        }
      `}</style>

      <div
        style={{
          minHeight: "100dvh",
          background: COLORS.bg,
          color: COLORS.text,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            borderBottom: `1px solid ${COLORS.border}`,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 20 }}>⚡</span>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 18,
              color: COLORS.text,
              letterSpacing: "-0.01em",
            }}
          >
            Prompt Studio
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              color: COLORS.muted,
            }}
          >
            Claude Code · Powered by Gemini
          </span>
        </header>

        <div className="mobile-panel" style={{ flex: 1, display: "none", overflow: "hidden" }}>
          <div
            style={{
              flex: 1,
              borderRight: `1px solid ${COLORS.border}`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "12px 16px 0",
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.1em",
                color: COLORS.muted,
                textTransform: "uppercase",
                flexShrink: 0,
              }}
            >
              Input
            </div>
            {inputPanel}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div
              style={{
                padding: "12px 16px 0",
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.1em",
                color: COLORS.muted,
                textTransform: "uppercase",
                flexShrink: 0,
              }}
            >
              Output
            </div>
            {outputPanel}
          </div>
        </div>

        <div
          className="mobile-only"
          style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}
        >
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {tab === "input" ? inputPanel : outputPanel}
          </div>
        </div>

        <div
          className="tab-bar"
          style={{
            display: "flex",
            borderTop: `1px solid ${COLORS.border}`,
            background: COLORS.card,
            flexShrink: 0,
          }}
        >
          {(["input", "output"] as const).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: "14px 0",
                  background: "transparent",
                  border: "none",
                  borderTop: `2px solid ${active ? COLORS.accent : "transparent"}`,
                  color: active ? COLORS.accent : COLORS.muted,
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                }}
              >
                {t === "input" ? "✏️ Input" : "⚡ Output"}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
