import type { NextApiRequest, NextApiResponse } from 'next';

interface AIRequest {
  message: string;
  personality?: string;
  conversationHistory?: any[];
}

interface AIResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AIResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { message, personality, conversationHistory }: AIRequest = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // 从服务器端环境变量获取API密钥 (不会暴露到前端)
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;

    console.log('🤖 AI Chat API called:', { 
      messageLength: message.length, 
      personality,
      hasOpenAI: !!openaiApiKey,
      hasHuggingFace: !!huggingfaceApiKey
    });

    // 优先使用OpenAI
    if (openaiApiKey) {
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: personality ? `${personality}\n\nYou are in an intense RPG scenario. Stay completely in character. Your responses should reflect your character's background, personality, and current mission. Be authentic and don't break character. Keep responses casual, conversational, and natural - speak like a real person in a tense situation.` : 'You are a helpful AI assistant.'
              },
              ...conversationHistory || [],
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: 400,
            temperature: 0.9
          })
        });

        if (openaiResponse.ok) {
          const data = await openaiResponse.json();
          const aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
          console.log('✅ OpenAI response generated');
          return res.status(200).json({ success: true, response: aiResponse });
        } else {
          console.error('❌ OpenAI API error:', openaiResponse.status);
        }
      } catch (error) {
        console.error('❌ OpenAI error:', error);
      }
    }

    // 回退到HuggingFace
    if (huggingfaceApiKey) {
      try {
        const hfResponse = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${huggingfaceApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: message,
            parameters: {
              max_length: 100,
              do_sample: true,
              temperature: 0.7
            }
          })
        });

        if (hfResponse.ok) {
          const data = await hfResponse.json();
          const aiResponse = data[0]?.generated_text || 'Hello! How can I help you today?';
          console.log('✅ HuggingFace response generated');
          return res.status(200).json({ success: true, response: aiResponse });
        } else {
          console.error('❌ HuggingFace API error:', hfResponse.status);
        }
      } catch (error) {
        console.error('❌ HuggingFace error:', error);
      }
    }

    // 如果所有API都失败，返回模拟响应
    console.log('⚠️ Using fallback mock response');
    const mockResponses = [
      "That's interesting! Tell me more about that.",
      "I understand what you're saying. How does that make you feel?", 
      "That's a great point. What do you think we should do about it?",
      "I appreciate you sharing that with me. What's your next step?",
      "Thanks for letting me know. Is there anything else you'd like to discuss?"
    ];
    
    const mockResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    return res.status(200).json({ success: true, response: mockResponse });

  } catch (error) {
    console.error('❌ AI Chat API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to generate AI response' 
    });
  }
}