import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { audioData } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    console.log('Received audio data, length:', audioData.length);

    // Convert base64 audio data to buffer
    const audioBuffer = Buffer.from(audioData, 'base64');
    console.log('Audio buffer size:', audioBuffer.length);

    // Use OpenAI Whisper API for speech-to-text
    const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Create boundary for multipart form data
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
    
    // Build multipart form data manually
    let formData = '';
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="file"; filename="audio.mp4"\r\n';
    formData += 'Content-Type: audio/mp4\r\n\r\n';
    
    // Add the audio buffer
    const audioPart = Buffer.concat([
      Buffer.from(formData, 'utf8'),
      audioBuffer,
      Buffer.from(`\r\n--${boundary}\r\n`, 'utf8'),
      Buffer.from('Content-Disposition: form-data; name="model"\r\n\r\n', 'utf8'),
      Buffer.from('whisper-1', 'utf8'),
      Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8')
    ]);

    console.log('Sending request to OpenAI Whisper API...');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': audioPart.length.toString(),
      },
      body: audioPart,
    });

    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return res.status(response.status).json({ error: 'Speech recognition failed' });
    }

    const result = await response.json();
    console.log('Speech recognition result:', result);

    res.status(200).json({ 
      text: result.text,
      success: true 
    });

  } catch (error) {
    console.error('Speech-to-text error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 