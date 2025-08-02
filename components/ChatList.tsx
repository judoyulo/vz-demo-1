import React from "react";
import { Chat } from "../types";
import { formatTimeAgo } from "../utils/helpers";

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  onAvatarClick: (chat: Chat) => void;
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChat,
  onChatSelect,
  onAvatarClick,
}) => {
  if (chats.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 20px",
          color: "#b0b8d0",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: "16px" }}>💬</div>
        <div style={{ marginBottom: "8px" }}>No conversations yet</div>
        <div style={{ fontSize: 14, opacity: 0.7 }}>
          Start connecting with people to see your chats here!
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          overflowY: "auto",
          paddingRight: "4px",
        }}
      >
        {chats.map(chat => (
          <div
            key={chat.id}
            onClick={() => onChatSelect(chat)}
            style={{
              background:
                selectedChat?.id === chat.id
                  ? "rgba(123,97,255,0.2)"
                  : "rgba(44,52,80,0.95)",
              borderRadius: 16,
              padding: "16px",
              marginBottom: "12px",
              cursor: "pointer",
              border:
                selectedChat?.id === chat.id
                  ? "1px solid rgba(123,97,255,0.3)"
                  : "1px solid rgba(255,255,255,0.1)",
              transition: "all 0.2s ease",
              position: "relative",
            }}
            onMouseEnter={e => {
              if (selectedChat?.id !== chat.id) {
                e.currentTarget.style.background = "rgba(44,52,80,0.98)";
              }
            }}
            onMouseLeave={e => {
              if (selectedChat?.id !== chat.id) {
                e.currentTarget.style.background = "rgba(44,52,80,0.95)";
              }
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Avatar */}
              <div style={{ position: "relative" }}>
                <img
                  src={chat.userAvatar}
                  alt={chat.userName}
                  onClick={e => {
                    e.stopPropagation();
                    onAvatarClick(chat);
                  }}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "2px",
                    right: "2px",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: chat.isOnline ? "#4caf50" : "#9e9e9e",
                    border: "2px solid rgba(44,52,80,0.8)",
                  }}
                />
              </div>

              {/* Chat Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "4px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#fff",
                      fontSize: "14px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {chat.userName}
                    {chat.isAIBot && (
                      <span
                        style={{
                          background: "rgba(123,97,255,0.2)",
                          color: "#7b61ff",
                          fontSize: "10px",
                          padding: "2px 6px",
                          borderRadius: "8px",
                          marginLeft: "6px",
                          fontWeight: "normal",
                        }}
                      >
                        AI
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#b0b8d0",
                      whiteSpace: "nowrap",
                      marginLeft: "8px",
                    }}
                  >
                    {formatTimeAgo(chat.lastMessage.timestamp)}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    color: "#b0b8d0",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: "1.3",
                  }}
                >
                  {chat.lastMessage.type === "voice" && "🎤 "}
                  {chat.lastMessage.content}
                </div>
              </div>

              {/* Unread Badge */}
              {chat.unreadCount > 0 && (
                <div
                  style={{
                    background: "#ff4757",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: "bold",
                    minWidth: "20px",
                  }}
                >
                  {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
