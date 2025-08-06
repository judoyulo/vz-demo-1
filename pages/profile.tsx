import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ModelViewer from "../components/ModelViewer";
import GlobalNav from '../components/GlobalNav';
import { 
  getPageContainerStyle, 
  getMainContainerStyle, 
  getButtonStyle,
  getTitleStyle,
  getCardStyle,
  LAYOUT_CONFIG 
} from "../utils/layoutConfig";
import { speakWithElevenLabs } from "../utils/voiceUtils";
import { getVoiceId } from "../utils/voiceUtils";

// Voice options from professional voice processing service
const VOICE_OPTIONS = [
  // ElevenLabs Professional Female Voices
  { id: "elevenlabs-rachel", name: "👩 Rachel" },
  { id: "elevenlabs-bella", name: "👩 Bella" },
  { id: "elevenlabs-aria", name: "👩 Aria" },
  { id: "elevenlabs-sarah", name: "👩 Sarah" },
  { id: "elevenlabs-emily", name: "👩 Emily" },

  // ElevenLabs Professional Male Voices
  { id: "elevenlabs-domi", name: "👨 Domi" },
  { id: "elevenlabs-arnold", name: "👨 Arnold" },
  { id: "elevenlabs-josh", name: "👨 Josh" },
  { id: "elevenlabs-sam", name: "👨 Sam" },

  // ElevenLabs Character Voices
  { id: "elevenlabs-dorothy", name: "👵 Dorothy" },
  { id: "elevenlabs-charlie", name: "👴 Charlie" },
  { id: "elevenlabs-lily", name: "👧 Lily" },
  { id: "elevenlabs-tommy", name: "👦 Tommy" },

  // Enhanced Local Effects
  { id: "sweet-angel", name: "👼 Sweet Angel (Local)" },
  { id: "elegant-queen", name: "👑 Elegant Queen (Local)" },
  { id: "noble-knight", name: "⚔️ Noble Knight (Local)" },
  { id: "wise-sage", name: "🧙‍♂️ Wise Sage (Local)" },
  { id: "crystal-clear", name: "💎 Crystal Clear (Local)" },
];

type ProfileData = {
  name: string;
  age: string;
  location: string;
  bio: string;
  aboutMe: string;
  interests: string[];
  lookingFor: string;
  voice: string | null;
  voiceIntroUrl: string | null;
  moodVoiceUrl: string | null;
  tags: string[];
  mood: string;
  role: {
    background: string | null;
    socialRole: string | null;
    personality: string | null;
  };
  // 个性化信息
  zodiac: string;
  mbti: string;
  birthDate: string;
  genderIdentity: string;
  seekingGender: string[];
  languages: string[];
  city: string;
};

const INTEREST_OPTIONS = [
  "Gaming",
  "Music",
  "Travel",
  "Cooking",
  "Reading",
  "Sports",
  "Movies",
  "Art",
  "Technology",
  "Fitness",
  "Photography",
  "Dancing",
  "Hiking",
  "Coffee",
  "Pets",
  "Fashion",
  "Comedy",
  "Science",
];

const TAG_OPTIONS = [
  "#flirty",
  "#mysterious",
  "#gamer",
  "#lonely",
  "#adventurous",
  "#creative",
  "#nerdy",
  "#outgoing",
  "#introvert",
  "#romantic",
  "#sarcastic",
  "#optimistic",
  "#realistic",
  "#dreamer",
  "#leader",
];

const MOOD_OPTIONS = [
  { id: "browsing", name: "👀 Just browsing", desc: "看看而已" },
  { id: "roleplay", name: "🎭 Roleplay mode", desc: "想玩点角色" },
  { id: "connect", name: "💌 Looking to connect", desc: "想要共鸣" },
];

const ZODIAC_OPTIONS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const MBTI_OPTIONS = [
  { type: "INFP", desc: "The Mediator - Idealistic, creative, and empathetic" },
  {
    type: "ENFP",
    desc: "The Campaigner - Enthusiastic, creative, and sociable",
  },
  { type: "INFJ", desc: "The Advocate - Quiet, mystical, and inspiring" },
  {
    type: "ENFJ",
    desc: "The Protagonist - Charismatic, inspiring, and diplomatic",
  },
  {
    type: "INTJ",
    desc: "The Architect - Imaginative, strategic, and independent",
  },
  {
    type: "ENTJ",
    desc: "The Commander - Bold, imaginative, and strong-willed",
  },
  { type: "INTP", desc: "The Logician - Innovative, logical, and analytical" },
  { type: "ENTP", desc: "The Debater - Smart, curious, and thoughtful" },
  {
    type: "ISFP",
    desc: "The Adventurer - Flexible, charming, and spontaneous",
  },
  {
    type: "ESFP",
    desc: "The Entertainer - Spontaneous, energetic, and enthusiastic",
  },
  { type: "ISTP", desc: "The Virtuoso - Bold, practical, and experimental" },
  {
    type: "ESTP",
    desc: "The Entrepreneur - Smart, energetic, and very perceptive",
  },
  { type: "ISFJ", desc: "The Defender - Very dedicated, warm, and protective" },
  {
    type: "ESFJ",
    desc: "The Consul - Extraordinarily caring, social, and popular",
  },
  {
    type: "ISTJ",
    desc: "The Logistician - Practical, fact-minded, and reliable",
  },
  {
    type: "ESTJ",
    desc: "The Executive - Excellent administrators and managers",
  },
];

const GENDER_OPTIONS = ["Male", "Female", "Nonbinary", "Other"];

const LANGUAGE_OPTIONS = [
  "English",
  "中文",
  "Español",
  "Français",
  "Deutsch",
  "日本語",
  "한국어",
];

export default function ProfilePage() {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "Your Name",
    age: "",
    location: "",
    bio: "This is your bio. Tell others about yourself!",
    aboutMe: "",
    interests: [],
    lookingFor: "",
    voice: null,
    voiceIntroUrl: null,
    moodVoiceUrl: null,
    tags: [],
    mood: "browsing",
    role: { background: null, socialRole: null, personality: null },
    zodiac: "",
    mbti: "",
    birthDate: "",
    genderIdentity: "",
    seekingGender: [],
    languages: [],
    city: "",
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<ProfileData>(profileData);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isRecordingMood, setIsRecordingMood] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [isAiProfile, setIsAiProfile] = useState(false);

  useEffect(() => {
    // Check if this is an AI Bot profile view
    const tempAiProfileData = localStorage.getItem("tempAiProfileData");
    if (tempAiProfileData) {
      try {
        const aiProfile = JSON.parse(tempAiProfileData);
        setProfileData(aiProfile);
        setAvatarUrl(aiProfile.avatar || aiProfile.userAvatar);
        setIsAiProfile(true);

        // Clear the temporary data after loading
        localStorage.removeItem("tempAiProfileData");

        // Don't load user profile data if we're viewing AI profile
        return;
      } catch (error) {
        console.error("Error parsing AI profile data:", error);
        localStorage.removeItem("tempAiProfileData");
      }
    }

    const url =
      localStorage.getItem("avatarUrl") ||
      "https://models.readyplayer.me/64f7b8b8b8b8b8b8b8b8b8b.glb";
    setAvatarUrl(url);

    // Load profile data from localStorage
    const roleStr = localStorage.getItem("userRole");
    if (roleStr) {
      try {
        const role = JSON.parse(roleStr);
        setProfileData(prev => ({ ...prev, role }));
      } catch {}
    }

    const name = localStorage.getItem("profileName");
    if (name) setProfileData(prev => ({ ...prev, name }));

    const bio = localStorage.getItem("profileBio");
    if (bio) setProfileData(prev => ({ ...prev, bio }));

    const age = localStorage.getItem("profileAge");
    if (age) setProfileData(prev => ({ ...prev, age }));

    const location = localStorage.getItem("profileLocation");
    if (location) setProfileData(prev => ({ ...prev, location }));

    const aboutMe = localStorage.getItem("profileAboutMe");
    if (aboutMe) setProfileData(prev => ({ ...prev, aboutMe }));

    const interests = localStorage.getItem("profileInterests");
    if (interests) {
      try {
        setProfileData(prev => ({ ...prev, interests: JSON.parse(interests) }));
      } catch {}
    }

    const lookingFor = localStorage.getItem("profileLookingFor");
    if (lookingFor) setProfileData(prev => ({ ...prev, lookingFor }));

    const voice =
      localStorage.getItem("selectedVoice") ||
      localStorage.getItem("profileVoice");
    if (voice) setProfileData(prev => ({ ...prev, voice }));

    // Load new profile data
    const voiceIntroUrl = localStorage.getItem("profileVoiceIntroUrl");
    if (voiceIntroUrl) setProfileData(prev => ({ ...prev, voiceIntroUrl }));

    const moodVoiceUrl = localStorage.getItem("profileMoodVoiceUrl");
    if (moodVoiceUrl) setProfileData(prev => ({ ...prev, moodVoiceUrl }));

    const tags = localStorage.getItem("profileTags");
    if (tags) {
      try {
        setProfileData(prev => ({ ...prev, tags: JSON.parse(tags) }));
      } catch {}
    }

    const mood = localStorage.getItem("profileMood");
    if (mood) setProfileData(prev => ({ ...prev, mood }));

    const zodiac = localStorage.getItem("profileZodiac");
    if (zodiac) setProfileData(prev => ({ ...prev, zodiac }));

    const mbti = localStorage.getItem("profileMbti");
    if (mbti) setProfileData(prev => ({ ...prev, mbti }));

    const birthDate = localStorage.getItem("profileBirthDate");
    if (birthDate) setProfileData(prev => ({ ...prev, birthDate }));

    const genderIdentity = localStorage.getItem("profileGenderIdentity");
    if (genderIdentity) setProfileData(prev => ({ ...prev, genderIdentity }));

    const seekingGender = localStorage.getItem("profileSeekingGender");
    if (seekingGender) {
      try {
        setProfileData(prev => ({
          ...prev,
          seekingGender: JSON.parse(seekingGender),
        }));
      } catch {}
    }

    const languages = localStorage.getItem("profileLanguages");
    if (languages) {
      try {
        setProfileData(prev => ({ ...prev, languages: JSON.parse(languages) }));
      } catch {}
    }

    const city = localStorage.getItem("profileCity");
    if (city) setProfileData(prev => ({ ...prev, city }));
  }, []);

  function openEdit() {
    setEditData(profileData);
    setEditOpen(true);
  }

  function saveEdit() {
    setProfileData(editData);

    // Save to localStorage
    localStorage.setItem("profileName", editData.name);
    localStorage.setItem("profileBio", editData.bio);
    localStorage.setItem("profileAge", editData.age);
    localStorage.setItem("profileLocation", editData.location);
    localStorage.setItem("profileAboutMe", editData.aboutMe);
    localStorage.setItem(
      "profileInterests",
      JSON.stringify(editData.interests)
    );
    localStorage.setItem("profileLookingFor", editData.lookingFor);
    localStorage.setItem("profileVoice", editData.voice || "");
    localStorage.setItem("selectedVoice", editData.voice || "");

    // Save new profile data
    localStorage.setItem("profileVoiceIntroUrl", editData.voiceIntroUrl || "");
    localStorage.setItem("profileMoodVoiceUrl", editData.moodVoiceUrl || "");
    localStorage.setItem("profileTags", JSON.stringify(editData.tags));
    localStorage.setItem("profileMood", editData.mood);
    localStorage.setItem("profileZodiac", editData.zodiac);
    localStorage.setItem("profileMbti", editData.mbti);
    localStorage.setItem("profileBirthDate", editData.birthDate);
    localStorage.setItem("profileGenderIdentity", editData.genderIdentity);
    localStorage.setItem(
      "profileSeekingGender",
      JSON.stringify(editData.seekingGender)
    );
    localStorage.setItem(
      "profileLanguages",
      JSON.stringify(editData.languages)
    );
    localStorage.setItem("profileCity", editData.city);
    localStorage.setItem("userRole", JSON.stringify(editData.role));

    setEditOpen(false);
  }

  function confirmProfile() {
    // Save current profile data to localStorage as confirmed
    localStorage.setItem("profileConfirmed", "true");
    localStorage.setItem("confirmedProfileData", JSON.stringify(profileData));

    // Navigate to the main app
    router.push("/app");
  }

  function toggleInterest(interest: string) {
    setEditData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  }

  function toggleTag(tag: string) {
    setEditData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  }

  function toggleSeekingGender(gender: string) {
    setEditData(prev => ({
      ...prev,
      seekingGender: prev.seekingGender.includes(gender)
        ? prev.seekingGender.filter(g => g !== gender)
        : [...prev.seekingGender, gender],
    }));
  }

  function toggleLanguage(language: string) {
    setEditData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language],
    }));
  }

  async function startRecording(type: "voice" | "mood") {
    try {
      console.log(`🎤 Starting ${type} recording...`);

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log("✅ Microphone access granted");

      // Use unified MediaRecorder utility for consistent webm format
      const { createMediaRecorder, createAudioBlob } = await import("../utils/mediaRecorderUtils");
      const recorder = createMediaRecorder(stream);

      const chunks: Blob[] = [];

      recorder.ondataavailable = e => {
        console.log("📦 Data available:", e.data.size, "bytes");
        chunks.push(e.data);
      };

      recorder.onstart = () => {
        console.log("🎬 Recording started");
        if (type === "voice") {
          setIsRecordingVoice(true);
        } else {
          setIsRecordingMood(true);
        }
      };

      recorder.onstop = async () => {
        console.log("⏹️ Recording stopped");
        const blob = createAudioBlob(chunks);
        console.log("🎵 Audio blob created using unified utility");

        // Process with AI voice using backend API (like RPG page)
        const selectedVoice = localStorage.getItem("selectedVoice") || "elevenlabs-aria";
        if (selectedVoice && selectedVoice.startsWith("elevenlabs-")) {
          try {
            console.log("🎭 Processing with AI voice using backend API:", selectedVoice);
            
            // Step 1: Transcribe the audio to text using OpenAI Whisper via backend
            console.log("🎤 Step 1: Transcribing audio to text...");
            const formData = new FormData();
            formData.append('audio', blob, 'recording.mp4');
            
            const speechToTextResponse = await fetch('/api/speech-to-text', {
              method: 'POST',
              body: formData
            });
            
            if (!speechToTextResponse.ok) {
              throw new Error('Speech-to-text conversion failed');
            }
            
            const speechResult = await speechToTextResponse.json();
            const transcribedText = speechResult.text;
            console.log("✅ Transcribed text:", transcribedText.substring(0, 50) + '...');
            
            // Step 2: Generate AI voice using the transcribed text via backend
            console.log("🎵 Step 2: Generating AI voice...");
            const voiceId = getVoiceId(selectedVoice);
            const ttsResponse = await fetch('/api/elevenlabs-tts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                text: transcribedText, 
                voiceId: voiceId 
              })
            });
            
            if (ttsResponse.ok) {
              const audioBlob = await ttsResponse.blob();
              const processedUrl = URL.createObjectURL(audioBlob);
              console.log("✅ AI voice processing successful");
              
              if (type === "voice") {
                setEditData(prev => ({
                  ...prev,
                  voiceIntroUrl: processedUrl,
                }));
                setIsRecordingVoice(false);
              } else {
                setEditData(prev => ({
                  ...prev,
                  moodVoiceUrl: processedUrl,
                }));
                setIsRecordingMood(false);
              }
            } else {
              const errorData = await ttsResponse.json();
              throw new Error(errorData.error || 'Backend TTS API failed');
            }
          } catch (error) {
            console.error("❌ Error processing with AI voice:", error);
            // Fallback to original audio
            const url = URL.createObjectURL(blob);
            if (type === "voice") {
              setEditData(prev => ({ ...prev, voiceIntroUrl: url }));
              setIsRecordingVoice(false);
            } else {
              setEditData(prev => ({ ...prev, moodVoiceUrl: url }));
              setIsRecordingMood(false);
            }
          }
        } else {
          // No ElevenLabs voice selected, use original audio
          console.log("⚠️ No ElevenLabs voice selected, using original audio");
          const url = URL.createObjectURL(blob);
          if (type === "voice") {
            setEditData(prev => ({ ...prev, voiceIntroUrl: url }));
            setIsRecordingVoice(false);
          } else {
            setEditData(prev => ({ ...prev, moodVoiceUrl: url }));
            setIsRecordingMood(false);
          }
        }

        stream.getTracks().forEach(track => track.stop());
        console.log("🎤 Microphone released");
      };

      recorder.onerror = event => {
        console.error("❌ Recording error:", event);
        if (type === "voice") {
          setIsRecordingVoice(false);
        } else {
          setIsRecordingMood(false);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
    } catch (error) {
      console.error("❌ Error starting recording:", error);
      alert(
        "Failed to access microphone. Please check your browser permissions."
      );
    }
  }

  function stopRecording() {
    console.log("🛑 Stop recording requested");
    if (mediaRecorder && mediaRecorder.state === "recording") {
      console.log("⏹️ Stopping MediaRecorder...");
      mediaRecorder.stop();
    } else {
      console.log("⚠️ No active recording to stop");
    }
  }

  function handleVoiceIntroUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setEditData(prev => ({ ...prev, voiceIntroUrl: url }));
    }
  }

  return (
    <>
      <GlobalNav />
      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
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
          {/* Avatar */}
          <div
            style={{
              width: "100%",
              maxWidth: 320,
              margin: "0 auto 18px",
              borderRadius: 18,
              overflow: "hidden",
              background: "#181c2f",
            }}
          >
            {avatarUrl ? (
              <ModelViewer url={avatarUrl} />
            ) : (
              <div
                style={{
                  height: 320,
                  background: "#222",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#888",
                }}
              >
                No Avatar
              </div>
            )}
          </div>

          {/* Basic Info */}
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: "18px 0 8px" }}>
            {profileData.name}
          </h2>
          <div style={{ fontSize: 16, color: "#b0b8d0", marginBottom: 8 }}>
            {profileData.age && `${profileData.age} years old`}
          </div>

          {/* Bio */}
          <div style={{ fontSize: 16, color: "#b0b8d0", marginBottom: 18 }}>
            {profileData.bio}
          </div>

          {/* About Me */}
          {profileData.aboutMe && (
            <div
              style={{
                background: "rgba(44,52,80,0.7)",
                borderRadius: 10,
                padding: "14px 10px",
                marginBottom: 18,
                fontSize: 15,
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>About Me</div>
              <div>{profileData.aboutMe}</div>
            </div>
          )}

          {/* Interests */}
          {profileData.interests.length > 0 && (
            <div
              style={{
                background: "rgba(44,52,80,0.7)",
                borderRadius: 10,
                padding: "14px 10px",
                marginBottom: 18,
                fontSize: 15,
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Interests</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {profileData.interests.map(interest => (
                  <span
                    key={interest}
                    style={{
                      background: "rgba(79,195,247,0.2)",
                      color: "#4fc3f7",
                      padding: "4px 8px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Looking For */}
          {profileData.lookingFor && (
            <div
              style={{
                background: "rgba(44,52,80,0.7)",
                borderRadius: 10,
                padding: "14px 10px",
                marginBottom: 18,
                fontSize: 15,
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                Looking For
              </div>
              <div>{profileData.lookingFor}</div>
            </div>
          )}

          {/* Voice Info */}
          {profileData.voice && (
            <div
              style={{
                background: "rgba(44,52,80,0.7)",
                borderRadius: 10,
                padding: "14px 10px",
                marginBottom: 18,
                fontSize: 15,
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>🎤 Voice</div>
              <div style={{ color: "#4fc3f7", fontWeight: 500 }}>
                {VOICE_OPTIONS.find(v => v.id === profileData.voice)?.name ||
                  profileData.voice}
              </div>
            </div>
          )}

          {/* Selected Role */}
          <div
            style={{
              background: "rgba(44,52,80,0.7)",
              borderRadius: 10,
              padding: "14px 10px",
              marginBottom: 18,
              fontSize: 15,
              textAlign: "left",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 6 }}>🎭 Role</div>
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

          {/* Voice Intro */}
          {profileData.voiceIntroUrl && (
            <div
              style={{
                background: "rgba(44,52,80,0.7)",
                borderRadius: 10,
                padding: "14px 10px",
                marginBottom: 18,
                fontSize: 15,
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                🎙️ Voice Intro
              </div>
              <button
                onClick={async () => {
                  // Play AI voice intro using ElevenLabs TTS
                  const voiceIntroText = profileData.voiceIntroText || 
                    "Hello! This is my voice introduction. I'm excited to connect with you!";
                  const selectedVoice = localStorage.getItem("selectedVoice") || "elevenlabs-aria";
                  
                  try {
                    console.log(`🎵 Playing voice intro with voice: ${selectedVoice}`);
                    const voiceId = getVoiceId(selectedVoice);
                    const audioUrl = await speakWithElevenLabs(voiceIntroText, voiceId, false);
                    if (audioUrl) {
                      const audio = new Audio(audioUrl);
                      await audio.play();
                      console.log("✅ Voice intro played successfully");
                    }
                  } catch (error) {
                    console.error("❌ Error playing voice intro:", error);
                    // Fallback to original recorded voice if available
                    if (profileData.voiceIntroUrl) {
                      const audio = new Audio(profileData.voiceIntroUrl);
                      audio.play();
                    }
                  }
                }}
                style={{
                  background:
                    "linear-gradient(90deg, #4fc3f7 0%, #7b61ff 100%)",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  padding: "8px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                ▶️ Play Voice Intro
              </button>
            </div>
          )}

          {/* Tags */}
          {profileData.tags.length > 0 && (
            <div
              style={{
                background: "rgba(44,52,80,0.7)",
                borderRadius: 10,
                padding: "14px 10px",
                marginBottom: 18,
                fontSize: 15,
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>💡 Tags</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {profileData.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      background: "rgba(123,97,255,0.2)",
                      color: "#7b61ff",
                      padding: "4px 8px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Today's Mood */}
          <div
            style={{
              background: "rgba(44,52,80,0.7)",
              borderRadius: 10,
              padding: "14px 10px",
              marginBottom: 18,
              fontSize: 15,
              textAlign: "left",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              🎯 Today's Mood
            </div>
            <div style={{ color: "#4fc3f7", fontWeight: 500, marginBottom: 8 }}>
              {MOOD_OPTIONS.find(m => m.id === profileData.mood)?.name ||
                "👀 Just browsing"}
            </div>
            {profileData.moodVoiceUrl && (
              <div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>
                  🎙️ Mood Voice:
                </div>
                <button
                  onClick={async () => {
                    // Play AI mood voice using ElevenLabs TTS
                    const moodVoiceText = profileData.moodVoiceText || 
                      "This is how I'm feeling right now. Let's connect and share our vibes!";
                    const selectedVoice = localStorage.getItem("selectedVoice") || "elevenlabs-aria";
                    
                    try {
                      console.log(`🎵 Playing mood voice with voice: ${selectedVoice}`);
                      const voiceId = getVoiceId(selectedVoice);
                      const audioUrl = await speakWithElevenLabs(moodVoiceText, voiceId, false);
                      if (audioUrl) {
                        const audio = new Audio(audioUrl);
                        await audio.play();
                        console.log("✅ Mood voice played successfully");
                      }
                    } catch (error) {
                      console.error("❌ Error playing mood voice:", error);
                      // Fallback to original recorded voice if available
                      if (profileData.moodVoiceUrl) {
                        const audio = new Audio(profileData.moodVoiceUrl);
                        audio.play();
                      }
                    }
                  }}
                  style={{
                    background:
                      "linear-gradient(90deg, #4fc3f7 0%, #7b61ff 100%)",
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                    padding: "8px 16px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  ▶️ Play Mood Voice
                </button>
              </div>
            )}
          </div>

          {/* Personal Info */}
          {(profileData.zodiac ||
            profileData.mbti ||
            profileData.birthDate ||
            profileData.genderIdentity ||
            profileData.city ||
            profileData.languages.length > 0) && (
            <div
              style={{
                background: "rgba(44,52,80,0.7)",
                borderRadius: 10,
                padding: "14px 10px",
                marginBottom: 18,
                fontSize: 15,
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                ✨ Personal Info
              </div>
              {profileData.zodiac && <div>♈ {profileData.zodiac}</div>}
              {profileData.mbti && <div>🔮 {profileData.mbti}</div>}
              {profileData.birthDate && <div>🎂 {profileData.birthDate}</div>}
              {profileData.genderIdentity && (
                <div>🧬 {profileData.genderIdentity}</div>
              )}
              {profileData.city && <div>📍 {profileData.city}</div>}
              {profileData.languages.length > 0 && (
                <div>🌐 {profileData.languages.join(", ")}</div>
              )}
            </div>
          )}

          {/* Seeking */}
          {profileData.seekingGender.length > 0 && (
            <div
              style={{
                background: "rgba(44,52,80,0.7)",
                borderRadius: 10,
                padding: "14px 10px",
                marginBottom: 18,
                fontSize: 15,
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>💘 Seeking</div>
              <div style={{ color: "#ff6b9d" }}>
                {profileData.seekingGender.join(", ")}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            {isAiProfile ? (
              <button
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  background:
                    "linear-gradient(90deg, #7b61ff 0%, #4fc3f7 100%)",
                  border: "none",
                  borderRadius: 12,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px 0 rgba(123,97,255,0.15)",
                  transition: "background 0.2s",
                }}
                onClick={() => router.push("/app")}
              >
                ← Back to Chat
              </button>
            ) : (
              <>
                <button
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    background:
                      "linear-gradient(90deg, #7b61ff 0%, #4fc3f7 100%)",
                    border: "none",
                    borderRadius: 12,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px 0 rgba(123,97,255,0.15)",
                    transition: "background 0.2s",
                  }}
                  onClick={openEdit}
                >
                  Edit Profile
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    background:
                      "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                    border: "none",
                    borderRadius: 12,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px 0 rgba(76,175,80,0.15)",
                    transition: "background 0.2s",
                  }}
                  onClick={confirmProfile}
                >
                  Confirm & Enter
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ opacity: 0.25, fontSize: 13, marginTop: 12 }}>
          Powered by Ready Player Me
        </div>

        {/* Enhanced Edit Modal */}
        {editOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.45)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => setEditOpen(false)}
          >
            <div
              style={{
                background: "#232b4d",
                borderRadius: 18,
                padding: "32px 28px",
                maxWidth: 400,
                width: "95vw",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 8px 32px 0 rgba(31,38,135,0.37)",
                color: "#fff",
                textAlign: "center",
                position: "relative",
              }}
              onClick={e => e.stopPropagation()}
            >
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
                🎭 Edit Profile
              </h3>

              {/* Name */}
              <div style={{ marginBottom: 16, textAlign: "left" }}>
                <label
                  style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
                >
                  Name
                </label>
                <input
                  value={editData.name}
                  onChange={e =>
                    setEditData(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Your Name"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #4fc3f7",
                    fontSize: 16,
                    outline: "none",
                    background: "rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                />
              </div>

              {/* Age */}
              <div style={{ marginBottom: 16, textAlign: "left" }}>
                <label
                  style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
                >
                  Age
                </label>
                <input
                  value={editData.age}
                  onChange={e =>
                    setEditData(prev => ({ ...prev, age: e.target.value }))
                  }
                  placeholder="25"
                  type="number"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #4fc3f7",
                    fontSize: 16,
                    outline: "none",
                    background: "rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                />
              </div>

              {/* Bio */}
              <div style={{ marginBottom: 16, textAlign: "left" }}>
                <label
                  style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
                >
                  Bio
                </label>
                <textarea
                  value={editData.bio}
                  onChange={e =>
                    setEditData(prev => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Tell others about yourself!"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #7b61ff",
                    fontSize: 15,
                    minHeight: 60,
                    outline: "none",
                    resize: "vertical",
                    background: "rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                />
              </div>

              {/* About Me */}
              <div style={{ marginBottom: 16, textAlign: "left" }}>
                <label
                  style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
                >
                  About Me
                </label>
                <textarea
                  value={editData.aboutMe}
                  onChange={e =>
                    setEditData(prev => ({ ...prev, aboutMe: e.target.value }))
                  }
                  placeholder="Share more about yourself..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #7b61ff",
                    fontSize: 15,
                    minHeight: 80,
                    outline: "none",
                    resize: "vertical",
                    background: "rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                />
              </div>

              {/* Looking For */}
              <div style={{ marginBottom: 16, textAlign: "left" }}>
                <label
                  style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
                >
                  Looking For
                </label>
                <textarea
                  value={editData.lookingFor}
                  onChange={e =>
                    setEditData(prev => ({
                      ...prev,
                      lookingFor: e.target.value,
                    }))
                  }
                  placeholder="What are you looking for?"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #7b61ff",
                    fontSize: 15,
                    minHeight: 60,
                    outline: "none",
                    resize: "vertical",
                    background: "rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                />
              </div>

              {/* Interests */}
              <div style={{ marginBottom: 20, textAlign: "left" }}>
                <label
                  style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
                >
                  Interests
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {INTEREST_OPTIONS.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 16,
                        border: "1.5px solid",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        background: editData.interests.includes(interest)
                          ? "rgba(79,195,247,0.2)"
                          : "transparent",
                        borderColor: editData.interests.includes(interest)
                          ? "#4fc3f7"
                          : "#666",
                        color: editData.interests.includes(interest)
                          ? "#4fc3f7"
                          : "#ccc",
                      }}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Intro */}
              <div style={{ marginBottom: 20, textAlign: "left" }}>
                <label
                  style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
                >
                  🎙️ Voice Intro
                </label>

                {/* Recording Status */}
                {isRecordingVoice && (
                  <div
                    style={{
                      background: "rgba(255,107,107,0.1)",
                      border: "1px solid #ff6b6b",
                      borderRadius: 8,
                      padding: "8px 12px",
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: "#ff6b6b",
                        animation: "pulse 1s infinite",
                      }}
                    ></div>
                    <span style={{ color: "#ff6b6b", fontWeight: 500 }}>
                      Recording in progress...
                    </span>
                  </div>
                )}

                {!editData.voiceIntroUrl && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <button
                      onClick={() => startRecording("voice")}
                      disabled={isRecordingVoice}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 8,
                        border: "1.5px solid #7b61ff",
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: isRecordingVoice ? "not-allowed" : "pointer",
                        background: isRecordingVoice
                          ? "rgba(123,97,255,0.3)"
                          : "rgba(123,97,255,0.1)",
                        color: "#7b61ff",
                        opacity: isRecordingVoice ? 0.6 : 1,
                      }}
                    >
                      {isRecordingVoice ? "🔴 Recording..." : "🎤 Record"}
                    </button>
                    {isRecordingVoice && (
                      <button
                        onClick={stopRecording}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 8,
                          border: "1.5px solid #ff6b6b",
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: "pointer",
                          background: "rgba(255,107,107,0.1)",
                          color: "#ff6b6b",
                        }}
                      >
                        ⏹️ Stop
                      </button>
                    )}
                  </div>
                )}

                {editData.voiceIntroUrl && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button
                        onClick={() => {
                          if (editData.voiceIntroUrl) {
                            const audio = new Audio(editData.voiceIntroUrl);
                            audio.play();
                          }
                        }}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 8,
                          border: "1.5px solid #7b61ff",
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: "pointer",
                          background: "rgba(123,97,255,0.1)",
                          color: "#7b61ff",
                        }}
                      >
                        ▶️ Play
                      </button>
                      <button
                        onClick={() => startRecording("voice")}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 8,
                          border: "1.5px solid #7b61ff",
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: "pointer",
                          background: "rgba(123,97,255,0.1)",
                          color: "#7b61ff",
                        }}
                      >
                        🔄 Re-record
                      </button>
                      <button
                        onClick={() =>
                          setEditData(prev => ({
                            ...prev,
                            voiceIntroUrl: null,
                          }))
                        }
                        style={{
                          padding: "8px 16px",
                          borderRadius: 8,
                          border: "1.5px solid #ff6b6b",
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: "pointer",
                          background: "rgba(255,107,107,0.1)",
                          color: "#ff6b6b",
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div style={{ marginBottom: 20, textAlign: "left" }}>
                <label
                  style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
                >
                  💡 Tags
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {TAG_OPTIONS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 16,
                        border: "1.5px solid",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        background: editData.tags.includes(tag)
                          ? "rgba(123,97,255,0.2)"
                          : "transparent",
                        borderColor: editData.tags.includes(tag)
                          ? "#7b61ff"
                          : "#666",
                        color: editData.tags.includes(tag) ? "#7b61ff" : "#ccc",
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Today's Mood */}
              <div style={{ marginBottom: 20, textAlign: "left" }}>
                <label
                  style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
                >
                  🎯 Today's Mood
                </label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  {MOOD_OPTIONS.map(mood => (
                    <label
                      key={mood.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="mood"
                        value={mood.id}
                        checked={editData.mood === mood.id}
                        onChange={e =>
                          setEditData(prev => ({
                            ...prev,
                            mood: e.target.value,
                          }))
                        }
                        style={{ marginRight: 8 }}
                      />
                      <div>
                        <div style={{ fontWeight: 500 }}>{mood.name}</div>
                        <div style={{ fontSize: 12, color: "#888" }}>
                          {mood.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Mood Voice Recording */}
                <div style={{ marginTop: 12 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 6,
                      fontSize: 14,
                      color: "#4fc3f7",
                    }}
                  >
                    🎙️ Record Mood Voice
                  </label>

                  {/* Recording Status */}
                  {isRecordingMood && (
                    <div
                      style={{
                        background: "rgba(255,107,107,0.1)",
                        border: "1px solid #ff6b6b",
                        borderRadius: 8,
                        padding: "8px 12px",
                        marginBottom: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: "#ff6b6b",
                          animation: "pulse 1s infinite",
                        }}
                      ></div>
                      <span style={{ color: "#ff6b6b", fontWeight: 500 }}>
                        Recording in progress...
                      </span>
                    </div>
                  )}

                  {!editData.moodVoiceUrl && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <button
                        onClick={() => startRecording("mood")}
                        disabled={isRecordingMood}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 8,
                          border: "1.5px solid #4fc3f7",
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: isRecordingMood ? "not-allowed" : "pointer",
                          background: isRecordingMood
                            ? "rgba(79,195,247,0.3)"
                            : "rgba(79,195,247,0.1)",
                          color: "#4fc3f7",
                          opacity: isRecordingMood ? 0.6 : 1,
                        }}
                      >
                        {isRecordingMood ? "🔴 Recording..." : "🎤 Record"}
                      </button>
                      {isRecordingMood && (
                        <button
                          onClick={stopRecording}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "1.5px solid #ff6b6b",
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: "pointer",
                            background: "rgba(255,107,107,0.1)",
                            color: "#ff6b6b",
                          }}
                        >
                          ⏹️ Stop
                        </button>
                      )}
                    </div>
                  )}

                  {editData.moodVoiceUrl && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button
                          onClick={() => {
                            if (editData.moodVoiceUrl) {
                              const audio = new Audio(editData.moodVoiceUrl);
                              audio.play();
                            }
                          }}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "1.5px solid #4fc3f7",
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: "pointer",
                            background: "rgba(79,195,247,0.1)",
                            color: "#4fc3f7",
                          }}
                        >
                          ▶️ Play
                        </button>
                        <button
                          onClick={() => startRecording("mood")}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "1.5px solid #4fc3f7",
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: "pointer",
                            background: "rgba(79,195,247,0.1)",
                            color: "#4fc3f7",
                          }}
                        >
                          🔄 Re-record
                        </button>
                        <button
                          onClick={() =>
                            setEditData(prev => ({
                              ...prev,
                              moodVoiceUrl: null,
                            }))
                          }
                          style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "1.5px solid #ff6b6b",
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: "pointer",
                            background: "rgba(255,107,107,0.1)",
                            color: "#ff6b6b",
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Info Section */}
              <div style={{ marginBottom: 20, textAlign: "left" }}>
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: 12,
                    fontSize: 16,
                    color: "#4fc3f7",
                  }}
                >
                  ✨ Personal Info
                </div>

                {/* Zodiac */}
                <div style={{ marginBottom: 12 }}>
                  <label
                    style={{ display: "block", marginBottom: 4, fontSize: 14 }}
                  >
                    ♈ Zodiac Sign
                  </label>
                  <select
                    value={editData.zodiac}
                    onChange={e =>
                      setEditData(prev => ({ ...prev, zodiac: e.target.value }))
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: 6,
                      border: "1px solid #666",
                      fontSize: 14,
                      background: "rgba(255,255,255,0.1)",
                      color: "#fff",
                    }}
                  >
                    <option value="">Select Zodiac</option>
                    {ZODIAC_OPTIONS.map(zodiac => (
                      <option key={zodiac} value={zodiac}>
                        {zodiac}
                      </option>
                    ))}
                  </select>
                </div>

                {/* MBTI */}
                <div style={{ marginBottom: 12 }}>
                  <label
                    style={{ display: "block", marginBottom: 4, fontSize: 14 }}
                  >
                    🔮 MBTI Type
                  </label>
                  <select
                    value={editData.mbti}
                    onChange={e =>
                      setEditData(prev => ({ ...prev, mbti: e.target.value }))
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: 6,
                      border: "1px solid #666",
                      fontSize: 14,
                      background: "rgba(255,255,255,0.1)",
                      color: "#fff",
                    }}
                  >
                    <option value="">Select MBTI</option>
                    {MBTI_OPTIONS.map(mbti => (
                      <option key={mbti.type} value={mbti.type}>
                        {mbti.type} - {mbti.desc.split(" - ")[1]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Birth Date */}
                <div style={{ marginBottom: 12 }}>
                  <label
                    style={{ display: "block", marginBottom: 4, fontSize: 14 }}
                  >
                    🎂 Birth Date (MM-DD)
                  </label>
                  <input
                    type="text"
                    value={editData.birthDate}
                    onChange={e =>
                      setEditData(prev => ({
                        ...prev,
                        birthDate: e.target.value,
                      }))
                    }
                    placeholder="12-25"
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: 6,
                      border: "1px solid #666",
                      fontSize: 14,
                      background: "rgba(255,255,255,0.1)",
                      color: "#fff",
                    }}
                  />
                </div>

                {/* Gender Identity */}
                <div style={{ marginBottom: 12 }}>
                  <label
                    style={{ display: "block", marginBottom: 4, fontSize: 14 }}
                  >
                    🧬 Gender Identity
                  </label>
                  <select
                    value={editData.genderIdentity}
                    onChange={e =>
                      setEditData(prev => ({
                        ...prev,
                        genderIdentity: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: 6,
                      border: "1px solid #666",
                      fontSize: 14,
                      background: "rgba(255,255,255,0.1)",
                      color: "#fff",
                    }}
                  >
                    <option value="">Select Gender</option>
                    {GENDER_OPTIONS.map(gender => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seeking Gender */}
                <div style={{ marginBottom: 12 }}>
                  <label
                    style={{ display: "block", marginBottom: 4, fontSize: 14 }}
                  >
                    💘 Seeking Gender
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {GENDER_OPTIONS.map(gender => (
                      <button
                        key={gender}
                        onClick={() => toggleSeekingGender(gender)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 12,
                          border: "1px solid",
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: "pointer",
                          background: editData.seekingGender.includes(gender)
                            ? "rgba(255,107,157,0.2)"
                            : "transparent",
                          borderColor: editData.seekingGender.includes(gender)
                            ? "#ff6b9d"
                            : "#666",
                          color: editData.seekingGender.includes(gender)
                            ? "#ff6b9d"
                            : "#ccc",
                        }}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div style={{ marginBottom: 12 }}>
                  <label
                    style={{ display: "block", marginBottom: 4, fontSize: 14 }}
                  >
                    🌐 Languages
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {LANGUAGE_OPTIONS.map(language => (
                      <button
                        key={language}
                        onClick={() => toggleLanguage(language)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 12,
                          border: "1px solid",
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: "pointer",
                          background: editData.languages.includes(language)
                            ? "rgba(79,195,247,0.2)"
                            : "transparent",
                          borderColor: editData.languages.includes(language)
                            ? "#4fc3f7"
                            : "#666",
                          color: editData.languages.includes(language)
                            ? "#4fc3f7"
                            : "#ccc",
                        }}
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                </div>

                {/* City */}
                <div style={{ marginBottom: 12 }}>
                  <label
                    style={{ display: "block", marginBottom: 4, fontSize: 14 }}
                  >
                    📍 City
                  </label>
                  <input
                    type="text"
                    value={editData.city}
                    onChange={e =>
                      setEditData(prev => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="Los Angeles, CA"
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: 6,
                      border: "1px solid #666",
                      fontSize: 14,
                      background: "rgba(255,255,255,0.1)",
                      color: "#fff",
                    }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div
                style={{ display: "flex", justifyContent: "center", gap: 12 }}
              >
                <button
                  style={{
                    padding: "12px 28px",
                    background:
                      "linear-gradient(90deg, #4fc3f7 0%, #7b61ff 100%)",
                    border: "none",
                    borderRadius: 10,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                  onClick={saveEdit}
                >
                  Save
                </button>
                <button
                  style={{
                    padding: "12px 18px",
                    background: "#222a",
                    border: "none",
                    borderRadius: 10,
                    color: "#fff",
                    fontWeight: 500,
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
