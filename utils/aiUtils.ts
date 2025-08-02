import { UserProfile, ChatMessage } from "../types";
import { aiService, AIResponse } from "../lib/aiService";

export const generateAIResponse = async (
  userProfile: UserProfile, 
  userMessage: string, 
  conversationHistory: ChatMessage[]
): Promise<string> => {
  try {
    // Use the user's name as personalityId
    const personalityId = userProfile.name.toLowerCase();
    const response: AIResponse = await aiService.generateResponse(
      personalityId,
      userMessage,
      conversationHistory,
      userProfile
    );
    return response.text;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I'm having trouble responding right now. Can we try again?";
  }
};
