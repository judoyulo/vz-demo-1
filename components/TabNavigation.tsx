import React from "react";
import { Chat } from "../types";

interface TabNavigationProps {
  activeTab: "profiles" | "chats";
  setActiveTab: (tab: "profiles" | "chats") => void;
  chats: Chat[];
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  chats,
}) => {
  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  return (
    <div className="versez-tabs-container">
      <div
        onClick={() => setActiveTab("profiles")}
        className={`versez-tab ${activeTab === "profiles" ? "active" : ""}`}
      >
        👥 Profile Bubble
      </div>
      <div
        onClick={() => setActiveTab("chats")}
        className={`versez-tab ${activeTab === "chats" ? "active" : ""}`}
        style={{ position: 'relative' }} // For positioning the unread count
      >
        💬 Chats
        {totalUnread > 0 && (
          <div
            style={{
              position: "absolute",
              top: "-2px",
              right: "-5px",
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
              border: '2px solid #232b4d' // Add a border to make it stand out
            }}
          >
            {totalUnread}
          </div>
        )}
      </div>
    </div>
  );
};

export default TabNavigation;
