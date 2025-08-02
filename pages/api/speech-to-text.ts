import formidable, { File } from 'formidable';
import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

// Disable Next.js's default bodyParser to allow formidable to parse the stream
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
    console.error('❌ [speech-to-text] OpenAI API key not configured on the server.');
    return res.status(500).json({ error: 'Server configuration error: Missing API key.' });
  }
  
  const openai = new OpenAI({ apiKey: openaiApiKey });

  const form = formidable({});

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ [speech-to-text] Error parsing form data:', err);
      return res.status(400).json({ error: 'Failed to parse form data.', details: err.message });
    }

    // formidable nests files in an array, even for a single upload
    const file = (files.file as File[])?.[0];

    if (!file) {
      console.error('❌ [speech-to-text] No file found in the "file" field.');
      return res.status(400).json({ error: 'No file uploaded. Make sure the file is sent under the "file" key.' });
    }

    console.log('✅ [speech-to-text] File received:');
    console.log(`   - Path: ${file.filepath}`);
    console.log(`   - Original Name: ${file.originalFilename}`);
    console.log(`   - MIME Type: ${file.mimetype}`);
    console.log(`   - Size: ${file.size} bytes`);

    try {
      console.log('📡 [speech-to-text] Creating transcription request for OpenAI Whisper...');
      
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(file.filepath),
        model: 'whisper-1',
      });
      
      console.log('✅ [speech-to-text] Transcription successful:', transcription.text);

      // Cleanup the temporary file
      fs.unlink(file.filepath, (unlinkErr) => {
        if (unlinkErr) {
          console.warn(`⚠️ [speech-to-text] Could not delete temporary file: ${file.filepath}`, unlinkErr);
        } else {
          console.log(`🗑️ [speech-to-text] Temporary file deleted: ${file.filepath}`);
        }
      });
      
      res.status(200).json({ text: transcription.text, success: true });

    } catch (apiError: any) {
      console.error('💥 [speech-to-text] OpenAI API error:', apiError.response?.data || apiError.message);
      const status = apiError.response?.status || 500;
      const details = apiError.response?.data?.error?.message || 'Error calling Whisper API.';
      
      res.status(status).json({
        error: 'Speech recognition failed',
        details: details,
      });
    }
  });
}
