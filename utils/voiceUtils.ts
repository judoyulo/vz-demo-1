import { AIVoiceSettings } from "../types";

// Voice mapping from user voice names to ElevenLabs voice IDs
export const VOICE_MAPPING: Record<string, string> = {
  "elevenlabs-aria": "9BWtsMINqrJLrRacOk9x",      // Aria - Female, warm
  "elevenlabs-domi": "AZnzlk1XvdvUeBnXmlld",     // Domi - Female, energetic
  "elevenlabs-bella": "EXAVITQu4vr4xnSDxMaL",    // Bella - Female, soft
  "elevenlabs-echo": "21m00Tcm4TlvDq8ikWAM",     // Echo - Male, deep
  "elevenlabs-onyx": "pNInz6obpgDQGcFmaJgB",     // Onyx - Male, serious
  "elevenlabs-nova": "piTKgcLEGmPE4e6mEKli",     // Nova - Female, clear
  "elevenlabs-shimmer": "VR6AewLTigWG4xSOukaG",  // Shimmer - Female, bright
  "elevenlabs-cyber": "2EiwWnXFnvU5JabPnv8n",    // Cyber - Male, robotic
  "elevenlabs-cosmo": "oWAxZDx7w5VEj9dCyTzz",    // Cosmo - Male, friendly
  "elevenlabs-scarlet": "wViIeQp4X7XZg8fAllTk",  // Scarlet - Female, passionate
  
  // Additional voices from voiceProcessingService
  "elevenlabs-rachel": "21m00Tcm4TlvDq8ikWAM",   // Rachel - Professional female
  "elevenlabs-sarah": "VR6AewLTigWG4xSOukaG",    // Sarah - Friendly female
  "elevenlabs-emily": "AZnzlk1XvdvUeBnXmlld",    // Emily - Young energetic female
  "elevenlabs-arnold": "VR6AewLTigWG4xSOukaG",   // Arnold - Deep male
  "elevenlabs-josh": "TxGEqnHWrfWFTfGW9XjX",     // Josh - Warm friendly male
  "elevenlabs-sam": "yoZ06aMxZJJ28mfd3POQ",      // Sam - Young energetic male
  "elevenlabs-dorothy": "ThT5KcBeYPX3keUQqHPh",  // Dorothy - Wise elder
  "elevenlabs-charlie": "VR6AewLTigWG4xSOukaG",  // Charlie - Mature male
  "elevenlabs-lily": "EXAVITQu4vr4xnSDxMaL",     // Lily - Young cheerful female
  "elevenlabs-tommy": "yoZ06aMxZJJ28mfd3POQ",    // Tommy - Young enthusiastic male
};

// Get ElevenLabs voice ID from user voice name
export const getVoiceId = (userVoice: string): string => {
  return VOICE_MAPPING[userVoice] || "9BWtsMINqrJLrRacOk9x"; // Default to Aria if not found
};

export const playUserVoice = async (
  text: string,
  userVoice: string,
  autoplay: boolean = false
): Promise<string | null> => {
  const voiceId = getVoiceId(userVoice);
  console.log(`🎤 Generating voice for ${userVoice} using voice ID: ${voiceId}`);
  try {
    const audioUrl = await speakWithElevenLabs(text, voiceId, autoplay);
    return audioUrl;
  } catch (error) {
    console.error("Error in playUserVoice, returning null:", error);
    return null;
  }
};

export const speakWithElevenLabs = async (
  text: string,
  voiceId: string,
  autoplay: boolean = false
): Promise<string> => {
  try {
    const response = await fetch("/api/elevenlabs-tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voiceId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate speech: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    if (autoplay) {
      const audio = new Audio(audioUrl);
      await audio.play();
      return new Promise((resolve) => {
        audio.onended = () => {
          resolve(audioUrl);
        };
      });
    } else {
      return audioUrl;
    }
  } catch (error) {
    console.error("Error in speakWithElevenLabs:", error);
    throw error; // Re-throw the error to be caught by the caller
  }
};

export const speakText = (
  text: string,
  voiceSettings: AIVoiceSettings
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);

      // Set voice properties
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;

      // Try to find a matching voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice =>
        voice.name.toLowerCase().includes(voiceSettings.voice.toLowerCase())
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = error => reject(error);

      speechSynthesis.speak(utterance);
    } else {
      reject(new Error("Speech synthesis not supported"));
    }
  });
};