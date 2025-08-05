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

// Voicemod API Integration
class VoicemodAPI {
  private apiKey: string;
  private baseUrl = "https://api.voicemod.net";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // Test API connection on initialization
    this.testConnection();
  }

  private async testConnection() {
    try {
      console.log("🧪 Testing Voicemod API connection...");
      const response = await fetch(`${this.baseUrl}/api/v1/effects`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
      });

      console.log(`🧪 Test response status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Voicemod API connection successful!");
        console.log("📋 Available effects:", data);
      } else {
        console.log("❌ Voicemod API connection failed");
        const errorText = await response.text();
        console.log("📋 Error response:", errorText);
      }
    } catch (error) {
      console.error("💥 Voicemod API test failed:", error);
    }
  }

  async processVoice(
    audioBlob: Blob,
    effectId: string
  ): Promise<VoiceProcessingResult> {
    try {
      const startTime = Date.now();
      console.log(`Processing with Voicemod API, effect: ${effectId}`);

      // Convert blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);

      // Prepare request payload for Voicemod API
      const payload = {
        audio: base64Audio,
        effectId: effectId,
        format: "wav",
        sampleRate: 44100,
      };

      console.log(
        `🚀 Sending request to Voicemod API with effect: ${effectId}`
      );
      console.log(`📡 API URL: ${this.baseUrl}/api/v1/audio/effects`);
      console.log(`🔑 Using API Key: ${this.apiKey.substring(0, 10)}...`);
      console.log(`📦 Payload:`, payload);

      const response = await fetch(`${this.baseUrl}/api/v1/audio/effects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "VzMVP/1.0",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log(`📊 Voicemod API response status: ${response.status}`);
      console.log(
        `📋 Response headers:`,
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Voicemod API error response: ${errorText}`);
        throw new Error(
          `Voicemod API error: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Voicemod API response:", result);

      const processingTime = Date.now() - startTime;

      // Handle different response formats
      let audioUrl: string;
      if (result.processedAudioUrl) {
        audioUrl = result.processedAudioUrl;
      } else if (result.audio) {
        // If API returns base64 audio directly
        audioUrl = `data:audio/wav;base64,${result.audio}`;
      } else if (result.url) {
        audioUrl = result.url;
      } else {
        throw new Error("No audio data received from Voicemod API");
      }

      return {
        success: true,
        audioUrl,
        processingTime,
      };
    } catch (error) {
      console.error("Voicemod API error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64 data
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// ElevenLabs API Integration
class ElevenLabsAPI {
  private apiKey: string;
  private baseUrl = "https://api.elevenlabs.io/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // Test API connection on initialization
    this.testConnection();
  }

  private async testConnection() {
    try {
      console.log("🧪 Testing ElevenLabs API connection...");
      console.log("🔑 Using API Key:", this.apiKey.substring(0, 10) + "...");

      const response = await fetch(`${this.baseUrl}/voices`, {
        method: "GET",
        headers: {
          "xi-api-key": this.apiKey,
          Accept: "application/json",
        },
      });

      console.log(`🧪 ElevenLabs test response status: ${response.status}`);
      console.log(
        `🧪 Response headers:`,
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ ElevenLabs API connection successful!");
        console.log("📋 Available voices:", data.voices?.length || 0, "voices");
        if (data.voices && data.voices.length > 0) {
          console.log(
            "📋 First voice:",
            data.voices[0].name,
            "ID:",
            data.voices[0].voice_id
          );
        }
      } else {
        console.log("❌ ElevenLabs API connection failed");
        const errorText = await response.text();
        console.log("📋 Error response:", errorText);
      }
    } catch (error) {
      console.error("💥 ElevenLabs API test failed:", error);
    }
  }

  async processVoice(
    audioBlob: Blob,
    voiceId: string
  ): Promise<VoiceProcessingResult> {
    try {
      const startTime = Date.now();
      console.log(
        `🎤 Processing with ElevenLabs Enhanced TTS, voice: ${voiceId}`
      );
      console.log(
        `📊 Audio blob size: ${audioBlob.size} bytes, type: ${audioBlob.type}`
      );

      // First, convert audio to text using speech-to-text
      console.log("🔤 Converting audio to text...");
      const transcription = await this.speechToText(audioBlob);

      if (!transcription.success || !transcription.text) {
        throw new Error("Failed to transcribe audio");
      }

      console.log("📝 Transcribed text:", transcription.text);

      // Analyze original audio to determine speed and characteristics
      console.log("🎵 Analyzing original audio characteristics...");
      const audioAnalysis = await this.analyzeAudio(audioBlob);
      console.log("📊 Audio analysis:", audioAnalysis);

      // Generate new voice using text-to-speech with enhanced settings
      console.log(`🎵 Generating speech with voice ID: ${voiceId}`);
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": this.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: transcription.text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.3, // Lower stability for more natural variation
              similarity_boost: 0.85, // Higher similarity for better voice matching
              style: 0.0, // No style modification
              use_speaker_boost: true, // Enable speaker boost
              speed: audioAnalysis.speed, // Use analyzed speed from original audio
            },
          }),
        }
      );

      console.log(
        `📊 ElevenLabs Enhanced TTS response status: ${response.status}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ElevenLabs Enhanced TTS error response: ${errorText}`);
        throw new Error(
          `ElevenLabs Enhanced TTS error: ${response.status} - ${errorText}`
        );
      }

      const audioBuffer = await response.arrayBuffer();
      const audioUrl = URL.createObjectURL(
        new Blob([audioBuffer], { type: "audio/mpeg" })
      );
      const processingTime = Date.now() - startTime;

      console.log(
        `✅ ElevenLabs Enhanced TTS completed in ${processingTime}ms`
      );

      return {
        success: true,
        audioUrl,
        processingTime,
      };
    } catch (error) {
      console.error("ElevenLabs Enhanced TTS error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async analyzeAudio(
    audioBlob: Blob
  ): Promise<{ speed: number; duration: number; wordCount: number }> {
    try {
      // Convert audio to AudioBuffer for analysis
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Get audio duration
      const duration = audioBuffer.duration;

      // Estimate word count (rough approximation: 150 words per minute)
      const estimatedWordsPerMinute = 150;
      const wordCount = Math.round((duration / 60) * estimatedWordsPerMinute);

      // Calculate speed based on duration and word count
      // Normal speed is around 1.0, faster speech > 1.0, slower speech < 1.0
      const normalWordsPerMinute = 150;
      const actualWordsPerMinute = (wordCount / duration) * 60;
      const speed = Math.max(
        0.5,
        Math.min(2.0, actualWordsPerMinute / normalWordsPerMinute)
      );

      console.log(`📊 Audio Analysis Results:`);
      console.log(`   Duration: ${duration.toFixed(2)}s`);
      console.log(`   Estimated words: ${wordCount}`);
      console.log(`   Words per minute: ${actualWordsPerMinute.toFixed(1)}`);
      console.log(`   Calculated speed: ${speed.toFixed(2)}`);

      return {
        speed: speed,
        duration: duration,
        wordCount: wordCount,
      };
    } catch (error) {
      console.error("Audio analysis error:", error);
      // Return default values if analysis fails
      return {
        speed: 1.0,
        duration: 0,
        wordCount: 0,
      };
    }
  }

  private async speechToText(
    audioBlob: Blob
  ): Promise<{ success: boolean; text?: string; error?: string }> {
    try {
      console.log("🔤 Starting speech-to-text conversion...");
      console.log(
        "📊 Audio blob for STT:",
        audioBlob.size,
        "bytes, type:",
        audioBlob.type
      );

      // Convert audio to the correct format for ElevenLabs STT
      let audioFile: Blob;
      if (audioBlob.type === "audio/mp4") {
        // Convert MP4 to WAV format for better compatibility
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Create WAV blob
        const wavBlob = await this.audioBufferToWav(audioBuffer);
        audioFile = wavBlob;
      } else {
        audioFile = audioBlob;
      }

      const formData = new FormData();
      formData.append("file", audioFile, "audio.wav");
      formData.append("model_id", "scribe_v1");

      console.log(
        "📡 Sending STT request to:",
        `${this.baseUrl}/speech-to-text`
      );
      console.log(
        "📊 Audio file size:",
        audioFile.size,
        "bytes, type:",
        audioFile.type
      );

      const response = await fetch(`${this.baseUrl}/speech-to-text`, {
        method: "POST",
        headers: {
          "xi-api-key": this.apiKey,
        },
        body: formData,
      });

      console.log("📊 STT response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ STT error response:", errorText);
        throw new Error(
          `Speech-to-text error: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("✅ STT result:", result);

      return {
        success: true,
        text: result.text,
      };
    } catch (error) {
      console.error("💥 STT error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async audioBufferToWav(audioBuffer: AudioBuffer): Promise<Blob> {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;

    // Create WAV header
    const buffer = new ArrayBuffer(44 + length * numChannels * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + length * numChannels * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, length * numChannels * 2, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(
          -1,
          Math.min(1, audioBuffer.getChannelData(channel)[i])
        );
        view.setInt16(
          offset,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true
        );
        offset += 2;
      }
    }

    return new Blob([buffer], { type: "audio/wav" });
  }
}

// Azure Cognitive Services Integration
class AzureVoiceAPI {
  private apiKey: string;
  private region: string;
  private baseUrl: string;

  constructor(apiKey: string, region: string) {
    this.apiKey = apiKey;
    this.region = region;
    this.baseUrl = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  }

  async processVoice(
    audioBlob: Blob,
    voiceName: string
  ): Promise<VoiceProcessingResult> {
    try {
      const startTime = Date.now();

      // Convert audio to text
      const transcription = await this.speechToText(audioBlob);

      if (!transcription.success || !transcription.text) {
        throw new Error("Failed to transcribe audio");
      }

      // Generate new voice
      const response = await fetch(`${this.baseUrl}/text-to-speech`, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": this.apiKey,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
        },
        body: this.createSSML(transcription.text, voiceName),
      });

      if (!response.ok) {
        throw new Error(`Azure API error: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const audioUrl = URL.createObjectURL(
        new Blob([audioBuffer], { type: "audio/mpeg" })
      );
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        audioUrl,
        processingTime,
      };
    } catch (error) {
      console.error("Azure API error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async speechToText(
    audioBlob: Blob
  ): Promise<{ success: boolean; text?: string; error?: string }> {
    try {
      const response = await fetch(
        `https://${this.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": this.apiKey,
            "Content-Type": "audio/wav",
          },
          body: audioBlob,
        }
      );

      if (!response.ok) {
        throw new Error(`Speech-to-text error: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        text: result.DisplayText,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private createSSML(text: string, voiceName: string): string {
    return `<speak version='1.0' xml:lang='en-US'>
      <voice xml:lang='en-US' xml:gender='Female' name='${voiceName}'>
        ${text}
      </voice>
    </speak>`;
  }
}

// Enhanced Local Processing with Advanced Audio Effects
class LocalVoiceProcessor {
  async processVoice(
    audioBlob: Blob,
    effectId: string
  ): Promise<VoiceProcessingResult> {
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

    // Determine Safari-compatible MIME type for MediaRecorder
    function isSafari(): boolean {
      const userAgent = navigator.userAgent;
      return userAgent.includes("Safari") && !userAgent.includes("Chrome");
    }

    function getCompatibleMimeType(): string {
      if (isSafari()) {
        // Safari prefers MP4/AAC for recording and playback
        if (MediaRecorder.isTypeSupported("audio/mp4")) {
          return "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/mp4;codecs=mp4a.40.2")) {
          return "audio/mp4;codecs=mp4a.40.2";
        } else {
          return "audio/mp4"; // fallback
        }
      } else {
        // Chrome/Firefox prefer WebM
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          return "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          return "audio/webm";
        } else {
          return "audio/webm"; // fallback
        }
      }
    }

    const mimeType = getCompatibleMimeType();
    console.log(`🎤 Using MIME type for LocalVoiceProcessor: ${mimeType}`);

    const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream, { mimeType });
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
    const pitchConfigs = {
      // Voicemod effects with enhanced local processing
      "voicemod-female": {
        playbackRate: 1.4,
        description: "Female voice transformation - Enhanced local",
      },
      "voicemod-male": {
        playbackRate: 0.7,
        description: "Male voice transformation - Enhanced local",
      },
      "voicemod-child": {
        playbackRate: 1.6,
        description: "Child voice transformation - Enhanced local",
      },
      "voicemod-elder": {
        playbackRate: 0.5,
        description: "Elder voice transformation - Enhanced local",
      },
      "voicemod-robot": {
        playbackRate: 0.8,
        description: "Robot voice effect - Enhanced local",
      },
      "voicemod-echo": {
        playbackRate: 1.0,
        description: "Echo effect - Enhanced local",
      },
      "voicemod-radio": {
        playbackRate: 1.1,
        description: "Radio effect - Enhanced local",
      },
      "voicemod-phone": {
        playbackRate: 0.9,
        description: "Phone effect - Enhanced local",
      },

      // ElevenLabs effects with enhanced local processing
      "elevenlabs-rachel": {
        playbackRate: 1.3,
        description: "Rachel voice - Enhanced local",
      },
      "elevenlabs-domi": {
        playbackRate: 0.8,
        description: "Domi voice - Enhanced local",
      },
      "elevenlabs-bella": {
        playbackRate: 1.4,
        description: "Bella voice - Enhanced local",
      },
      "elevenlabs-arnold": {
        playbackRate: 0.6,
        description: "Arnold voice - Enhanced local",
      },

      // Original local effects
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
      pitchConfigs[effectId as keyof typeof pitchConfigs] || {
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

// Main Voice Processing Service
export class VoiceProcessingService {
  private voicemodAPI?: VoicemodAPI;
  private elevenLabsAPI?: ElevenLabsAPI;
  private azureAPI?: AzureVoiceAPI;
  private localProcessor: LocalVoiceProcessor;

  constructor() {
    this.localProcessor = new LocalVoiceProcessor();

    // Initialize APIs if keys are available
    const voicemodKey = process.env.NEXT_PUBLIC_VOICEMOD_API_KEY;
    const elevenLabsKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    const azureKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
    const azureRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

    // Debug: Log API key status
    console.log("🔑 API Key Status:");
    console.log(
      "Voicemod API Key:",
      voicemodKey ? "✅ Available" : "❌ Missing"
    );
    console.log(
      "ElevenLabs API Key:",
      elevenLabsKey ? "✅ Available" : "❌ Missing"
    );
    if (elevenLabsKey) {
      console.log(
        "🔑 ElevenLabs Key (first 10 chars):",
        elevenLabsKey.substring(0, 10) + "..."
      );
    }
    console.log("Azure Speech Key:", azureKey ? "✅ Available" : "❌ Missing");
    console.log("Azure Region:", azureRegion ? "✅ Available" : "❌ Missing");

    if (voicemodKey) {
      this.voicemodAPI = new VoicemodAPI(voicemodKey);
      console.log("✅ Voicemod API initialized");
    } else {
      console.log("❌ Voicemod API not initialized - missing API key");
    }

    if (elevenLabsKey) {
      this.elevenLabsAPI = new ElevenLabsAPI(elevenLabsKey);
      console.log("✅ ElevenLabs API initialized");
    } else {
      console.log("❌ ElevenLabs API not initialized - missing API key");
    }

    if (azureKey && azureRegion) {
      this.azureAPI = new AzureVoiceAPI(azureKey, azureRegion);
      console.log("✅ Azure Speech API initialized");
    } else {
      console.log(
        "❌ Azure Speech API not initialized - missing API key or region"
      );
    }
  }

  async processVoice(
    audioBlob: Blob,
    effect: VoiceEffect
  ): Promise<VoiceProcessingResult> {
    console.log(
      `🎤 Processing voice with ${effect.apiProvider} for effect: ${effect.name}`
    );
    console.log(
      `📊 Audio blob size: ${audioBlob.size} bytes, type: ${audioBlob.type}`
    );

    try {
      switch (effect.apiProvider) {
        case "elevenlabs":
          if (this.elevenLabsAPI && effect.voiceId) {
            console.log("🚀 Attempting ElevenLabs API processing...");
            return await this.elevenLabsAPI.processVoice(
              audioBlob,
              effect.voiceId
            );
          } else {
            console.error("❌ ElevenLabs API not available or missing voiceId");
            return {
              success: false,
              error:
                "ElevenLabs API not available - missing API key or voice configuration",
            };
          }

        case "local":
        default:
          console.log("🚀 Using local processing...");
          return await this.localProcessor.processVoice(audioBlob, effect.id);
      }

      // Fallback to local processing
      console.log("🔄 Falling back to local processing...");
      return await this.localProcessor.processVoice(audioBlob, effect.id);
    } catch (error) {
      console.error("💥 Voice processing error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  getAvailableEffects(): VoiceEffect[] {
    return [
      // Enhanced Local Effects (Fallback) - Put these first for immediate availability
      {
        id: "sweet-angel",
        name: "👼 Sweet Angel (Local)",
        description: "Higher pitch for female transformation",
        category: "Local Effects",
        apiProvider: "local",
        effectId: "sweet-angel",
      },
      {
        id: "elegant-queen",
        name: "👑 Elegant Queen (Local)",
        description: "Medium-high pitch for mature female",
        category: "Local Effects",
        apiProvider: "local",
        effectId: "elegant-queen",
      },
      {
        id: "noble-knight",
        name: "⚔️ Noble Knight (Local)",
        description: "Lower pitch for male transformation",
        category: "Local Effects",
        apiProvider: "local",
        effectId: "noble-knight",
      },
      {
        id: "wise-sage",
        name: "🧙‍♂️ Wise Sage (Local)",
        description: "Very low pitch for elder voice",
        category: "Local Effects",
        apiProvider: "local",
        effectId: "wise-sage",
      },
      {
        id: "crystal-clear",
        name: "💎 Crystal Clear (Local)",
        description: "Enhanced clarity and brightness",
        category: "Local Effects",
        apiProvider: "local",
        effectId: "crystal-clear",
      },

      // ElevenLabs Professional Female Voices
      {
        id: "elevenlabs-rachel",
        name: "👩 Rachel",
        description: "Professional female voice - clear and confident",
        category: "Professional Female",
        apiProvider: "elevenlabs",
        voiceId: "21m00Tcm4TlvDq8ikWAM",
      },
      {
        id: "elevenlabs-bella",
        name: "👩 Bella",
        description: "Sweet and warm female voice",
        category: "Professional Female",
        apiProvider: "elevenlabs",
        voiceId: "EXAVITQu4vr4xnSDxMaL",
      },
      {
        id: "elevenlabs-aria",
        name: "👩 Aria",
        description: "Elegant and sophisticated female voice",
        category: "Professional Female",
        apiProvider: "elevenlabs",
        voiceId: "9BWtsMINqrJLrRacOk9x",
      },
      {
        id: "elevenlabs-sarah",
        name: "👩 Sarah",
        description: "Friendly and approachable female voice",
        category: "Professional Female",
        apiProvider: "elevenlabs",
        voiceId: "VR6AewLTigWG4xSOukaG",
      },
      {
        id: "elevenlabs-emily",
        name: "👩 Emily",
        description: "Young and energetic female voice",
        category: "Professional Female",
        apiProvider: "elevenlabs",
        voiceId: "AZnzlk1XvdvUeBnXmlld",
      },

      // ElevenLabs Professional Male Voices
      {
        id: "elevenlabs-domi",
        name: "👨 Domi",
        description: "Professional male voice - strong and clear",
        category: "Professional Male",
        apiProvider: "elevenlabs",
        voiceId: "AZnzlk1XvdvUeBnXmlld",
      },
      {
        id: "elevenlabs-arnold",
        name: "👨 Arnold",
        description: "Deep and powerful male voice",
        category: "Professional Male",
        apiProvider: "elevenlabs",
        voiceId: "VR6AewLTigWG4xSOukaG",
      },
      {
        id: "elevenlabs-josh",
        name: "👨 Josh",
        description: "Warm and friendly male voice",
        category: "Professional Male",
        apiProvider: "elevenlabs",
        voiceId: "TxGEqnHWrfWFTfGW9XjX",
      },
      {
        id: "elevenlabs-sam",
        name: "👨 Sam",
        description: "Young and energetic male voice",
        category: "Professional Male",
        apiProvider: "elevenlabs",
        voiceId: "yoZ06aMxZJJ28mfd3POQ",
      },
      {
        id: "elevenlabs-echo",
        name: "👨 Echo",
        description: "Strong and confident male voice",
        category: "Professional Male",
        apiProvider: "elevenlabs",
        voiceId: "pNInz6obpgDQGcFmaJgB",
      },

      // ElevenLabs Character Voices
      {
        id: "elevenlabs-dorothy",
        name: "👵 Dorothy",
        description: "Wise and gentle elder voice",
        category: "Character Voices",
        apiProvider: "elevenlabs",
        voiceId: "ThT5KcBeYPX3keUQqHPh",
      },
      {
        id: "elevenlabs-charlie",
        name: "👴 Charlie",
        description: "Mature and experienced male voice",
        category: "Character Voices",
        apiProvider: "elevenlabs",
        voiceId: "VR6AewLTigWG4xSOukaG",
      },
      {
        id: "elevenlabs-lily",
        name: "👧 Lily",
        description: "Young and cheerful female voice",
        category: "Character Voices",
        apiProvider: "elevenlabs",
        voiceId: "EXAVITQu4vr4xnSDxMaL",
      },
      {
        id: "elevenlabs-tommy",
        name: "👦 Tommy",
        description: "Young and enthusiastic male voice",
        category: "Character Voices",
        apiProvider: "elevenlabs",
        voiceId: "yoZ06aMxZJJ28mfd3POQ",
      },
    ];
  }

  public getPitchSettings(effectId: string) {
    return this.localProcessor.getPitchSettings(effectId);
  }
}

// Export singleton instance
export const voiceProcessingService = new VoiceProcessingService();
