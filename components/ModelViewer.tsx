import Script from "next/script";
import { useState, useEffect } from "react";

export default function ModelViewer({ url }: { url: string }) {
  const [is3DModel, setIs3DModel] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Check if URL is a 3D model (glb, gltf, etc.) or 2D image
    const is3D =
      url.includes(".glb") ||
      url.includes(".gltf") ||
      url.includes("readyplayer.me");
    setIs3DModel(is3D);
    setIsLoading(false);
  }, [url]);

  // For 2D images (like DiceBear), use regular img tag
  if (!is3DModel) {
    return (
      <div
        style={{
          width: "100%",
          height: "500px",
          background: "#111",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <img
          src={url}
          alt="Avatar"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center",
            borderRadius: "12px",
          }}
          onError={() => setHasError(true)}
        />
        {hasError && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#888",
              fontSize: "16px",
              background: "#111",
              borderRadius: "12px",
            }}
          >
            Avatar failed to load
          </div>
        )}
      </div>
    );
  }

  // For 3D models, use model-viewer
  return (
    <>
      <Script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
        strategy="beforeInteractive"
      />
      {/* @ts-ignore */}
      <model-viewer
        src={url}
        alt="Your Avatar"
        auto-rotate
        camera-controls
        shadow-intensity="1"
        exposure="1"
        style={{
          width: "100%",
          height: "500px",
          background: "#111",
          borderRadius: "12px",
        }}
        onError={() => setHasError(true)}
      />
      {hasError && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#888",
            fontSize: "16px",
            textAlign: "center",
          }}
        >
          3D Avatar failed to load
        </div>
      )}
    </>
  );
}
