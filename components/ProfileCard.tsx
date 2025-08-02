import React from "react";
import { UserProfile } from "../types";
import { getRandomMoodText } from "../utils/helpers";

interface ProfileCardProps {
  user: UserProfile;
  onInteraction: (
    type: "thumbs" | "message" | "voice" | "play",
    details?: {
      message?: string;
      target?: "voice" | "role" | "mood";
      voice?: string;
    }
  ) => void;
  onAvatarClick: () => void;
  currentUserIndex: number;
  thumbsClicked: Record<string, boolean>;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  onInteraction,
  onAvatarClick,
  currentUserIndex,
  thumbsClicked,
}) => {
  return (
    <div
      style={{
        background: "rgba(44,52,80,0.95)",
        borderRadius: 20,
        padding: "20px",
        marginBottom: "16px",
        border: "1px solid rgba(255,255,255,0.1)",
        position: "relative",
      }}
    >
      {/* Avatar Section */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div
          onClick={onAvatarClick}
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            margin: "0 auto 12px",
            background: "#222",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            border: "2px solid rgba(123,97,255,0.3)",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <div style={{ fontSize: 48, color: "#666" }}>👤</div>
        </div>

        <div
          style={{
            fontWeight: 600,
            color: "#fff",
            marginBottom: "6px",
            fontSize: "18px",
          }}
        >
          {user.name}, {user.age}
        </div>
        <div style={{ fontSize: 14, color: "#b0b8d0", marginBottom: "8px" }}>
          {user.city}
        </div>
        <div style={{ fontSize: 14, color: "#7b61ff", fontStyle: "italic" }}>
          {user.bio}
        </div>
      </div>

      {/* Basic Info */}
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            fontWeight: 600,
            color: "#7b61ff",
            marginBottom: "6px",
            fontSize: "16px",
          }}
        >
          📝 About Me
        </div>
        <div style={{ fontSize: 14, color: "#b0b8d0", lineHeight: "1.5" }}>{user.aboutMe}</div>
      </div>

      {/* Interests */}
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            fontWeight: 600,
            color: "#7b61ff",
            marginBottom: "6px",
            fontSize: "16px",
          }}
        >
          🎯 Interests
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {user.interests.map((interest, index) => (
            <span
              key={index}
              style={{
                background: "rgba(123,97,255,0.2)",
                border: "1px solid rgba(123,97,255,0.3)",
                borderRadius: "12px",
                padding: "4px 8px",
                fontSize: "12px",
                color: "#7b61ff",
              }}
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Looking For */}
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            fontWeight: 600,
            color: "#7b61ff",
            marginBottom: "6px",
            fontSize: "16px",
          }}
        >
          🔍 Looking For
        </div>
        <div style={{ fontSize: 14, color: "#b0b8d0", lineHeight: "1.5" }}>{user.lookingFor}</div>
      </div>



      {/* Personal Info */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontWeight: 600, color: "#7b61ff", marginBottom: "6px", fontSize: "16px" }}>
          👤 Personal Info
        </div>
        <div style={{ fontSize: 14, color: "#b0b8d0", lineHeight: "1.5" }}>
          <div>
            ♈ {user.zodiac} • 🔮 {user.mbti}
          </div>
          <div>
            🎂 {user.birthDate} • 🧬 {user.genderIdentity}
          </div>
          <div>🌐 {user.languages.join(", ")}</div>
          <div>📍 {user.city}</div>
          <div>💘 Seeking: {user.seekingGender.join(", ")}</div>
        </div>
      </div>

      {/* Tags */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {user.tags.map((tag, index) => (
            <span
              key={index}
              style={{
                background: "rgba(123,97,255,0.2)",
                border: "1px solid rgba(123,97,255,0.3)",
                borderRadius: "12px",
                padding: "4px 8px",
                fontSize: "12px",
                color: "#7b61ff",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>



      {/* Voice Intro with Interaction */}
      <div style={{
        background: "rgba(123,97,255,0.1)",
        borderRadius: 12,
        padding: "12px",
        marginBottom: "16px",
        position: "relative"
      }}>
        <div style={{ fontWeight: 600, color: "#7b61ff", marginBottom: "4px", fontSize: "16px" }}>
          🎤 Voice Intro
        </div>
        <div style={{ fontSize: 14, color: "#b0b8d0", marginBottom: "8px" }}>
          {user.voiceIntroText || "Click to hear my voice intro"}
        </div>
        <button
          onClick={() => onInteraction('play', { target: 'voice', voice: user.voice })}
          style={{
            background: "rgba(123,97,255,0.2)",
            border: "1px solid #7b61ff",
            borderRadius: "8px",
            color: "#7b61ff",
            cursor: "pointer",
            fontSize: 14,
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: 500
          }}
        >
          🔊 Play Voice Intro
        </button>
        {/* Interaction buttons for Voice */}
        <div style={{
          position: "absolute",
          top: "6px",
          right: "6px",
          display: "flex",
          gap: "3px"
        }}>
          <button
            onClick={() => onInteraction('thumbs', { target: 'voice' })}
            style={{
              width: "20px",
              height: "20px",
              background: thumbsClicked[`${currentUserIndex}-voice`] ? "rgba(255,193,7,0.8)" : "rgba(255,193,7,0.2)",
              border: "1px solid #ffc107",
              borderRadius: "50%",
              color: "#ffc107",
              cursor: "pointer",
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: thumbsClicked[`${currentUserIndex}-voice`] ? "scale(1.1)" : "scale(1)",
              transition: "all 0.2s"
            }}
            title="Thumbs up voice"
          >
            {thumbsClicked[`${currentUserIndex}-voice`] ? "👍" : "👍"}
          </button>
          <button
            onClick={() => onInteraction('message', { target: 'voice' })}
            style={{
              width: "20px",
              height: "20px",
              background: "rgba(123,97,255,0.2)",
              border: "1px solid #7b61ff",
              borderRadius: "50%",
              color: "#7b61ff",
              cursor: "pointer",
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Message about voice"
          >
            💬
          </button>
          <button
            onClick={() => onInteraction('voice', { target: 'voice' })}
            style={{
              width: "20px",
              height: "20px",
              background: "rgba(79,195,247,0.2)",
              border: "1px solid #4fc3f7",
              borderRadius: "50%",
              color: "#4fc3f7",
              cursor: "pointer",
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Send voice message"
          >
            🎤
          </button>
        </div>
      </div>

      {/* Role Info with Interaction */}
      <div style={{
        background: "rgba(123,97,255,0.1)",
        borderRadius: 12,
        padding: "12px",
        marginBottom: "16px",
        position: "relative"
      }}>
        <div style={{ fontWeight: 600, color: "#7b61ff", marginBottom: "4px", fontSize: "16px" }}>
          🎭 {user.role.background}
        </div>
        <div style={{ fontSize: 14, color: "#b0b8d0" }}>
          {user.role.socialRole} • {user.role.personality}
        </div>
        {/* Interaction buttons for Role */}
        <div style={{
          position: "absolute",
          top: "6px",
          right: "6px",
          display: "flex",
          gap: "3px"
        }}>
          <button
            onClick={() => onInteraction('thumbs', { target: 'role' })}
            style={{
              width: "20px",
              height: "20px",
              background: thumbsClicked[`${currentUserIndex}-role`] ? "rgba(255,193,7,0.8)" : "rgba(255,193,7,0.2)",
              border: "1px solid #ffc107",
              borderRadius: "50%",
              color: "#ffc107",
              cursor: "pointer",
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: thumbsClicked[`${currentUserIndex}-role`] ? "scale(1.1)" : "scale(1)",
              transition: "all 0.2s"
            }}
            title="Thumbs up role"
          >
            {thumbsClicked[`${currentUserIndex}-role`] ? "👍" : "👍"}
          </button>
          <button
            onClick={() => onInteraction('message', { target: 'role' })}
            style={{
              width: "20px",
              height: "20px",
              background: "rgba(123,97,255,0.2)",
              border: "1px solid #7b61ff",
              borderRadius: "50%",
              color: "#7b61ff",
              cursor: "pointer",
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Message about role"
          >
            💬
          </button>
          <button
            onClick={() => onInteraction('voice', { target: 'role' })}
            style={{
              width: "20px",
              height: "20px",
              background: "rgba(79,195,247,0.2)",
              border: "1px solid #4fc3f7",
              borderRadius: "50%",
              color: "#4fc3f7",
              cursor: "pointer",
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Send voice message"
          >
            🎤
          </button>
        </div>
      </div>

      {/* Mood Info with Interaction */}
      <div style={{
        background: "rgba(123,97,255,0.1)",
        borderRadius: 12,
        padding: "12px",
        marginBottom: "20px",
        position: "relative"
      }}>
        <div style={{ fontWeight: 600, color: "#7b61ff", marginBottom: "4px", fontSize: "16px" }}>
          🌟 Today's Mood: {user.mood}
        </div>
        <div style={{ fontSize: 14, color: "#b0b8d0", marginBottom: "8px" }}>
          {user.moodVoiceText || getRandomMoodText(user.mood)}
        </div>
        <button
          onClick={() => onInteraction('play', { target: 'mood', voice: user.voice })}
          style={{
            background: "rgba(123,97,255,0.2)",
            border: "1px solid #7b61ff",
            borderRadius: "8px",
            color: "#7b61ff",
            cursor: "pointer",
            fontSize: 14,
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: 500
          }}
        >
          🎵 Play Mood Voice
        </button>
        {/* Interaction buttons for Mood */}
        <div style={{
          position: "absolute",
          top: "6px",
          right: "6px",
          display: "flex",
          gap: "3px"
        }}>
          <button
            onClick={() => onInteraction('thumbs', { target: 'mood' })}
            style={{
              width: "20px",
              height: "20px",
              background: thumbsClicked[`${currentUserIndex}-mood`] ? "rgba(255,193,7,0.8)" : "rgba(255,193,7,0.2)",
              border: "1px solid #ffc107",
              borderRadius: "50%",
              color: "#ffc107",
              cursor: "pointer",
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: thumbsClicked[`${currentUserIndex}-mood`] ? "scale(1.1)" : "scale(1)",
              transition: "all 0.2s"
            }}
            title="Thumbs up mood"
          >
            {thumbsClicked[`${currentUserIndex}-mood`] ? "👍" : "👍"}
          </button>
          <button
            onClick={() => onInteraction('message', { target: 'mood' })}
            style={{
              width: "20px",
              height: "20px",
              background: "rgba(123,97,255,0.2)",
              border: "1px solid #7b61ff",
              borderRadius: "50%",
              color: "#7b61ff",
              cursor: "pointer",
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Message about mood"
          >
            💬
          </button>
          <button
            onClick={() => onInteraction('voice', { target: 'mood' })}
            style={{
              width: "20px",
              height: "20px",
              background: "rgba(79,195,247,0.2)",
              border: "1px solid #4fc3f7",
              borderRadius: "50%",
              color: "#4fc3f7",
              cursor: "pointer",
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Send voice message"
          >
            🎤
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
