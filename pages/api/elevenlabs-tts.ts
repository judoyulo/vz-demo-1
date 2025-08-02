import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, voiceId } = req.body;

    if (!text || !voiceId) {
      console.error('❌ [elevenlabs-tts] "text" and "voiceId" are required. Received:', req.body);
      return res.status(400).json({ error: 'Text and voiceId are required' });
    }

    // Explicitly check for the API key from environment variables.
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsApiKey) {
      console.error('❌ [elevenlabs-tts] Server configuration error: ELEVENLABS_API_KEY is not set.');
      return res.status(500).json({ error: 'ElevenLabs API key not configured' });
    }

    console.log(`🔊 [elevenlabs-tts] Requesting TTS from ElevenLabs for voiceId: ${voiceId}`);

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
      console.error(`❌ [elevenlabs-tts] ElevenLabs API error. Status: ${response.status}. Details: ${errorText}`);
      return res.status(response.status).json({ 
        error: 'Failed to generate speech from ElevenLabs', 
        details: errorText 
      });
    }

    console.log(`✅ [elevenlabs-tts] Successfully received audio stream from ElevenLabs.`);
    
    const audioBuffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength.toString());
    res.send(Buffer.from(audioBuffer));

  } catch (error: any) {
    console.error('💥 [elevenlabs-tts] An unexpected internal error occurred:', error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
