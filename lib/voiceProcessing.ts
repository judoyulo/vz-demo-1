// Professional Voice Processing Service
// Integrates multiple APIs for high-quality voice transformation

export interface VoiceProcessingResult {
  success: boolean;
  audioUrl?: string;
  error?: string;
  processingTime?: number;
}

export interface VoiceEffect {
  id: string;
  name: string;
  description: string;
  category: string;
  apiProvider: "elevenlabs" | "local";
  effectId?: string;
  voiceId?: string;
}

// This class is now designed to run ONLY on the client-side.
// It does NOT handle API keys directly. It calls our internal API routes.
class ElevenLabsClientAPI {

  // No constructor with API key needed here

  async processVoice(
    audioBlob: Blob,
    voiceId: string
  ): Promise<VoiceProcessingResult> {
    try {
      const startTime = Date.now();
      console.log(`🎤 Client-side call to process with ElevenLabs, voice: ${voiceId}`);
      
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("voiceId", voiceId);

      // This fetch call goes to OUR OWN API route, not directly to ElevenLabs
      const response = await fetch('/api/elevenlabs-tts', {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error from our API route: ${errorText}`);
        throw new Error(`API route error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        audioUrl: result.audioUrl,
        processingTime,
      };

    } catch (error) {
      console.error("Client-side ElevenLabs processing error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// This class remains mostly the same, handling local browser-based audio processing.
class LocalVoiceProcessor {
  async processVoice(
    audioBlob: Blob,
    effectId: string
  ): Promise<VoiceProcessingResult> {
    // ... (rest of the LocalVoiceProcessor class is unchanged)
    try {
      console.log(
        `🎵 LocalVoiceProcessor: Starting processing for effect: ${effectId}`
      );
      console.log(
        `📊 Audio blob info: size=${audioBlob.size}, type=${audioBlob.type}`
      );

      const startTime = Date.now();

      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      console.log(
        `🎵 AudioContext created: sampleRate=${audioContext.sampleRate}`
      );

      const arrayBuffer = await audioBlob.arrayBuffer();
      console.log(`📊 ArrayBuffer size: ${arrayBuffer.byteLength} bytes`);

      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log(
        `🎵 AudioBuffer decoded: duration=${audioBuffer.duration}s, channels=${audioBuffer.numberOfChannels}, sampleRate=${audioBuffer.sampleRate}`
      );

      // Create advanced processing chain
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;

      // Apply professional effects based on effectId
      console.log(`🎭 Applying professional effects for: ${effectId}`);
      const processedAudio = await this.applyProfessionalEffects(
        audioContext,
        source,
        effectId
      );

      const processingTime = Date.now() - startTime;
      console.log(
        `✅ LocalVoiceProcessor: Processing completed in ${processingTime}ms`
      );
      console.log(`🎵 Processed audio URL: ${processedAudio}`);

      return {
        success: true,
        audioUrl: processedAudio,
        processingTime,
      };
    } catch (error) {
      console.error("❌ LocalVoiceProcessor error:", error);
      console.error("❌ Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
        effectId: effectId,
        blobSize: audioBlob.size,
        blobType: audioBlob.type,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async applyProfessionalEffects(
    audioContext: AudioContext,
    source: AudioBufferSourceNode,
    effectId: string
  ): Promise<string> {
    console.log(
      `🎭 applyProfessionalEffects: Starting for effect: ${effectId}`
    );

    // Create advanced audio processing chain with pitch shifting
    const filters = this.createFilterChain(audioContext, effectId);
    const compressor = this.createCompressor(audioContext);
    const gainNode = audioContext.createGain();

    // Apply dramatic pitch shifting for real voice transformation
    const pitchSettings = this.getPitchSettings(effectId);
    source.playbackRate.value = pitchSettings.playbackRate;
    console.log(
      `🎵 Applied pitch shift: ${pitchSettings.playbackRate}x playback rate (${pitchSettings.description})`
    );

    // Set gain for more dramatic effect
    gainNode.gain.value = 1.2; // Boost volume slightly
    console.log(`🔊 Applied gain boost: 1.2x`);

    // Connect the advanced processing chain
    console.log(`🔗 Connecting audio processing chain...`);
    source.connect(filters.input);
    filters.output.connect(compressor);
    compressor.connect(gainNode);

    // Record the processed audio
    const mediaStreamDestination = audioContext.createMediaStreamDestination();
    gainNode.connect(mediaStreamDestination);
    console.log(
      `🎙️ MediaStreamDestination connected, stream tracks: ${mediaStreamDestination.stream.getTracks().length}`
    );

    const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
    const chunks: Blob[] = [];

    return new Promise(resolve => {
      mediaRecorder.ondataavailable = event => {
        console.log(
          `📦 Recording chunk: ${event.data.size} bytes, type: ${event.data.type}`
        );
        chunks.push(event.data);
      };
      mediaRecorder.onstop = () => {
        console.log(`🛑 MediaRecorder stopped, total chunks: ${chunks.length}`);

        // Use a more compatible audio format
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "audio/mp4";

        const blob = new Blob(chunks, { type: mimeType });
        console.log(
          `✅ Processing complete. Total size: ${blob.size} bytes, type: ${mimeType}`
        );
        const audioUrl = URL.createObjectURL(blob);
        console.log("🎵 Generated audio URL:", audioUrl);
        resolve(audioUrl);
      };

      console.log(`▶️ Starting MediaRecorder and audio source...`);
      mediaRecorder.start();
      source.start(0);

      const duration = source.buffer!.duration * 1000 + 500;
      console.log(
        `⏱️ Audio duration: ${source.buffer!.duration}s, will stop in ${duration}ms`
      );

      setTimeout(() => {
        console.log(`⏹️ Stopping MediaRecorder and audio source...`);
        mediaRecorder.stop();
        source.stop();
      }, duration);
    });
  }

  public getPitchSettings(effectId: string) {
    const pitchConfigs: { [key: string]: { playbackRate: number; description: string } } = {
      "sweet-angel": { playbackRate: 1.4, description: "Higher pitch for female" },
      "elegant-queen": { playbackRate: 1.2, description: "Medium-high for mature female" },
      "noble-knight": { playbackRate: 0.7, description: "Lower pitch for male" },
      "wise-sage": { playbackRate: 0.6, description: "Very low for elder" },
      "crystal-clear": { playbackRate: 1.0, description: "Normal pitch" },
    };
    return (
      pitchConfigs[effectId] || {
        playbackRate: 1.0,
        description: "Default pitch",
      }
    );
  }

   private createFilterChain(audioContext: AudioContext, effectId: string) {
    console.log(`🎛️ Creating filter chain for effect: ${effectId}`);
    
    // Create a simple filter chain
    const inputGain = audioContext.createGain();
    const outputGain = audioContext.createGain();
    
    // Set up basic filter
    inputGain.gain.value = 1.0;
    outputGain.gain.value = 1.0;
    
    // Connect input to output
    inputGain.connect(outputGain);
    
    return {
      input: inputGain,
      output: outputGain
    };
  }

  private createCompressor(audioContext: AudioContext) {
    console.log(`🎚️ Creating compressor`);
    
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    
    return compressor;
  }
}

// Main Voice Processing Service (Client-Side)
export class VoiceProcessingService {
  private elevenLabsAPI: ElevenLabsClientAPI;
  private localProcessor: LocalVoiceProcessor;
  private isElevenLabsAvailable: boolean;

  constructor() {
    this.localProcessor = new LocalVoiceProcessor();
    this.elevenLabsAPI = new ElevenLabsClientAPI();

    // This is a simple flag. We assume if the app is deployed, the server has keys.
    // The real check happens server-side.
    this.isElevenLabsAvailable = true; 

    // No direct API key checks here anymore
    console.log("🎤 VoiceProcessingService initialized for client-side operations.");
  }

  async processVoice(
    audioBlob: Blob,
    effect: VoiceEffect
  ): Promise<VoiceProcessingResult> {
    console.log(
      `🎤 Processing voice with ${effect.apiProvider} for effect: ${effect.name}`
    );

    try {
      switch (effect.apiProvider) {
        case "elevenlabs":
          if (this.isElevenLabsAvailable && effect.voiceId) {
             return await this.elevenLabsAPI.processVoice(
              audioBlob,
              effect.voiceId
            );
          } else {
            console.warn("ElevenLabs API not configured, falling back to local processing.");
            return await this.localProcessor.processVoice(audioBlob, effect.id);
          }
        
        case "local":
        default:
          return await this.localProcessor.processVoice(audioBlob, effect.id);
      }
    } catch (error) {
      console.error("💥 Voice processing error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  getAvailableEffects(): VoiceEffect[] {
    const effects: VoiceEffect[] = [
      // Local Effects
      { id: "sweet-angel", name: "👼 Sweet Angel (Local)", description: "Higher pitch for female transformation", category: "Local Effects", apiProvider: "local" },
      { id: "elegant-queen", name: "👑 Elegant Queen (Local)", description: "Medium-high pitch for mature female", category: "Local Effects", apiProvider: "local" },
      { id: "noble-knight", name: "⚔️ Noble Knight (Local)", description: "Lower pitch for male transformation", category: "Local Effects", apiProvider: "local" },
      { id: "wise-sage", name: "🧙‍♂️ Wise Sage (Local)", description: "Very low pitch for elder voice", category: "Local Effects", apiProvider: "local" },
      { id: "crystal-clear", name: "💎 Crystal Clear (Local)", description: "Enhanced clarity and brightness", category: "Local Effects", apiProvider: "local" },
    ];
    
    // We conditionally add ElevenLabs voices.
    // The UI can use this flag to show/hide them if needed.
    if (this.isElevenLabsAvailable) {
      effects.push(
        // ElevenLabs Professional Female Voices
        { id: "elevenlabs-rachel", name: "👩 Rachel", description: "Professional female voice - clear and confident", category: "Professional Female", apiProvider: "elevenlabs", voiceId: "21m00Tcm4TlvDq8ikWAM" },
        { id: "elevenlabs-bella", name: "👩 Bella", description: "Sweet and warm female voice", category: "Professional Female", apiProvider: "elevenlabs", voiceId: "EXAVITQu4vr4xnSDxMaL" },
        // ... add other elevenlabs voices here if you wish
      );
    }
    
    return effects;
  }
  
  public getPitchSettings(effectId: string) {
    return this.localProcessor.getPitchSettings(effectId);
  }
}

// Export singleton instance
export const voiceProcessingService = new VoiceProcessingService();
