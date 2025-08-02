import { useEffect, useState } from "react";
import GlobalNav from "../components/GlobalNav";
import { useRouter } from "next/router";

export default function FeedPage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    name: "Your Name",
    role: { background: null, socialRole: null, personality: null },
  });

  useEffect(() => {
    const name = localStorage.getItem("profileName");
    if (name) setProfileData(prev => ({ ...prev, name }));

    const roleStr = localStorage.getItem("profileRole");
    if (roleStr) {
      try {
        const role = JSON.parse(roleStr);
        setProfileData(prev => ({ ...prev, role }));
      } catch {}
    }
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at 60% 20%, #232b4d 0%, #0c0c0c 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#fff",
        padding: "20px 0",
      }}
    >
      <GlobalNav />
      <div
        style={{
          background: "rgba(30,34,54,0.92)",
          borderRadius: 28,
          boxShadow: "0 8px 32px 0 rgba(31,38,135,0.37)",
          padding: "40px 28px 32px 28px",
          maxWidth: 450,
          width: "96vw",
          margin: "32px 0",
          border: "1.5px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 18 }}>
          🎉 Welcome to the World!
        </h1>
        <p style={{ fontSize: 18, color: "#b0b8d0", marginBottom: 24 }}>
          Hello {profileData.name}! You've successfully entered the virtual
          world.
        </p>

        <div
          style={{
            background: "rgba(44,52,80,0.7)",
            borderRadius: 10,
            padding: "14px 10px",
            marginBottom: 24,
            fontSize: 15,
            textAlign: "left",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Your Role</div>
          <div>
            Background:{" "}
            {profileData.role.background || (
              <span style={{ color: "#888" }}>Not set</span>
            )}
          </div>
          <div>
            Social Role:{" "}
            {profileData.role.socialRole || (
              <span style={{ color: "#888" }}>Not set</span>
            )}
          </div>
          <div>
            Personality:{" "}
            {profileData.role.personality || (
              <span style={{ color: "#888" }}>Not set</span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
          <button
            style={{
              padding: "12px 32px",
              background: "linear-gradient(90deg, #4fc3f7 0%, #7b61ff 100%)",
              border: "none",
              borderRadius: 12,
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 2px 8px 0 rgba(79,195,247,0.15)",
            }}
            onClick={() => router.push("/profile")}
          >
            View Profile
          </button>
          <button
            style={{
              padding: "12px 32px",
              background: "linear-gradient(90deg, #7b61ff 0%, #4fc3f7 100%)",
              border: "none",
              borderRadius: 12,
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 2px 8px 0 rgba(123,97,255,0.15)",
            }}
            onClick={() => router.push("/avatar")}
          >
            Edit Avatar
          </button>
        </div>
      </div>
    </div>
  );
}
