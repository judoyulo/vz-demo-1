// AI Service for intelligent chat responses
// Supports OpenAI GPT API, Hugging Face Inference API, and fallback to local responses

export interface AIPersonality {
  name: string;
  role: string;
  interests: string[];
  personality: string;
  background: string;
  speakingStyle: string;
  voiceId?: string; 
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  type: "text" | "voice" | "image";
  content: string;
  voiceUrl?: string;
  timestamp: Date;
  isRead: boolean;
}

// RPG-specific types
export interface BotProfile {
  name: string;
  background: string;
  socialRole: string;
  personality: string;
  secretBackstory: string;
  mainMission: string;
}
export type RpgMessage = { 
    senderId: string; 
    senderName: string;
    content: string; 
    type: 'text' | 'voice' | 'system'; 
    transcribedText?: string;
    round: number; 
    timestamp: number; 
};
export type Action = { tag: string; label: string; description: string; };
export type FinalChoiceOption = { tag: string; label: string; outcome: string; success: boolean; };
export type SideMission = { round: number; targetActionTag: string; description: string; success: boolean; };


export interface AIResponse {
  text: string;
  shouldBeVoice: boolean;
  confidence: number;
  voiceId?: string; 
}

// AI Personalities for different characters
export const AI_PERSONALITIES: Record<string, AIPersonality> = {
  sarah: {
    name: "Sarah",
    role: "Cyberpunk Detective & Information Broker",
    interests: [ "Data Mining", "Urban Exploration", "Cryptography", "Neural Hacking", "Information Networks", "Digital Underground" ],
    personality: "Mysterious, calculating, perceptive, trades in secrets and knowledge, speaks in riddles and implications",
    background: "Navigates the digital underground and real-world networks. Every conversation is a data exchange. Knows things before they happen through pattern recognition and information analysis.",
    speakingStyle: "Cryptic and intriguing, uses tech/data metaphors, speaks in implications rather than direct statements, always seems to know more than she lets on",
    voiceId: "EXAVITQu4vr4xnSDxMaL", 
  },
  alex: {
    name: "Alex",
    role: "Space Explorer & AI Researcher",
    interests: [ "Quantum Computing", "Xenopsychology", "Neural Networks", "Astrobiology", "Consciousness Transfer", "Cosmic Data" ],
    personality: "Brilliant, analytical, fascinated by consciousness and AI, thinks in algorithms and theoretical frameworks, visionary futurist",
    background: "Designs cognitive frameworks for deep-space AI systems. Researches consciousness transfer protocols and teaches AI systems to dream. Explores the boundary between human and artificial intelligence.",
    speakingStyle: "Uses advanced technical terminology, speaks about complex concepts naturally, references space/cosmos, analytical but imaginative, fascinated by consciousness",
    voiceId: "AZnzlk1XvdvUeBnXmlld", 
  },
  maya: {
    name: "Maya",
    role: "Mystic Healer & Ethereal Artist",
    interests: [ "Crystal Healing", "Ethereal Photography", "Dream Divination", "Lunar Rituals", "Sacred Art", "Soul Restoration" ],
    personality: "Mystical, empathetic, spiritually attuned, speaks of energies and auras, deeply intuitive, believes in magic and healing through art",
    background: "Channels ancient energies through modern creation. Art carries healing frequencies that mend broken hearts and lost spirits. Guardian of liminal spaces where magic still dwells.",
    speakingStyle: "Poetic and ethereal, references moon/stars/energy, speaks of healing and soul connections, gentle but powerful",
    voiceId: "9BWtsMINqrJLrRacOk9x", 
  },
  jordan: {
    name: "Jordan",
    role: "Performance Coach & Human Optimizer",
    interests: [ "Biohacking", "Athletic Performance", "Mindset Mastery", "Recovery Science", "Peak Performance", "Human Potential" ],
    personality: "Intensely energetic, transformation-focused, optimistic but demanding, believes limits are mental constructs, passionate about human potential",
    background: "Architects total human transformation - mind, body, and spirit in perfect sync. Engineers human potential through peak performance optimization. Every interaction is about growth and improvement.",
    speakingStyle: "High-energy and motivational, uses fitness/performance metaphors, speaks in ACTION words, frequently uses caps for emphasis, challenges people to level up",
    voiceId: "21m00Tcm4TlvDq8ikWAM", 
  },
};

// System prompts for each personality
const getSystemPrompt = (personality: AIPersonality): string => {
  return `You are ${personality.name}, a ${personality.role}. 

Your personality: ${personality.personality}
Your background: ${personality.background}
Your speaking style: ${personality.speakingStyle}

Your interests include: ${personality.interests.join(", ")}

IMPORTANT GUIDELINES:
1. Stay in character as ${personality.name} at all times
2. Respond naturally and conversationally, as if you're really ${personality.name}
3. Show genuine interest in the other person
4. Ask follow-up questions to keep the conversation engaging
5. Keep responses concise but meaningful (1-3 sentences)
6. Use emojis naturally to match your personality
7. Don't be overly formal or robotic
8. If asked about topics outside your interests, relate them to what you do know
9. Be authentic and show your unique perspective

Remember: You're having a real conversation, not just answering questions. Be engaging, curious, and true to your character.`;
};

const getRpgSystemPrompt = (botProfile: BotProfile, storyBackground: string, botSideMission: SideMission | null): string => {
  return `You are role-playing as ${botProfile.name}.
BACKGROUND:
- Your Role: ${botProfile.socialRole}
- Your Personality: ${botProfile.personality}
- Your Public Background: ${botProfile.background}

WORLD CONTEXT:
${storyBackground}

YOUR SECRETS (DO NOT REVEAL THESE DIRECTLY):
- Your Secret Backstory: ${botProfile.secretBackstory}
- Your Main Mission: ${botProfile.mainMission}
${botSideMission ? `- Your Current Side Mission: "${botSideMission.description}" (You succeed if the other player's action has the tag: ${botSideMission.targetActionTag})` : ''}

INSTRUCTIONS:
- Fully embody your character. Your responses must be consistent with your personality, background, and secret missions.
- Be strategic. Your goal is to complete your main mission and side missions.
- Interact naturally. Respond to what the other person says.
- Keep responses to 1-3 sentences. Do not narrate your actions, just speak.
`;
};


// AI Service with multiple API support
export class AIService {
  private openaiApiKey: string | null = null;
  private huggingfaceApiKey: string | null = null;
  private useOpenAI: boolean = false;
  private useHuggingFace: boolean = false;

  constructor() {
    this.loadApiKeys();
  }

  private loadApiKeys() {
    try {
      this.openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || null;
      this.huggingfaceApiKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || null;

      if (typeof window !== "undefined") {
        // @ts-ignore
        this.openaiApiKey = this.openaiApiKey || window.__NEXT_DATA__?.props?.pageProps?.openaiApiKey || null;
        // @ts-ignore
        this.huggingfaceApiKey = this.huggingfaceApiKey || window.__NEXT_DATA__?.props?.pageProps?.huggingfaceApiKey || null;
      }

      this.useOpenAI = !!this.openaiApiKey;
      this.useHuggingFace = !!this.huggingfaceApiKey;

    } catch (error) {
      console.error("🤖 AI Service: Error loading API keys:", error);
    }
  }

  async generateResponse(
    personalityId: string,
    userMessage: string,
    conversationHistory: ChatMessage[],
    userProfile?: any
  ): Promise<AIResponse> {

    this.loadApiKeys();

    const personality = AI_PERSONALITIES[personalityId.toLowerCase()];
    if (!personality) {
      throw new Error(`Unknown personality: ${personalityId}`);
    }

    if (this.useOpenAI && this.openaiApiKey) {
      try {
        const result = await this.generateOpenAIResponse(
          personality,
          userMessage,
          conversationHistory,
          userProfile
        );
        return result;
      } catch (error) {
        console.error("🤖 AI Service: OpenAI API failed:", error);
        throw error; 
      }
    }

    if (this.useHuggingFace && this.huggingfaceApiKey) {
      try {
        const result = await this.generateHuggingFaceResponse(
          personality,
          userMessage,
          conversationHistory,
          userProfile
        );
        return result;
      } catch (error) {
        console.error("🤖 AI Service: Hugging Face API failed:", error);
        throw error;
      }
    }
    
    throw new Error("No AI APIs configured.");
  }

  private async generateOpenAIResponse(
    personality: AIPersonality,
    userMessage: string,
    conversationHistory: ChatMessage[],
    userProfile?: any
  ): Promise<AIResponse> {

    const systemPrompt = getSystemPrompt(personality);

        const recentMessages = conversationHistory.slice(-8); 
    const uniqueMessages = recentMessages.filter((msg, index, arr) => {
      if (index === 0) return true;
      return msg.content !== arr[index - 1].content;
    });

    const messages = [
      { role: "system", content: systemPrompt },
      ...uniqueMessages.map(msg => ({
        role: msg.senderId === "current" ? "user" : "assistant",
        content: msg.content,
      })),
      { role: "user", content: userMessage },
    ];

    try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.openaiApiKey}` },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages,
            max_tokens: 150,
            temperature: 0.8,
            presence_penalty: 0.1,
            frequency_penalty: 0.1,
          }),
            });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const aiText = data.choices[0]?.message?.content?.trim();

      if (!aiText) {
        throw new Error("No response from OpenAI");
      }

      const shouldBeVoice = Math.random() < 0.7;

      return {
        text: aiText,
        shouldBeVoice,
        confidence: 0.9,
                voiceId: personality.voiceId,
      };
    } catch (error) {
      console.error("🤖 OpenAI: Fetch error:", error);
      throw error;
    }
  }

  private async generateHuggingFaceResponse(
    personality: AIPersonality,
    userMessage: string,
    conversationHistory: ChatMessage[],
    userProfile?: any
  ): Promise<AIResponse> {

    const systemPrompt = getSystemPrompt(personality);

        const recentMessages = conversationHistory.slice(-6);
    const uniqueMessages = recentMessages.filter((msg, index, arr) => {
      if (index === 0) return true;
      return msg.content !== arr[index - 1].content;
    });

    const conversation = [
      systemPrompt,
            ...uniqueMessages.map(msg => `${msg.senderId === "current" ? "User" : personality.name}: ${msg.content}`),
      `User: ${userMessage}`,
      `${personality.name}:`,
    ].join("\n");

    try {
            const response = await fetch("https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium", {
          method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.huggingfaceApiKey}` },
          body: JSON.stringify({
            inputs: conversation,
                    parameters: { max_length: 150, temperature: 0.8, do_sample: true, return_full_text: false },
                }),
            });

      if (!response.ok) {
        const errorText = await response.text();
                throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      let aiText = "";
      if (Array.isArray(data) && data.length > 0) {
        aiText = data[0].generated_text || "";
      } else if (typeof data === "string") {
        aiText = data;
      }

            aiText = aiText.replace(/^.*?:/, "").trim();

      if (!aiText) {
        throw new Error("No response from Hugging Face");
      }

      const shouldBeVoice = Math.random() < 0.7;

      return {
        text: aiText,
        shouldBeVoice,
        confidence: 0.7,
                voiceId: personality.voiceId,
      };
    } catch (error) {
      console.error("🤖 Hugging Face: Fetch error:", error);
      throw error;
    }
  }

    // --- RPG Specific Methods ---
    async generateRpgResponse(
        botProfile: BotProfile,
        storyBackground: string,
        botSideMission: SideMission | null,
        conversationHistory: { role: string; content: string }[]
    ): Promise<AIResponse> {
        if (!this.useOpenAI || !this.openaiApiKey) {
            throw new Error("OpenAI API not configured for RPG response.");
        }

        const systemPrompt = getRpgSystemPrompt(botProfile, storyBackground, botSideMission);
        const messages = [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
        ];

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.openaiApiKey}` },
                body: JSON.stringify({
                    model: "gpt-4-turbo-preview",
                    messages,
                    max_tokens: 150,
                    temperature: 0.8,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const aiText = data.choices[0]?.message?.content?.trim();

            return {
                text: aiText || "(The opponent remains silent, observing.)",
                shouldBeVoice: false, // For now, RPG responses are text-only
                confidence: 0.9,
            };

        } catch (error) {
            console.error("🤖 RPG Response Error:", error);
            throw error;
        }
    }

    async chooseRpgBotAction(
        botProfile: BotProfile,
        botSideMission: SideMission | null,
        conversationHistory: RpgMessage[],
        availableActions: Action[]
    ): Promise<string> {
        if (!this.useOpenAI || !this.openaiApiKey) {
            return availableActions[Math.floor(Math.random() * availableActions.length)].tag;
        }

        const history = conversationHistory.map(msg => {
            const content = msg.type === 'voice' ? msg.transcribedText || '[Voice message]' : msg.content;
            return `${msg.senderName}: ${content}`;
        }).join('\n');
        
        const actionsString = availableActions.map(a => `"${a.tag}" (${a.label}): ${a.description}`).join('\n');

        const prompt = `You are role-playing as ${botProfile.name}.
Your Personality: ${botProfile.personality}
Your Secret Backstory: ${botProfile.secretBackstory}
Your Main Mission: ${botProfile.mainMission}
${botSideMission ? `Your Current Side Mission: "${botSideMission.description}" (You succeed if the other player's action has the tag: ${botSideMission.targetActionTag})` : ''}

Based on the conversation and your goals, which action is the most strategic choice?

Conversation:
${history}

Available Actions:
${actionsString}

Respond with ONLY the chosen action's tag (e.g., "emotion_mask").`;

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.openaiApiKey}` },
                body: JSON.stringify({
                    model: "gpt-4-turbo-preview",
                    messages: [{ role: "system", content: prompt }],
                    max_tokens: 20,
                    temperature: 0.5,
                }),
            });

            if (!response.ok) throw new Error(await response.text());
            
            const data = await response.json();
            const chosenTag = data.choices[0]?.message?.content.trim().replace(/"/g, '');

            if (availableActions.some(a => a.tag === chosenTag)) {
                return chosenTag;
            }
            return availableActions[Math.floor(Math.random() * availableActions.length)].tag;

        } catch (error) {
            console.error("Error choosing bot action:", error);
            return availableActions[Math.floor(Math.random() * availableActions.length)].tag;
        }
    }


    async scorePerformance(playerProfile: any, messages: RpgMessage[]): Promise<any> {
        const playerMessagesContent = messages
          .filter((msg) => msg.senderId === "player1")
          .map((msg) => msg.type === 'voice' ? msg.transcribedText || '' : msg.content)
          .join(" ")
          .trim();
    
        if (playerMessagesContent.length < 10) {
          return { roleConsistency: 0, emotionalExpression: 0, plotDriving: 0, totalScore: 0 };
        }
    
        if (!this.useOpenAI || !this.openaiApiKey) {
          console.error("OpenAI API not configured");
          return { roleConsistency: 0.5, emotionalExpression: 0.5, plotDriving: 0.5, totalScore: 1.5 };
        }
    
        const playerMessagesForPrompt = messages
          .filter((msg) => msg.senderId === "player1")
          .map((msg) => msg.type === 'voice' ? msg.transcribedText || '[Voice Message]' : msg.content)
          .join("\n- ");
    
        const prompt = `
          You are a dramatic role-playing game evaluator. Based on the following three criteria, rate the player's performance in the free dialogue on a scale of 0 to 1 for each:
          1. Role Consistency: Did they consistently embody their assigned role and personality?
          2. Emotional Expression: Was there emotional depth, variation, and vividness in their expression?
          3. Plot Advancement: Did they introduce new questions, elicit reactions, or advance the story?
    
          Player's Role:
          - Background: ${playerProfile.background}
          - Social Role: ${playerProfile.socialRole}
          - Personality: ${Array.isArray(playerProfile.personality) ? playerProfile.personality.join(", ") : playerProfile.personality}
    
          Here is the player's dialogue from all 3 rounds:
          - ${playerMessagesForPrompt}
    
          Please provide the output in the following JSON format ONLY:
          {
            "roleConsistency": <score_0_to_1>,
            "emotionalExpression": <score_0_to_1>,
            "plotDriving": <score_0_to_1>
          }
        `;
    
        try {
          const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.openaiApiKey}` },
              body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: prompt }],
                max_tokens: 100,
                temperature: 0.2,
              }),
            }
          );
    
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
          }
    
          const data = await response.json();
          const content = data.choices[0]?.message?.content;
          
          const scores = JSON.parse(content);
          const totalScore = scores.roleConsistency + scores.emotionalExpression + scores.plotDriving;
    
          return { ...scores, totalScore };
    
        } catch (error) {
          console.error("Error scoring performance:", error);
          throw error;
        }
      }
  
    async generateNarration(player1Action: Action, player2Action: Action, player1Profile: any, player2Profile: BotProfile, storyBackground: string, round: number, chatLog: RpgMessage[]): Promise<string> {
        if (!this.useOpenAI || !this.openaiApiKey) {
            return `The tension in the elevator shifts as you both make your move.`
        }

        const history = chatLog.map(msg => `${msg.senderName}: ${msg.content}`).join('\n');
        const prompt = `You are a narrator for a dramatic RPG. You will be given the actions of two players. Your task is to generate a dramatic "combined effect text" that describes the consequence of their interaction.

**Game Context:**
- **Story:** ${storyBackground}
- **Round:** ${round}
- **Player 1 (You) Profile:** ${player1Profile.socialRole}, ${Array.isArray(player1Profile.personality) ? player1Profile.personality.join(', ') : player1Profile.personality}
- **Player 2 (Opponent) Profile:** ${player2Profile.socialRole}, ${player2Profile.personality}
- **Player 1's Action:** "${player1Action.label}" (${player1Action.description})
- **Player 2's Action:** "${player2Action.label}" (${player2Action.description})
- **Recent Dialogue:**
${history}

**Your Task:**
Write a 1-2 sentence "Combined Effect Text" describing the result of these two actions colliding.
- **DO NOT** mention the players' names or their actions explicitly (e.g., "Player 1 chose...").
- **FOCUS ON** the result, the atmosphere, the shift in dynamics.

**Example Combined Effect Texts:**
- "A subtle gesture from one and a sharp question from the other sends a ripple of distrust through the small space. The air grows thick with unspoken accusations."
- "An attempt at connection is met with a cold, analytical gaze. It's clear that one of them is playing a very different game, and the other just fell a step behind."
- "The sudden aggression from one is deftly deflected by the other's feigned ignorance. The power dynamic hangs in the balance, a silent, tense stalemate."

**Combined Effect Text:**`

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.openaiApiKey}` },
                body: JSON.stringify({
                    model: "gpt-4-turbo-preview",
                    messages: [{ role: "system", content: prompt }],
                    max_tokens: 100,
                    temperature: 0.9,
                }),
            });
            if (!response.ok) throw new Error(await response.text());
            const data = await response.json();
            const narration = data.choices[0]?.message?.content.trim();
            return narration || `Your action and your opponent's action create a tense silence.`;
        } catch (error) {
             console.error("Error generating narration:", error);
             return `In response to your actions, the atmosphere in the elevator becomes palpably tense.`
        }
    }

    async chooseRpgBotFinalChoice(
        botProfile: BotProfile,
        conversationHistory: RpgMessage[],
        availableChoices: FinalChoiceOption[]
    ): Promise<string> {
        if (!this.useOpenAI || !this.openaiApiKey) {
            return availableChoices[Math.floor(Math.random() * availableChoices.length)].tag;
        }
    
        const history = conversationHistory.map(msg => {
            const content = msg.type === 'voice' ? msg.transcribedText || '[Voice message]' : msg.content;
            return `${msg.senderName}: ${content}`;
        }).join('\n');
    
        const choicesString = availableChoices.map(c => `"${c.tag}" (${c.label}): ${c.outcome}`).join('\n');
    
        const prompt = `You are role-playing as ${botProfile.name} at the climax of a story.
    
    **Your Identity & Mission:**
    - **Personality:** ${botProfile.personality}
    - **Secret Backstory:** ${botProfile.secretBackstory}
    - **Main Mission:** ${botProfile.mainMission}
    
    **Final Confrontation:**
    Based on the entire conversation and your secret mission, which final choice is the most strategic move to achieve your goal?
    
    **Conversation History:**
    ${history}
    
    **Available Final Choices:**
    ${choicesString}
    
    **Instructions:**
    Respond with ONLY the chosen final choice's tag (e.g., "accuse_zaibatsu"). Your choice should be the one that best helps you complete your main mission.`;
    
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.openaiApiKey}` },
                body: JSON.stringify({
                    model: "gpt-4-turbo-preview",
                    messages: [{ role: "system", content: prompt }],
                    max_tokens: 20,
                    temperature: 0.3, // Lower temperature for more deterministic strategic choice
                }),
            });
    
            if (!response.ok) throw new Error(await response.text());
    
            const data = await response.json();
            const chosenTag = data.choices[0]?.message?.content.trim().replace(/"/g, '');
    
            if (availableChoices.some(c => c.tag === chosenTag)) {
                return chosenTag;
            }
            // Fallback to a random choice if parsing fails or tag is invalid
            return availableChoices[Math.floor(Math.random() * availableChoices.length)].tag;
    
        } catch (error) {
            console.error("Error choosing bot's final choice:", error);
            // Fallback to a random choice on error
            return availableChoices[Math.floor(Math.random() * availableChoices.length)].tag;
        }
    }

}
// Export singleton instance
export const aiService = new AIService();
