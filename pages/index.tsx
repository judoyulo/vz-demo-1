import React from "react";
import { useRouter } from "next/router";
import GlobalNav from "../components/GlobalNav";
import { 
  getPageContainerStyle, 
  getMainContainerStyle, 
  getButtonStyle,
  getTitleStyle,
  LAYOUT_CONFIG 
} from "../utils/layoutConfig";
import { voiceProcessingService } from '../lib/voiceProcessing';

// Data for randomization - ideally this would come from a shared source
const BACKGROUNDS = [
  "Orphaned Young",
  "Anime Pilgrim",
  "Alien Anthropologist",
  "Lottery Winner",
  "Amnesiac",
  "Cult Survivor",
  "Former Child Star",
  "Time Traveler's Intern"
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
  "Playful", "Serious", "Mysterious", "Prankster", "Flirty", "Shy",
  "Confident", "Anxious", "Grumpy", "Kind", "Arrogant", "Curious",
  "Sarcastic", "Honest", "Deceptive"
];

const VOICE_OPTIONS = voiceProcessingService.getAvailableEffects().map(effect => effect.id);

export default function HomePage() {
  const router = useRouter();

  const handleJumpToPlayground = () => {
    // 1. Generate Random Role
    const randomBackground = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
    const randomSocialRole = SOCIAL_ROLES[Math.floor(Math.random() * SOCIAL_ROLES.length)];
    // Select 1 to 3 random personalities
    const shuffledPersonalities = PERSONALITIES.sort(() => 0.5 - Math.random());
    const personalityCount = Math.floor(Math.random() * 3) + 1;
    const randomPersonalities = shuffledPersonalities.slice(0, personalityCount);

    const randomRole = {
      background: randomBackground,
      socialRole: randomSocialRole,
      personality: randomPersonalities,
    };

    // 2. Select Random Voice
    const randomVoice = VOICE_OPTIONS[Math.floor(Math.random() * VOICE_OPTIONS.length)];

    // 3. Save to localStorage
    localStorage.setItem('userRole', JSON.stringify(randomRole));
    localStorage.setItem('selectedVoice', randomVoice);
    // We can also set a dummy avatar URL if needed, or skip it
    localStorage.setItem('rpmAvatarUrl', 'https://models.readyplayer.me/658be9e8fc8bec95443583f6.glb');
    
    console.log("Generated Random Profile:", {
        role: randomRole,
        voice: randomVoice,
    });

    // 4. Navigate to the app page
    router.push("/app");
  };

  return (
    <div style={getPageContainerStyle()}>
      <GlobalNav />
      <div
        style={{
          ...getMainContainerStyle(),
          textAlign: "center",
          padding: `${LAYOUT_CONFIG.spacing.container} ${LAYOUT_CONFIG.spacing.container}`,
        }}
      >
        <h1 style={getTitleStyle('h1')}>
          Welcome to VerseZ (Concept Demo)
        </h1>
        <p style={{ 
          fontSize: LAYOUT_CONFIG.fontSize.body, 
          opacity: 0.85, 
          marginBottom: LAYOUT_CONFIG.spacing.section,
          color: LAYOUT_CONFIG.colors.textMuted 
        }}>
          Step into your digital self. Define it. Live it. Play it.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button
            style={{
              ...getButtonStyle('primary'),
              marginTop: LAYOUT_CONFIG.spacing.small,
              padding: `${LAYOUT_CONFIG.spacing.small} ${LAYOUT_CONFIG.spacing.section}`,
              fontSize: LAYOUT_CONFIG.fontSize.body,
            }}
            onClick={() => router.push("/avatar")}
          >
            Create Your Avatar
          </button>
          <button
            style={{
              ...getButtonStyle('secondary'), // Assuming you have a secondary style or it falls back gracefully
              marginTop: LAYOUT_CONFIG.spacing.small,
              padding: `${LAYOUT_CONFIG.spacing.small} ${LAYOUT_CONFIG.spacing.section}`,
              fontSize: LAYOUT_CONFIG.fontSize.body,
            }}
            onClick={handleJumpToPlayground}
          >
            Jump to Social Playground
          </button>
        </div>
      </div>
      <div style={{ opacity: 0.25, fontSize: 13, marginTop: 12 }}>
        Powered by Ready Player Me
      </div>
    </div>
  );
}
