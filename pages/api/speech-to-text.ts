import type { NextApiRequest, NextApiResponse } from 'next';
import FormData from 'form-data';
import axios from 'axios';

// Increase the body size limit for this specific API route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

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
    
    const audioBuffer = Buffer.from(audioData, 'base64');
    console.log(`Audio buffer created, size: ${audioBuffer.length} bytes.`);
    
    const fileExtension = mimeType.split('/')[1].split(';')[0] || 'webm';
    const fileName = `audio.${fileExtension}`;

    const form = new FormData();
    form.append('file', audioBuffer, fileName);
    form.append('model', 'whisper-1');

    console.log(`📡 Forwarding request to OpenAI Whisper API as ${fileName}...`);

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      form,
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          ...form.getHeaders(),
        },
        maxBodyLength: Infinity,
      }
    );
    
    console.log('✅ Transcription successful:', response.data.text);
    res.status(200).json({
      text: response.data.text,
      success: true,
    });

  } catch (error: any) {
    console.error('💥 An unexpected error occurred in speech-to-text handler:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const details = error.response?.data?.error?.message || 'An unknown error occurred during processing.';
    
    res.status(status).json({
      error: 'Internal server error',
      details: details,
    });
  }
}
