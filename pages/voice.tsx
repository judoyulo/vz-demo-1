import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import GlobalNav from "../components/GlobalNav";
import { 
  getPageContainerStyle, 
  getMainContainerStyle, 
  getButtonStyle,
  getTitleStyle,
  getCardStyle,
  LAYOUT_CONFIG 
} from "../utils/layoutConfig";
import { voiceProcessingService, VoiceEffect } from "../lib/voiceProcessing";

type VoiceOption = {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: string;
};

// Use professional voice effects from the service
const VOICE_OPTIONS: VoiceOption[] = voiceProcessingService
  .getAvailableEffects()
  .map(effect => ({
    id: effect.id,
    name: effect.name,
    description: effect.description,
    preview: "Click Record to test this voice effect!",
    category: effect.category,
  }));

export default function VoicePage() {
  const router = useRouter();
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<string | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<{ [key: string]: Blob }>(
    {}
  );
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  useEffect(() => {
    // Load previously selected voice
    const savedVoice = localStorage.getItem("selectedVoice");
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }
  }, []);

  const startRecording = async (voiceId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      // Use unified MediaRecorder utility for consistent webm format
      const { createMediaRecorder, createAudioBlob } = await import("../utils/mediaRecorderUtils");
      const recorder = createMediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = createAudioBlob(chunks);
        console.log("Recording completed using unified utility");
        setRecordedAudio(prev => ({ ...prev, [voiceId]: blob }));
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(voiceId);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Please allow microphone access to record your voice.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(null);
      setMediaRecorder(null);
    }
  };

  const playFallbackAudio = (voiceId: string) => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different voices
      const frequencies: { [key: string]: number } = {
        // Premium Girl Voices
        "sweet-angel": 280, // High frequency, angelic voice
        "elegant-queen": 220, // Medium-high frequency, royal voice
        "mysterious-siren": 180, // Medium frequency, enchanting voice
        "energetic-sunshine": 300, // High frequency, bright voice

        // Premium Boy Voices
        "noble-knight": 140, // Low frequency, commanding voice
        "wise-sage": 120, // Very low frequency, wise voice
        "adventurous-explorer": 160, // Medium frequency, confident voice
        "gentle-artist": 200, // Medium frequency, artistic voice

        // Special Effects
        "crystal-clear": 250, // High frequency, clear voice
        "warm-embrace": 180, // Medium frequency, warm voice
        "powerful-command": 150, // Low frequency, authoritative voice
      };

      oscillator.frequency.setValueAtTime(
        frequencies[voiceId] || 160,
        audioContext.currentTime
      );
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 2
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 2);

      setTimeout(() => {
        setIsPlaying(null);
      }, 2000);
    } catch (error) {
      console.error("Error playing fallback audio:", error);
      setIsPlaying(null);
      alert("Audio playback failed. Please try again.");
    }
  };

  const playVoicePreview = async (voiceId: string) => {
    if (!recordedAudio[voiceId]) {
      alert("Please record your voice first!");
      return;
    }

    try {
      setIsPlaying(voiceId);
      console.log("Starting to play voice preview for:", voiceId);

      // Get the voice effect configuration
      const availableEffects = voiceProcessingService.getAvailableEffects();
      const effect = availableEffects.find(e => e.id === voiceId);

      if (!effect) {
        throw new Error(`Voice effect not found: ${voiceId}`);
      }

      // Process voice using professional service
      const result = await voiceProcessingService.processVoice(
        recordedAudio[voiceId],
        effect
      );

      if (!result.success) {
        console.error("❌ Voice processing failed:", result.error);
        throw new Error(result.error || "Voice processing failed");
      }

      // Play the processed audio
      console.log("Creating audio element with URL:", result.audioUrl);
      const audio = new Audio(result.audioUrl);

      // Add more detailed event listeners
      audio.onloadstart = () => console.log("Audio loading started");
      audio.oncanplay = () => console.log("Audio can play");
      audio.oncanplaythrough = () => console.log("Audio can play through");
      audio.onplay = () => console.log("Audio started playing");
      audio.onended = () => {
        console.log("Audio playback ended");
        setIsPlaying(null);
        if (result.audioUrl) URL.revokeObjectURL(result.audioUrl); // Clean up
      };
      audio.onerror = e => {
        console.error("Audio playback error:", e);
        console.error("Audio error details:", audio.error);
        setIsPlaying(null);
        if (result.audioUrl) URL.revokeObjectURL(result.audioUrl); // Clean up
      };

      // Set audio properties
      audio.volume = 1.0;
      audio.preload = "auto";

      // Wait for audio to be ready
      await new Promise((resolve, reject) => {
        audio.oncanplay = () => {
          console.log("Audio ready to play");
          resolve(true);
        };
        audio.onerror = () => {
          console.error("Audio failed to load");
          reject(new Error("Audio failed to load"));
        };
        audio.load(); // Explicitly load the audio
      });

      console.log("Attempting to play audio...");
      await audio.play();
      console.log(`Voice processed successfully in ${result.processingTime}ms`);
      console.log("Audio play() completed");
    } catch (error) {
      console.error("Error in playVoicePreview:", error);
      setIsPlaying(null);

      // Fallback to local processing
      console.log("Falling back to local processing");
      await playLocalVoicePreview(voiceId);
    }
  };

  const getPitchSettings = (voiceId: string) => {
    const pitchConfigs = {
      "sweet-angel": {
        playbackRate: 1.4,
        description: "Higher pitch for female",
      },
      "elegant-queen": {
        playbackRate: 1.2,
        description: "Medium-high for mature female",
      },
      "noble-knight": {
        playbackRate: 0.7,
        description: "Lower pitch for male",
      },
      "wise-sage": { playbackRate: 0.6, description: "Very low for elder" },
      "crystal-clear": { playbackRate: 1.0, description: "Normal pitch" },
    };
    return (
      pitchConfigs[voiceId as keyof typeof pitchConfigs] || {
        playbackRate: 1.0,
        description: "Default pitch",
      }
    );
  };

  const playOriginalAudio = async (voiceId: string) => {
    if (!recordedAudio[voiceId]) {
      alert("Please record your voice first!");
      return;
    }

    try {
      console.log("Playing original audio for:", voiceId);
      const audioUrl = URL.createObjectURL(recordedAudio[voiceId]);
      const audio = new Audio(audioUrl);

      audio.onloadstart = () => console.log("Original audio loading started");
      audio.oncanplay = () => console.log("Original audio can play");
      audio.onplay = () => console.log("Original audio started playing");
      audio.onended = () => {
        console.log("Original audio playback ended");
        URL.revokeObjectURL(audioUrl); // Clean up
      };
      audio.onerror = e => {
        console.error("Original audio playback error:", e);
        URL.revokeObjectURL(audioUrl); // Clean up
      };

      audio.volume = 1.0;
      await audio.play();
      console.log("Original audio play() completed");
    } catch (error) {
      console.error("Error playing original audio:", error);
    }
  };

  const playLocalVoicePreview = async (voiceId: string) => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Resume audio context if suspended
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      // Convert blob to array buffer
      const arrayBuffer = await recordedAudio[voiceId].arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      console.log(
        "Audio decoded successfully, duration:",
        audioBuffer.duration
      );

      // Create audio source
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;

      // Create advanced audio processing chain
      const gainNode = audioContext.createGain();
      const filterNode = audioContext.createBiquadFilter();
      const compressorNode = audioContext.createDynamicsCompressor();

      // Advanced voice mask effects with multiple audio processing nodes
      const voiceSettings: {
        [key: string]: {
          pitch: number;
          formant: number;
          resonance: number;
          clarity: number;
        };
      } = {
        // Premium Girl Voices
        "sweet-angel": {
          pitch: 1.15,
          formant: 1.2,
          resonance: 0.9,
          clarity: 1.3,
        },
        "elegant-queen": {
          pitch: 0.95,
          formant: 1.1,
          resonance: 1.2,
          clarity: 1.1,
        },
        "mysterious-siren": {
          pitch: 0.85,
          formant: 0.9,
          resonance: 1.4,
          clarity: 0.9,
        },
        "energetic-sunshine": {
          pitch: 1.25,
          formant: 1.3,
          resonance: 0.8,
          clarity: 1.2,
        },

        // Premium Boy Voices
        "noble-knight": {
          pitch: 0.75,
          formant: 0.8,
          resonance: 1.3,
          clarity: 1.1,
        },
        "wise-sage": {
          pitch: 0.65,
          formant: 0.7,
          resonance: 1.5,
          clarity: 1.0,
        },
        "adventurous-explorer": {
          pitch: 0.9,
          formant: 1.0,
          resonance: 1.1,
          clarity: 1.2,
        },
        "gentle-artist": {
          pitch: 1.0,
          formant: 1.1,
          resonance: 0.9,
          clarity: 1.1,
        },

        // Special Effects
        "crystal-clear": {
          pitch: 1.0,
          formant: 1.0,
          resonance: 0.7,
          clarity: 1.5,
        },
        "warm-embrace": {
          pitch: 0.95,
          formant: 1.2,
          resonance: 1.3,
          clarity: 0.9,
        },
        "powerful-command": {
          pitch: 0.8,
          formant: 0.9,
          resonance: 1.4,
          clarity: 1.3,
        },
      };

      const settings = voiceSettings[voiceId] || {
        pitch: 1.0,
        formant: 1.0,
        resonance: 1.0,
        clarity: 1.0,
      };

      // Apply pitch shift
      source.playbackRate.value = settings.pitch;

      // Dramatic volume settings for strong effects
      const volumeSettings: { [key: string]: number } = {
        // Premium Girl Voices
        "sweet-angel": 1.3, // Louder for dramatic effect
        "elegant-queen": 1.2, // Louder for dramatic effect
        "mysterious-siren": 1.1, // Louder for dramatic effect
        "energetic-sunshine": 1.4, // Much louder for dramatic effect

        // Premium Boy Voices
        "noble-knight": 1.3, // Louder for dramatic effect
        "wise-sage": 1.1, // Louder for dramatic effect
        "adventurous-explorer": 1.2, // Louder for dramatic effect
        "gentle-artist": 1.1, // Louder for dramatic effect

        // Special Effects
        "crystal-clear": 1.2, // Louder for dramatic effect
        "warm-embrace": 1.1, // Louder for dramatic effect
        "powerful-command": 1.4, // Much louder for dramatic effect
      };

      gainNode.gain.value = volumeSettings[voiceId] || 1.0;

      // Apply dramatic pitch shifting for real voice transformation
      const pitchSettings = getPitchSettings(voiceId);
      source.playbackRate.value = pitchSettings.playbackRate;
      console.log(
        `Applied pitch shift: ${pitchSettings.playbackRate}x playback rate for ${voiceId}`
      );

      // Apply very strong audio effects for dramatic results
      filterNode.type = "peaking";
      filterNode.frequency.value = 1000 * settings.formant;
      filterNode.Q.value = 2.5; // Very strong Q for dramatic effect
      filterNode.gain.value = 8.0 * settings.formant; // Very strong gain

      // Add very strong resonance filter
      const resonanceFilter = audioContext.createBiquadFilter();
      resonanceFilter.type = "lowpass";
      resonanceFilter.frequency.value = 6000 * settings.resonance;
      resonanceFilter.Q.value = 1.5; // Very strong Q for more resonance

      // Add very strong clarity enhancement
      const clarityFilter = audioContext.createBiquadFilter();
      clarityFilter.type = "highshelf";
      clarityFilter.frequency.value = 2000;
      clarityFilter.gain.value = 12.0 * settings.clarity; // Very strong gain

      // Very strong compression settings
      compressorNode.threshold.value = -30;
      compressorNode.knee.value = 10;
      compressorNode.ratio.value = 10;
      compressorNode.attack.value = 0.001;
      compressorNode.release.value = 0.1;

      // Connect clean audio processing chain - no spatial effects
      source.connect(filterNode);
      filterNode.connect(resonanceFilter);
      resonanceFilter.connect(clarityFilter);
      clarityFilter.connect(compressorNode);
      compressorNode.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Handle playback end
      source.onended = () => {
        console.log("Audio playback ended");
        setIsPlaying(null);
      };

      // Start playback
      source.start(0);
      console.log("Audio playback started successfully");
    } catch (error) {
      console.error("Error in local voice preview:", error);
      setIsPlaying(null);

      // Fallback to simulated audio
      console.log("Falling back to simulated audio");
      playFallbackAudio(voiceId);
    }
  };

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
    localStorage.setItem("selectedVoice", voiceId);
  };

  const handleFinalize = () => {
    if (selectedVoice) {
      router.push("/profile");
    }
  };

  const categories = [...new Set(VOICE_OPTIONS.map(voice => voice.category))];

  return (
    <div style={getPageContainerStyle()}>
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
      <GlobalNav />
      <div
        style={{
          ...getMainContainerStyle(),
          textAlign: "center",
          padding: `${LAYOUT_CONFIG.spacing.container} ${LAYOUT_CONFIG.spacing.container} ${LAYOUT_CONFIG.spacing.section} ${LAYOUT_CONFIG.spacing.container}`,
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          🎤 Enhanced Voice AI
        </h1>
        <p style={{ fontSize: 16, color: "#b0b8d0", marginBottom: 16 }}>
          Powered by ElevenLabs Enhanced TTS - Smart speed analysis & natural
          voice transformation
        </p>
        <div
          style={{
            background: "rgba(79,195,247,0.1)",
            border: "1px solid rgba(79,195,247,0.3)",
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: 16,
            fontSize: 12,
            color: "#4fc3f7",
          }}
        >
          🎵 Smart Speed Analysis • 🎭 Natural Variation • 🎤 Voice Matching •
          📊 Audio Intelligence
        </div>

        {/* API Status Warning */}
        {!process.env.NEXT_PUBLIC_VOICEMOD_API_KEY &&
          !process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY &&
          !process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY && (
            <div
              style={{
                background: "rgba(255,152,0,0.1)",
                border: "1px solid rgba(255,152,0,0.3)",
                borderRadius: 8,
                padding: "12px 16px",
                marginBottom: 16,
                fontSize: 14,
                color: "#ff9800",
              }}
            >
              ⚠️ <strong>API Keys Missing!</strong> Only local processing
              available.
              <br />
              <span style={{ fontSize: 12, opacity: 0.8 }}>
                For professional voice transformation, add API keys to
                .env.local file. See VOICE_API_SETUP.md for instructions.
              </span>
            </div>
          )}

        {/* Local Effects Recommendation */}
        <div
          style={{
            background: "rgba(76,175,80,0.1)",
            border: "1px solid rgba(76,175,80,0.3)",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            fontSize: 14,
            color: "#4caf50",
          }}
        >
          💡 <strong>Try Local Effects!</strong>
          <br />
          <span style={{ fontSize: 12, opacity: 0.9 }}>
            Scroll down to "Local Effects" section for immediate voice
            transformation without API keys. These effects work instantly using
            your browser's audio processing.
          </span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => {
              // Test audio playback with a simple beep
              const audioContext = new (window.AudioContext ||
                (window as any).webkitAudioContext)();
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();

              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);

              oscillator.frequency.setValueAtTime(
                440,
                audioContext.currentTime
              );
              oscillator.type = "sine";

              gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                audioContext.currentTime + 1
              );

              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + 1);
            }}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 8,
              padding: "8px 16px",
              color: "#fff",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            🔊 Test Audio
          </button>
        </div>
        {isRecording && (
          <div
            style={{
              background: "rgba(255,100,100,0.2)",
              border: "1px solid rgba(255,100,100,0.5)",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                background: "#ff6b6b",
                borderRadius: "50%",
                animation: "pulse 1s infinite",
              }}
            ></div>
            <span style={{ color: "#ff6b6b", fontWeight: 600 }}>
              Recording... Speak now!
            </span>
          </div>
        )}

        {/* Voice Categories */}
        {categories.map(category => (
          <div key={category} style={{ marginBottom: 32 }}>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 16,
                color: "#4fc3f7",
              }}
            >
              {category}
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {VOICE_OPTIONS.filter(voice => voice.category === category).map(
                voice => (
                  <div
                    key={voice.id}
                    style={{
                      background:
                        selectedVoice === voice.id
                          ? "rgba(79,195,247,0.15)"
                          : "rgba(44,52,80,0.7)",
                      borderRadius: 16,
                      padding: "20px",
                      border:
                        selectedVoice === voice.id
                          ? "2px solid #4fc3f7"
                          : "1.5px solid rgba(255,255,255,0.1)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      position: "relative",
                    }}
                    onClick={() => handleVoiceSelect(voice.id)}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12,
                      }}
                    >
                      <h4 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
                        {voice.name}
                      </h4>
                      <div style={{ display: "flex", gap: 8 }}>
                        {!recordedAudio[voice.id] ? (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              if (isRecording) {
                                stopRecording();
                              } else {
                                startRecording(voice.id);
                              }
                            }}
                            disabled={
                              !!(isRecording && isRecording !== voice.id)
                            }
                            style={{
                              background:
                                isRecording === voice.id
                                  ? "rgba(255,100,100,0.8)"
                                  : "linear-gradient(90deg, #ff6b6b 0%, #ee5a24 100%)",
                              border: "none",
                              borderRadius: 8,
                              padding: "6px 12px",
                              color: "#fff",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor:
                                isRecording && isRecording !== voice.id
                                  ? "not-allowed"
                                  : "pointer",
                              opacity:
                                isRecording && isRecording !== voice.id
                                  ? 0.5
                                  : 1,
                            }}
                          >
                            {isRecording === voice.id ? "⏹️ Stop" : "🎤 Record"}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                if (isRecording) {
                                  stopRecording();
                                } else {
                                  startRecording(voice.id);
                                }
                              }}
                              disabled={
                                !!(isRecording && isRecording !== voice.id)
                              }
                              style={{
                                background:
                                  isRecording === voice.id
                                    ? "rgba(255,100,100,0.8)"
                                    : "linear-gradient(90deg, #ff6b6b 0%, #ee5a24 100%)",
                                border: "none",
                                borderRadius: 8,
                                padding: "6px 12px",
                                color: "#fff",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor:
                                  isRecording && isRecording !== voice.id
                                    ? "not-allowed"
                                    : "pointer",
                                opacity:
                                  isRecording && isRecording !== voice.id
                                    ? 0.5
                                    : 1,
                              }}
                            >
                              {isRecording === voice.id
                                ? "⏹️ Stop"
                                : "🔄 Re-record"}
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                playVoicePreview(voice.id);
                              }}
                              disabled={isPlaying === voice.id}
                              style={{
                                background:
                                  isPlaying === voice.id
                                    ? "rgba(79,195,247,0.3)"
                                    : "linear-gradient(90deg, #4fc3f7 0%, #7b61ff 100%)",
                                border: "none",
                                borderRadius: 8,
                                padding: "6px 12px",
                                color: "#fff",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor:
                                  isPlaying === voice.id
                                    ? "not-allowed"
                                    : "pointer",
                                opacity: isPlaying === voice.id ? 0.7 : 1,
                                marginRight: 6,
                              }}
                            >
                              {isPlaying === voice.id
                                ? "🔊 Playing..."
                                : "▶️ Play AI Mask"}
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                playOriginalAudio(voice.id);
                              }}
                              style={{
                                background:
                                  "linear-gradient(90deg, #95a5a6 0%, #7f8c8d 100%)",
                                border: "none",
                                borderRadius: 8,
                                padding: "6px 12px",
                                color: "#fff",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              🎵 Original
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        color: "#b0b8d0",
                        marginBottom: 12,
                        lineHeight: 1.4,
                      }}
                    >
                      {voice.description}
                    </p>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#888",
                        fontStyle: "italic",
                        background: "rgba(0,0,0,0.2)",
                        padding: "8px 12px",
                        borderRadius: 8,
                        borderLeft: "3px solid #4fc3f7",
                      }}
                    >
                      "{voice.preview}"
                    </div>
                    {selectedVoice === voice.id && (
                      <div
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          width: 20,
                          height: 20,
                          background: "#4fc3f7",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ fontSize: 12, color: "#222" }}>✓</span>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        ))}

        {/* Finalize Button */}
        {selectedVoice && (
          <div
            style={{
              marginTop: 32,
              paddingTop: 24,
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 16, color: "#4fc3f7", fontWeight: 600 }}>
                Selected:{" "}
                {VOICE_OPTIONS.find(v => v.id === selectedVoice)?.name}
              </span>
            </div>
            <button
              onClick={handleFinalize}
              style={{
                padding: "14px 36px",
                background: "linear-gradient(90deg, #4fc3f7 0%, #7b61ff 100%)",
                border: "none",
                borderRadius: 12,
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
                boxShadow: "0 4px 16px 0 rgba(79,195,247,0.25)",
                transition: "all 0.2s ease",
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px 0 rgba(79,195,247,0.35)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 16px 0 rgba(79,195,247,0.25)";
              }}
            >
              Next: Finalize Your Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
