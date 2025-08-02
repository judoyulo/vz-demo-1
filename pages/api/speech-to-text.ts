import type { NextApiRequest, NextApiResponse } from 'next';
import { Formidable } from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

// Disable Next.js's default body parser to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
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
    const form = new Formidable({});
    
    const data = await new Promise<{ files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Error parsing form data:', err);
          reject(err);
          return;
        }
        resolve({ files });
      });
    });

    const audioFile = data.files.file?.[0];

    if (!audioFile) {
      console.error('❌ No audio file was uploaded.');
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    console.log(`✅ File received: ${audioFile.originalFilename}, size: ${audioFile.size} bytes, path: ${audioFile.filepath}`);

    const forwardForm = new FormData();
    forwardForm.append('file', fs.createReadStream(audioFile.filepath), audioFile.originalFilename || 'audio.webm');
    forwardForm.append('model', 'whisper-1');

    console.log('📡 Forwarding request to OpenAI Whisper API...');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        ...forwardForm.getHeaders(),
      },
      body: forwardForm,
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
