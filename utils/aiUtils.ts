import { UserProfile, ChatMessage } from "../types";

export const generateAIResponse = async (
  userProfile: UserProfile, 
  userMessage: string, 
  conversationHistory: ChatMessage[]
): Promise<string> => {
  try {
    // Use backend API for AI response generation
    console.log('🤖 Using backend API for AI response generation');
    
    // Convert chat history to the format expected by backend
    const formattedHistory = conversationHistory.map(msg => ({
      role: msg.senderId === "current" ? "user" : "assistant",
      content: msg.content
    })).slice(-10); // Keep last 10 messages for context
    
    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        personality: userProfile.name,
        conversationHistory: formattedHistory
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ AI response generated via backend API');
      return result.response;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Backend AI API failed');
    }
  } catch (error) {
    console.error('Error generating AI response via backend:', error);
    // Fallback response
    const fallbackResponses = [
      "I'm having trouble responding right now. Can we try again?",
      "Sorry, I'm experiencing some technical difficulties. Let's continue our conversation in a moment.",
      "My AI processing is temporarily unavailable. Please try again shortly."
    ];
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
};
