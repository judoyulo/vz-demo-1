import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Parse the uploaded file
    const form = formidable({
      maxFileSize: 25 * 1024 * 1024, // 25MB limit
    });

    const [fields, files] = await form.parse(req);
    const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('🎤 Processing speech-to-text for file:', audioFile.originalFilename, 'size:', audioFile.size);

    // Read the audio file
    const audioBuffer = fs.readFileSync(audioFile.filepath);

    // Create FormData for OpenAI API
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer], { type: audioFile.mimetype || 'audio/mp4' }), audioFile.originalFilename || 'audio.mp4');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI Whisper API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Speech-to-text successful:', result.text.substring(0, 100) + '...');

    // Clean up temporary file
    fs.unlinkSync(audioFile.filepath);

    return res.status(200).json({ 
      success: true, 
      text: result.text 
    });

  } catch (error: any) {
    console.error('❌ Speech-to-text error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Speech-to-text processing failed' 
    });
  }
}