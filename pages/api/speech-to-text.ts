import type { NextApiRequest, NextApiResponse } from 'next';
import FormData from 'form-data';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    console.error('❌ OpenAI API key not configured on the server.');
    return res.status(500).json({ error: 'Server configuration error: Missing API key.' });
  }
  console.log('✅ OpenAI API key loaded.');

  try {
    const { audioData, mimeType } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'Audio data (base64) is required.' });
    }
    if (!mimeType) {
      return res.status(400).json({ error: 'MIME type is required.' });
    }

    console.log(`Received audio data. MimeType: ${mimeType}, Base64 Length: ${audioData.length}`);
    
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioData, 'base64');
    console.log(`Audio buffer created, size: ${audioBuffer.length} bytes.`);
    
    const fileExtension = mimeType.split('/')[1].split(';')[0] || 'webm';
    const fileName = `audio.${fileExtension}`;

    const form = new FormData();
    form.append('file', audioBuffer, {
      filename: fileName,
      contentType: mimeType,
    });
    form.append('model', 'whisper-1');

    console.log(`📡 Forwarding request to OpenAI Whisper API as ${fileName}...`);

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('❌ OpenAI API Error:', responseData);
      return res.status(response.status).json({
        error: 'Speech recognition failed.',
        details: responseData.error?.message || 'Unknown error from OpenAI.',
      });
    }

    console.log('✅ Transcription successful:', responseData.text);
    res.status(200).json({
      text: responseData.text,
      success: true,
    });

  } catch (error: any) {
    console.error('💥 An unexpected error occurred in speech-to-text handler:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message || 'An unknown error occurred during processing.',
    });
  }
}
