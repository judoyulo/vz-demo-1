import { AIVoiceSettings } from "../types";

// Voice mapping from user voice names to ElevenLabs voice IDs
// ⚠️ CRITICAL: Keep this synchronized with lib/voiceProcessing.ts
export const VOICE_MAPPING: Record<string, string> = {
  // Core user voices (used in mockUsers.ts)
  "elevenlabs-aria": "9BWtsMINqrJLrRacOk9x",      // Aria - Female, warm
  "elevenlabs-domi": "TxGEqnHWrfWFTfGW9XjX",     // Domi - Male, professional (corrected)
  "elevenlabs-bella": "EXAVITQu4vr4xnSDxMaL",    // Bella - Female, soft
  "elevenlabs-echo": "pNInz6obpgDQGcFmaJgB",     // Echo - Male, deep (corrected)
  
  // Professional female voices (synchronized with lib/voiceProcessing.ts)
  "elevenlabs-rachel": "21m00Tcm4TlvDq8ikWAM",   // Rachel - Professional female
  "elevenlabs-sarah": "kdmDKE6EkgrWrrykO9Qt",    // Sarah - Professional female (corrected to Alexandra's realistic young female voice)
  "elevenlabs-emily": "AZnzlk1XvdvUeBnXmlld",    // Emily - Professional female
  
  // Professional male voices (synchronized with lib/voiceProcessing.ts)
  "elevenlabs-arnold": "pNInz6obpgDQGcFmaJgB",   // Arnold - Professional male (corrected)
  "elevenlabs-josh": "TxGEqnHWrfWFTfGW9XjX",     // Josh - Professional male
  "elevenlabs-sam": "yoZ06aMxZJJ28mfd3POQ",      // Sam - Professional male
  
  // Character voices (synchronized with lib/voiceProcessing.ts)
  "elevenlabs-dorothy": "ThT5KcBeYPX3keUQqHPh",  // Dorothy - Character voice
  "elevenlabs-charlie": "2EiwWnXFnvU5JabPnv8n",  // Charlie - Character voice (corrected)
  "elevenlabs-lily": "EXAVITQu4vr4xnSDxMaL",     // Lily - Character voice
  "elevenlabs-tommy": "yoZ06aMxZJJ28mfd3POQ",    // Tommy - Character voice
  
  // Extended voices (legacy mapping)
  "elevenlabs-onyx": "pNInz6obpgDQGcFmaJgB",     // Onyx - Male, serious
  "elevenlabs-nova": "piTKgcLEGmPE4e6mEKli",     // Nova - Female, clear
  "elevenlabs-shimmer": "VR6AewLTigWG4xSOukaG",  // Shimmer - Female, bright
  "elevenlabs-cyber": "2EiwWnXFnvU5JabPnv8n",    // Cyber - Male, robotic
  "elevenlabs-cosmo": "oWAxZDx7w5VEj9dCyTzz",    // Cosmo - Male, friendly
  "elevenlabs-scarlet": "wViIeQp4X7XZg8fAllTk",  // Scarlet - Female, passionate
};

// Get ElevenLabs voice ID from user voice name
export const getVoiceId = (userVoice: string): string => {
  const voiceId = VOICE_MAPPING[userVoice];
  if (!voiceId) {
    console.warn(`⚠️ Voice mapping not found for: ${userVoice}, using default Aria`);
    return "9BWtsMINqrJLrRacOk9x"; // Default to Aria
  }
  console.log(`🎤 Voice mapping: ${userVoice} → ${voiceId}`);
  return voiceId;
};

// Safari-compatible AudioContext playback for ultimate compatibility
export const playAudioWithContext = async (audioBlob: Blob | string): Promise<void> => {
  let audioContext: AudioContext | null = null;
  
  try {
    console.log("🍎 [AudioContext] === SAFARI ULTIMATE DEBUG START ===");
    console.log("🍎 [AudioContext] User agent:", navigator.userAgent);
    console.log("🍎 [AudioContext] Input type:", audioBlob instanceof Blob ? 'Blob' : 'URL');
    
    let arrayBuffer: ArrayBuffer;
    
    if (audioBlob instanceof Blob) {
      console.log("🍎 [AudioContext] Converting Blob to ArrayBuffer...");
      arrayBuffer = await audioBlob.arrayBuffer();
    } else {
      console.log("🍎 [AudioContext] Fetching audio from URL:", audioBlob.substring(0, 50) + "...");
      const response = await fetch(audioBlob);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.statusText}`);
      }
      arrayBuffer = await response.arrayBuffer();
    }
    
    console.log("🍎 [AudioContext] Audio data loaded, size:", arrayBuffer.byteLength, "bytes");
    
    // Create AudioContext (Safari-safe way) - CRITICAL FOR SAFARI
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error("AudioContext not supported in this browser");
    }
    
    audioContext = new AudioContextClass();
    console.log("🍎 [AudioContext] AudioContext created:");
    console.log("🍎 [AudioContext]   - State:", audioContext.state);
    console.log("🍎 [AudioContext]   - Sample rate:", audioContext.sampleRate);
    console.log("🍎 [AudioContext]   - Destination:", audioContext.destination);
    
    // CRITICAL: Resume context if suspended (Safari always starts suspended)
    if (audioContext.state === 'suspended') {
      console.log("🍎 [AudioContext] ⚠️ Context is SUSPENDED, resuming...");
      await audioContext.resume();
      console.log("🍎 [AudioContext] ✅ Context resumed, new state:", audioContext.state);
    } else {
      console.log("🍎 [AudioContext] ✅ Context already running");
    }
    
    // Force resume one more time for Safari (belt and suspenders)
    if (audioContext.state !== 'running') {
      console.log("🍎 [AudioContext] 🔄 Forcing second resume attempt...");
      await audioContext.resume();
      console.log("🍎 [AudioContext] State after force resume:", audioContext.state);
    }
    
    // Decode audio data
    console.log("🍎 [AudioContext] Decoding audio data...");
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    console.log("🍎 [AudioContext] ✅ Audio decoded successfully:");
    console.log("🍎 [AudioContext]   - Duration:", audioBuffer.duration, "seconds");
    console.log("🍎 [AudioContext]   - Channels:", audioBuffer.numberOfChannels);
    console.log("🍎 [AudioContext]   - Sample rate:", audioBuffer.sampleRate);
    console.log("🍎 [AudioContext]   - Length:", audioBuffer.length, "samples");
    
    // Create source node
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    console.log("🍎 [AudioContext] ✅ Buffer source created with audio data");
    
    // Create gain node for MAXIMUM volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(1.0, audioContext.currentTime); // Use setValueAtTime for Safari
    console.log("🍎 [AudioContext] ✅ Gain node created with volume:", gainNode.gain.value);
    
    // CRITICAL SAFARI STEP: Connect audio graph properly
    console.log("🍎 [AudioContext] 🔗 Connecting audio graph:");
    console.log("🍎 [AudioContext] 🔗 source -> gainNode");
    source.connect(gainNode);
    console.log("🍎 [AudioContext] 🔗 gainNode -> audioContext.destination");
    gainNode.connect(audioContext.destination);
    console.log("🍎 [AudioContext] ✅ Audio graph connected successfully");
    
    // Debug destination info
    console.log("🍎 [AudioContext] Destination info:");
    console.log("🍎 [AudioContext]   - Max channels:", audioContext.destination.maxChannelCount);
    console.log("🍎 [AudioContext]   - Channel count:", audioContext.destination.channelCount);
    
    // Return promise that resolves when playback ends
    return new Promise((resolve, reject) => {
      let playbackStarted = false;
      let playbackEnded = false;
      
      // Critical Safari debugging events
      source.onended = () => {
        if (playbackEnded) return; // Prevent double firing
        playbackEnded = true;
        console.log("🍎 [AudioContext] 🎉 PLAYBACK COMPLETED SUCCESSFULLY!");
        console.log("🍎 [AudioContext] Audio actually played to completion");
        
        // Clean up context
        if (audioContext && audioContext.state !== 'closed') {
          audioContext.close();
          console.log("🍎 [AudioContext] AudioContext closed");
        }
        resolve();
      };
      
      // Note: AudioBufferSourceNode doesn't have onerror property
      // Errors are typically handled via try-catch blocks around AudioContext operations
      
      // Add debugging event to confirm start
      source.addEventListener('start', () => {
        console.log("🍎 [AudioContext] 🎵 Source start event fired");
      });
      
      // Set a timeout to check if audio actually played
      const timeoutMs = (audioBuffer.duration + 1) * 1000; // Duration + 1 second buffer
      const timeoutId = setTimeout(() => {
        if (!playbackEnded) {
          console.warn("🍎 [AudioContext] ⚠️ Audio did not complete in expected time");
          console.warn("🍎 [AudioContext] Expected duration:", audioBuffer.duration, "seconds");
          console.warn("🍎 [AudioContext] This might indicate silent playback in Safari");
          
          // Don't reject, just resolve since this is common in Safari
          if (!playbackEnded) {
            playbackEnded = true;
            resolve();
          }
        }
      }, timeoutMs);
      
      // Clear timeout if playback ends normally
      const originalEnded = source.onended;
      source.onended = (event) => {
        clearTimeout(timeoutId);
        if (originalEnded) originalEnded.call(source, event);
      };
      
      // CRITICAL: Start playback
      console.log("🍎 [AudioContext] 🚀 STARTING PLAYBACK NOW...");
      if (audioContext) {
        console.log("🍎 [AudioContext] Context state before start:", audioContext.state);
      }
      
      try {
        source.start(0);
        playbackStarted = true;
        console.log("🍎 [AudioContext] ✅ source.start(0) called successfully");
        console.log("🍎 [AudioContext] 🎵 Audio should now be playing...");
        
        // Log current time to verify context is active
        if (audioContext) {
          console.log("🍎 [AudioContext] Current time:", audioContext.currentTime);
        }
        
        // Monitor context state every 100ms for debugging
        const stateMonitor = setInterval(() => {
          if (playbackEnded) {
            clearInterval(stateMonitor);
            return;
          }
          console.log("🍎 [AudioContext] Monitor - State:", audioContext?.state, "Time:", audioContext?.currentTime);
        }, 100);
        
        // Clear monitor after expected duration
        setTimeout(() => clearInterval(stateMonitor), timeoutMs);
        
      } catch (startError) {
        console.error("🍎 [AudioContext] ❌ source.start() failed:", startError);
        clearTimeout(timeoutId);
        if (audioContext && audioContext.state !== 'closed') {
          audioContext.close();
        }
        reject(startError);
      }
    });
    
  } catch (error) {
    console.error("🍎 [AudioContext] ❌ FATAL ERROR:", error);
    console.error("🍎 [AudioContext] Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Clean up on error
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
    }
    
    throw error;
  }
};

// Enhanced Audio element playback with proper loading and Safari checks
export const playAudioWithElement = async (audioUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    
    // Critical Safari settings
    audio.volume = 1.0;
    audio.muted = false;
    audio.preload = 'auto';
    
    console.log(`🎵 [Audio Element] Setting up audio: ${audioUrl.substring(0, 50)}...`);
    console.log(`🎵 [Audio Element] Safari: ${isSafari()}, Volume: ${audio.volume}, Muted: ${audio.muted}`);
    
    let playbackStarted = false;
    
    audio.oncanplaythrough = () => {
      console.log("🎵 [Audio Element] Can play through - audio fully loaded");
      if (!playbackStarted) {
        playbackStarted = true;
        audio.play().catch((error) => {
          console.error("❌ [Audio Element] Play failed in canplaythrough:", error);
          reject(error);
        });
      }
    };
    
    audio.onloadeddata = () => {
      console.log("🎵 [Audio Element] Audio data loaded");
    };
    
    audio.onplay = () => {
      console.log("🎵 [Audio Element] Audio started playing");
    };
    
    audio.onended = () => {
      console.log("✅ [Audio Element] Audio playback completed");
      resolve();
    };
    
    audio.onerror = (error) => {
      console.error("❌ [Audio Element] Audio error:", error, audio.error);
      reject(new Error(`Audio playback failed: ${audio.error?.message || 'Unknown error'}`));
    };
    
    // Set source and load
    audio.src = audioUrl;
    audio.load(); // Explicitly load the audio
    
    // Fallback: try to play after a short delay if canplaythrough doesn't fire
    setTimeout(() => {
      if (!playbackStarted && audio.readyState >= 3) { // HAVE_FUTURE_DATA
        console.log("🎵 [Audio Element] Fallback play attempt");
        playbackStarted = true;
        audio.play().catch((error) => {
          console.error("❌ [Audio Element] Fallback play failed:", error);
          reject(error);
        });
      }
    }, 1000);
  });
};

// User-triggered audio playback with multiple fallback strategies
export const playAudioFromUserClick = async (audioUrl: string): Promise<void> => {
  console.log(`🎵 [User-triggered] Starting playback: ${audioUrl.substring(0, 50)}...`);
  console.log(`🎵 [User-triggered] Safari detected: ${isSafari()}`);
  
  try {
    // Strategy 1: Try AudioContext first for Safari (most reliable)
    if (isSafari()) {
      console.log("🍎 [User-triggered] Using AudioContext for Safari");
      await playAudioWithContext(audioUrl);
      return;
    }
    
    // Strategy 2: Enhanced Audio element for other browsers
    console.log("🎵 [User-triggered] Using enhanced Audio element");
    await playAudioWithElement(audioUrl);
    
  } catch (error) {
    console.error("❌ [User-triggered] Primary playback failed:", error);
    
    // Strategy 3: Fallback to simple audio play
    console.log("🎵 [User-triggered] Trying fallback simple audio play");
    try {
      const audio = new Audio(audioUrl);
      audio.volume = 1.0;
      audio.muted = false;
      await audio.play();
      console.log("✅ [User-triggered] Fallback playback successful");
    } catch (fallbackError) {
      console.error("❌ [User-triggered] All playback strategies failed:", fallbackError);
      throw fallbackError;
    }
  }
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

// Detect Safari browser for autoplay restrictions
const isSafari = (): boolean => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

// Safari-compatible audio playback that respects autoplay restrictions
export const playSafariCompatibleAudio = async (
  audioUrl: string,
  requireUserInteraction: boolean = false
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);
    audio.volume = 1.0;
    audio.muted = false;
    
    console.log(`🎵 [Safari-compatible] Playing audio: ${audioUrl.substring(0, 50)}...`);
    console.log(`🎵 [Safari-compatible] Safari detected: ${isSafari()}`);
    console.log(`🎵 [Safari-compatible] User interaction required: ${requireUserInteraction}`);
    
    // Event handlers
    audio.oncanplay = () => {
      console.log("🎵 [Safari-compatible] Audio can play");
    };
    
    audio.onplay = () => {
      console.log("🎵 [Safari-compatible] Audio play event fired");
    };
    
    audio.onended = () => {
      console.log("🎵 [Safari-compatible] Audio playback ended successfully");
      resolve();
    };
    
    audio.onerror = (error) => {
      console.error("❌ [Safari-compatible] Audio playback error:", error);
      console.error("❌ [Safari-compatible] Audio error details:", audio.error);
      reject(new Error("Audio playback failed"));
    };

    // For Safari, we need special handling for autoplay restrictions
    if (isSafari() && requireUserInteraction) {
      console.log("🍎 [Safari-compatible] Attempting playback with user interaction handling");
    }
    
    // Attempt to play
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("✅ [Safari-compatible] Audio playback started successfully");
        })
        .catch((error) => {
          console.error("❌ [Safari-compatible] Play promise rejected:", error);
          // In Safari, this is often due to autoplay restrictions
          if (error.name === 'NotAllowedError') {
            console.warn("🍎 [Safari-compatible] Autoplay blocked - user interaction required");
            reject(new Error("Autoplay blocked: user interaction required"));
          } else {
            reject(new Error(`Audio playback failed: ${error.message}`));
          }
        });
    }
  });
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
    console.log("🎧 Audio blob type:", audioBlob.type);
    console.log("🎧 Audio blob size:", audioBlob.size, "bytes");
    
    // Create correct audio blob with mpeg type for ElevenLabs
    const correctBlob = new Blob([audioBlob], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(correctBlob);
    console.log("🔊 Audio URL generated:", audioUrl.substring(0, 50) + "...");

    if (autoplay) {
      try {
        await playSafariCompatibleAudio(audioUrl, true);
        console.log("✅ ElevenLabs AI voice played successfully");
      } catch (error) {
        console.warn("⚠️ Autoplay failed, audio URL still available for manual playback:", error);
        // Don't throw error, just log warning - the URL is still valid for user-triggered playback
      }
    }
    
    return audioUrl;
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
