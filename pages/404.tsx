import React from "react";
import { useRouter } from "next/router";

export default function Custom404() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#fff",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          padding: "30px",
          maxWidth: "450px",
          width: "96vw",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: "700", margin: "0 0 10px 0" }}>
          404 - Page Not Found
        </h1>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)", margin: "0 0 20px 0" }}>
          The page you're looking for doesn't exist.
        </p>
        <button
          style={{
            padding: "12px 24px",
            background: "linear-gradient(45deg, #4fc3f7, #7b61ff)",
            border: "none",
            borderRadius: "12px",
            color: "#fff",
            fontWeight: "600",
            fontSize: "16px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onClick={() => router.push("/")}
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
