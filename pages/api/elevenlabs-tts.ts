import { NextApiRequest, NextApiResponse } from 'next';
import { getVoiceId } from '../../utils/voiceUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, voiceId: rawVoiceId } = req.body;

    if (!text || !rawVoiceId) {
      return res.status(400).json({ error: 'Text and voiceId are required' });
    }

    // 🔧 CRITICAL FIX: Map voice name to actual ElevenLabs voice ID
    const voiceId = getVoiceId(rawVoiceId);
    console.log('🔧 [DEPLOYMENT FIX] Voice mapping:', { 
      received: rawVoiceId, 
      mapped: voiceId,
      isCorrectFormat: voiceId.length > 10 && !voiceId.startsWith('elevenlabs-')
    });

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY || "sk_7dd57adca9fa825ffcd9dff1e997ca8996fc2ce975b9521f";
    if (!elevenLabsApiKey) {
      return res.status(500).json({ error: 'ElevenLabs API key not configured' });
    }

    console.log('🔊 ElevenLabs TTS request:', { text: text.substring(0, 50) + '...', voiceId });

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'ElevenLabs API error', 
        details: errorText 
      });
    }

    const audioBuffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength.toString());
    res.send(Buffer.from(audioBuffer));

  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 