import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const form = new IncomingForm();
    
    const [fields, files] = await form.parse(req);
    
    const audioFile = (files.file as File[])[0];

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    console.log('Received audio file:', audioFile.originalFilename, 'Size:', audioFile.size);

    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioFile.filepath), audioFile.originalFilename || 'audio.mp4');
    formData.append('model', 'whisper-1');
    
    console.log('Sending request to OpenAI Whisper API...');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        ...formData.getHeaders(),
      },
      body: formData,
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
      text: (result as any).text,
      success: true 
    });

  } catch (error) {
    console.error('Speech-to-text error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
