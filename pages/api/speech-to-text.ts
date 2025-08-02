import formidable, { File } from 'formidable';
import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI, APIError } from 'openai';

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

    const file = (files.file as File[])?.[0];

    if (!file) {
      console.error('❌ [speech-to-text] No file found in the "file" field.');
      return res.status(400).json({ error: 'No file uploaded. Make sure the file is sent under the "file" key.' });
    }

    console.log('✅ [speech-to-text] File received:', {
      path: file.filepath,
      name: file.originalFilename,
      type: file.mimetype,
      size: file.size,
    });

    try {
      console.log('📡 [speech-to-text] Creating transcription request for OpenAI Whisper...');
      
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(file.filepath),
        model: 'whisper-1',
      });
      
      console.log('✅ [speech-to-text] Transcription successful:', transcription.text);
      
      res.status(200).json({ text: transcription.text, success: true });

    } catch (apiError: any) {
      // Log the full error object for detailed debugging on the server
      console.error('💥 [speech-to-text] Full error from OpenAI API:', JSON.stringify(apiError, null, 2));
      
      let status = 500;
      let details = 'An unknown error occurred while calling the Whisper API.';

      if (apiError instanceof APIError) {
        status = apiError.status || 500;
        details = apiError.message || `OpenAI API error with status code ${status}`;
        console.error(`   - OpenAI APIError Details: Status=${status}, Message=${details}`);
      } else if (apiError instanceof Error) {
        details = apiError.message;
        console.error(`   - Generic Error Details: ${details}`);
      }

      res.status(status).json({
        error: 'Speech recognition failed',
        details: details,
      });
    } finally {
      // Cleanup the temporary file in both success and error cases
      fs.unlink(file.filepath, (unlinkErr) => {
        if (unlinkErr) {
          console.warn(`⚠️ [speech-to-text] Could not delete temporary file: ${file.filepath}`, unlinkErr);
        } else {
          console.log(`🗑️ [speech-to-text] Temporary file deleted: ${file.filepath}`);
        }
      });
    }
  });
}
