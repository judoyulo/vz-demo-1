import type { NextApiRequest, NextApiResponse } from 'next';
import FormData from 'form-data';
import axios from 'axios';

// Increase body size limit and ensure we're using the JSON body parser.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Step 1: Check Method
  console.log(`[speech-to-text] Received request with method: ${req.method}`);
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Step 2: Log Headers and Body Content
  console.log(`[speech-to-text] Content-Type Header: ${req.headers['content-type']}`);
  
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    console.error('❌ [speech-to-text] OpenAI API key not configured on the server.');
    return res.status(500).json({ error: 'Server configuration error: Missing API key.' });
  }
  console.log('✅ [speech-to-text] OpenAI API key loaded.');

  try {
    const { audioData, mimeType } = req.body;

    if (!audioData) {
      console.error('❌ [speech-to-text] Request body is missing "audioData".');
      return res.status(400).json({ error: 'Audio data (base64) is required.' });
    }
    if (!mimeType) {
      console.error('❌ [speech-to-text] Request body is missing "mimeType".');
      return res.status(400).json({ error: 'MIME type is required.' });
    }

    console.log(`✅ [speech-to-text] Received audio data. MimeType: ${mimeType}, Base64 Length: ${audioData.length}`);
    
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioData, 'base64');
    console.log(`✅ [speech-to-text] Audio buffer created, size: ${audioBuffer.length} bytes.`);
    
    const fileExtension = mimeType.split('/')[1]?.split(';')[0] || 'webm';
    const fileName = `audio.${fileExtension}`;

    // Step 3: Construct FormData for OpenAI
    const form = new FormData();
    form.append('file', audioBuffer, fileName);
    form.append('model', 'whisper-1');

    console.log(`📡 [speech-to-text] Forwarding request to OpenAI Whisper API as "${fileName}"...`);

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
    
    console.log('✅ [speech-to-text] Transcription successful:', response.data.text);
    res.status(200).json({
      text: response.data.text,
      success: true,
    });

  } catch (error: any) {
    console.error('💥 [speech-to-text] An unexpected error occurred:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const details = error.response?.data?.error?.message || 'An unknown error occurred during processing.';
    
    res.status(status).json({
      error: 'Internal server error',
      details: details,
    });
  }
}
