import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { audioData } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      console.error('❌ OpenAI API key not found in environment variables.');
      return res.status(500).json({ error: 'Server configuration error: Missing API key.' });
    }
    
    console.log('✅ OpenAI API key loaded successfully.');

    const audioBuffer = Buffer.from(audioData, 'base64');
    console.log(`Audio buffer created, size: ${audioBuffer.length} bytes.`);

    const boundary = `boundary-${Date.now().toString(16)}`;
    
    const body = new FormData();
    body.append('file', new Blob([audioBuffer]), 'audio.webm');
    body.append('model', 'whisper-1');

    console.log('Sending transcription request to OpenAI Whisper API...');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: body,
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', responseData);
      return res.status(response.status).json({ 
        error: 'Speech recognition failed', 
        details: responseData.error?.message || 'Unknown error from OpenAI' 
      });
    }

    console.log('Speech recognition successful, text:', responseData.text);

    res.status(200).json({ 
      text: responseData.text,
      success: true 
    });

  } catch (error: any) {
    console.error('An unexpected error occurred in speech-to-text:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message || 'An unknown error occurred'
    });
  }
}
