import React from "react";
import { useRouter } from "next/router";
import { UserProfile, Notification } from "../types";

interface AppHeaderProps {
  userProfile: UserProfile;
  notifications: Notification[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  onNotificationClick: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  userProfile,
  notifications,
  showNotifications,
  setShowNotifications,
  onNotificationClick,
}) => {
  const router = useRouter();
  const currentPath = router.pathname;

  const navLinks = [
    { href: "/avatar", label: "👤 My Avatar" },
    { href: "/role", label: "🎭 My Role" },
    { href: "/voice", label: "🎤 My Voice" },
    { href: "/profile", label: "📝 My Profile" },
  ];

  return (
    <div
      style={{
        textAlign: "center",
        marginBottom: "16px",
        position: "relative",
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
        VerseZ Social Playground
      </h1>

      {/* Notification Bell */}
      <button
        onClick={() => {
          setShowNotifications(!showNotifications);
          if (!showNotifications) {
            onNotificationClick(); // Mark notifications as read when opening
          }
        }}
        style={{
          position: "absolute",
          top: "0",
          right: "0",
          background: "rgba(255,193,7,0.2)",
          border: "1px solid rgba(255,193,7,0.3)",
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#ffc107",
          fontSize: "16px",
        }}
      >
        🔔
        {notifications.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "#ff4757",
              color: "#fff",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: "bold",
            }}
          >
            {notifications.length}
          </div>
        )}
      </button>

      {/* Navigation Menu */}
      <div
        style={{
          marginTop: "16px", // Added more space
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`versez-tab-button ${
              currentPath === link.href ? "active" : ""
            }`}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
};

export default AppHeader;
