import Link from "next/link";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0A0A0F",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        fontFamily: "sans-serif",
        color: "#F0EEFF",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>⚡ Prompt Studio</h1>
      <p style={{ color: "#6B7280", fontSize: 14 }}>Gemini-powered Claude Code prompt generator</p>
      <Link
        href="/prompt-studio"
        style={{
          marginTop: 8,
          padding: "12px 28px",
          background: "#7C6AF7",
          borderRadius: 10,
          color: "#fff",
          textDecoration: "none",
          fontWeight: 700,
          fontSize: 15,
        }}
      >
        Open Prompt Studio →
      </Link>
    </div>
  );
}
