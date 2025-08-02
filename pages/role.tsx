import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import GlobalNav from '../components/GlobalNav';
import { 
  getPageContainerStyle, 
  getMainContainerStyle, 
  getButtonStyle,
  getTitleStyle,
  getCardStyle,
  LAYOUT_CONFIG 
} from "../utils/layoutConfig";

type BackgroundOption = {
  label: string;
  summary: string;
  description: string;
};

type ModularRole = {
  background: string | null;
  socialRole: string | null;
  personality: string[];
};

const BACKGROUNDS: BackgroundOption[] = [
  { 
    label: "Orphaned Young", 
    summary: "Raised by the streets, fiercely independent.",
    description: "I lost my parents in a tragedy that forced me to grow up fast. I've navigated the world on my own, learning to be self-reliant and trust only a select few. This path has made me resilient, but also left me with a deep-seated longing for connection." 
  },
  { 
    label: "Anime Pilgrim", 
    summary: "A room full of figures, a heart full of waifus.",
    description: "My life's mission is to collect every limited edition figure and rare art book. My room is a shrine to 2D culture, a carefully curated museum of passion. I've spent countless hours on forums and traveled to conventions, all in the pursuit of the ultimate collection." 
  },
  { 
    label: "Alien Anthropologist", 
    summary: "Observing humans, trying to blend in.",
    description: "I was sent to this planet to study human behavior, but the mission has become... complicated. I'm operating undercover, trying to understand your strange customs like 'small talk' and 'memes'. My biggest challenge is not accidentally revealing my true form when someone mentions Area 51." 
  },
  { 
    label: "Lottery Winner", 
    summary: "Accidentally rich, existentially confused.",
    description: "One day I was struggling to pay rent, the next I had more money than I knew what to do with. Winning the lottery changed everything overnight. Now I'm navigating a world of fake friends, absurd luxury, and the new challenge of finding genuine purpose." 
  },
  { 
    label: "Amnesiac", 
    summary: "No past, only a mysterious key.",
    description: "I woke up in a strange city with no memory of who I am. The only clue to my past is a strange, ornate key I was holding. Every day is a blank slate, and I'm piecing together my identity one fragment at a time, hoping this key unlocks more than just a door." 
  },
  { 
    label: "Cult Survivor", 
    summary: "Relearning the world, one day at a time.",
    description: "I spent years in a high-control group, isolated from the outside world. Escaping was the hardest thing I've ever done, and now I'm rediscovering everything from pop music to personal freedom. The world feels overwhelming and beautiful all at once." 
  },
  { 
    label: "Former Child Star", 
    summary: "Peaked at 12, navigating life after fame.",
    description: "I was famous before I could legally drive. My face was on lunchboxes. But fame is fleeting. Now I'm trying to figure out who I am when the cameras are off, navigating adulthood after a childhood spent in the spotlight." 
  },
  { 
    label: "Time Traveler's Intern", 
    summary: "Fixing paradoxes, fetching coffee across eras.",
    description: "My boss is a chaotic time traveler, and my job is to clean up their messes across history. One day I'm preventing a temporal paradox in ancient Rome, the next I'm just trying to make sure they don't accidentally erase coffee from the timeline. It's an internship with... unusual hours."
  }
];

const SOCIAL_ROLES = [
  "Police Officer",
  "Detective",
  "High School Math Teacher",
  "Chinese Cook",
  "Startup CEO",
  "Stand-up Comedian",
  "Street Artist",
  "ER Doctor",
  "Bartender",
  "Librarian"
];

const PERSONALITIES = [
  "Playful",
  "Serious",
  "Mysterious",
  "Prankster",
  "Flirty",
  "Shy",
  "Confident",
  "Anxious",
  "Grumpy",
  "Kind",
  "Arrogant",
  "Curious",
  "Sarcastic",
  "Honest",
  "Deceptive"
];

export default function RolePage() {
  const router = useRouter();
  const [role, setRole] = useState<ModularRole>({
    background: null,
    socialRole: null,
    personality: [],
  });
  const [showBackgroundModal, setShowBackgroundModal] = useState<BackgroundOption | null>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      try {
        const parsedRole = JSON.parse(savedRole);
        if (parsedRole && typeof parsedRole === 'object' && 'background' in parsedRole && 'socialRole' in parsedRole && 'personality' in parsedRole) {
            setRole(parsedRole);
        }
      } catch (e) {
        console.error("Failed to parse user role from localStorage", e);
      }
    }
  }, []);

  const handleSave = () => {
    // Save role data to localStorage
    localStorage.setItem('userRole', JSON.stringify(role));
    router.push('/voice');
  };

  return (
    <div style={getPageContainerStyle()}>
      <GlobalNav />
      <div style={getMainContainerStyle()}>
        {/* Header */}
        <div style={{
          textAlign: "center",
          marginBottom: "30px"
        }}>
          <h1 style={{
            color: "#fff",
            fontSize: "28px",
            fontWeight: "700",
            margin: "0 0 10px 0"
          }}>
            🎭 Pick Your Role
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: "16px",
            margin: "0"
          }}>
            Define your personality and social role
          </p>
        </div>

        {/* Background Selection */}
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{
            color: "#fff",
            fontSize: "20px",
            fontWeight: "600",
            margin: "0 0 15px 0"
          }}>
            Background
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "12px"
          }}>
            {BACKGROUNDS.map(bg => (
              <button
                key={bg.label}
                onClick={() => setShowBackgroundModal(bg)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: role.background === bg.label
                    ? "2px solid #4fc3f7"
                    : "1px solid rgba(255,255,255,0.3)",
                  background: role.background === bg.label
                    ? "rgba(79,195,247,0.3)"
                    : "rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontWeight: "500",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                  {bg.label}
                </div>
                <div style={{
                  fontSize: "12px",
                  opacity: "0.7",
                  fontWeight: "400"
                }}>
                  {bg.summary}
                </div>

              </button>
            ))}
          </div>
        </div>

        {/* Social Role Selection */}
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{
            color: "#fff",
            fontSize: "20px",
            fontWeight: "600",
            margin: "0 0 15px 0"
          }}>
            Social Role
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "10px"
          }}>
            {SOCIAL_ROLES.map(sr => (
              <button
                key={sr}
                onClick={() => setRole(r => ({ ...r, socialRole: sr }))}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: role.socialRole === sr
                    ? "2px solid #7b61ff"
                    : "1px solid rgba(255,255,255,0.3)",
                  background: role.socialRole === sr
                    ? "rgba(123,97,255,0.3)"
                    : "rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {sr}
              </button>
            ))}
          </div>
        </div>

        {/* Personality Selection */}
        <div style={{ marginBottom: "40px" }}>
          <h3 style={{
            color: "#fff",
            fontSize: "20px",
            fontWeight: "600",
            margin: "0 0 15px 0"
          }}>
            Personality
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "10px"
          }}>
            {PERSONALITIES.map(p => (
              <button
                key={p}
                onClick={() => {
                  const isSelected = role.personality.includes(p);
                  if (isSelected) {
                    setRole(r => ({ ...r, personality: r.personality.filter(item => item !== p) }));
                  } else {
                    setRole(r => ({ ...r, personality: [...r.personality, p] }));
                  }
                }}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: role.personality.includes(p)
                    ? "2px solid #ff6b6b"
                    : "1px solid rgba(255,255,255,0.3)",
                  background: role.personality.includes(p)
                    ? "rgba(255,107,107,0.3)"
                    : "rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div style={{
          textAlign: "center"
        }}>
          <button
            onClick={handleSave}
            disabled={!role.background || !role.socialRole || role.personality.length === 0}
            style={{
              background: "linear-gradient(45deg, #4fc3f7, #7b61ff)",
              border: "none",
              borderRadius: "12px",
              padding: "14px 32px",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "600",
              cursor: role.background && role.socialRole && role.personality.length > 0 ? "pointer" : "not-allowed",
              opacity: role.background && role.socialRole && role.personality.length > 0 ? 1 : 0.6,
              transition: "all 0.2s ease"
            }}
          >
            Save Role
          </button>
        </div>

        {/* Progress Indicator */}
        <div style={{
          marginTop: "20px",
          textAlign: "center"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "10px"
          }}>
            <div style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: role.background ? "#4fc3f7" : "rgba(255,255,255,0.3)"
            }} />
            <div style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: role.socialRole ? "#7b61ff" : "rgba(255,255,255,0.3)"
            }} />
            <div style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: role.personality.length > 0 ? "#ff6b6b" : "rgba(255,255,255,0.3)"
            }} />
          </div>
          <p style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "14px",
            margin: "0"
          }}>
            {role.background && role.socialRole && role.personality.length > 0 
              ? "All sections completed! 🎉" 
              : "Complete all sections to save your role"
            }
          </p>
        </div>

        {/* Background Modal */}
        {showBackgroundModal && (
          <div 
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              background: 'rgba(0,0,0,0.6)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              zIndex: 100
            }}
            onClick={() => setShowBackgroundModal(null)}
          >
            <div 
              style={{ 
                background: '#2c3454', 
                padding: '24px', 
                borderRadius: '16px', 
                maxWidth: '400px', 
                width: '90%',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ marginTop: 0, color: '#4fc3f7' }}>{showBackgroundModal.label}</h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, marginBottom: '24px' }}>
                {showBackgroundModal.description}
              </p>
              <button
                onClick={() => {
                  setRole(r => ({ ...r, background: showBackgroundModal.label }));
                  setShowBackgroundModal(null);
                }}
                style={getButtonStyle('primary')}
              >
                Select Background
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}