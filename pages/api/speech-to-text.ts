import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs';
import path from 'path';
import os from 'os';
import ffmpeg from 'fluent-ffmpeg';

// Disable Next.js's default bodyParser to allow formidable to parse multipart data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Check if FFmpeg is available
function checkFFmpegAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    ffmpeg.getAvailableFormats((err, formats) => {
      if (err) {
        console.log('❌ [checkFFmpegAvailable] FFmpeg not available:', err.message);
        resolve(false);
      } else {
        console.log('✅ [checkFFmpegAvailable] FFmpeg is available');
        resolve(true);
      }
    });
  });
}

// Convert MP4 to WAV for OpenAI Whisper compatibility
function convertMp4ToWav(inputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(os.tmpdir(), `converted_${Date.now()}.wav`);
    
    console.log('🔄 [convertMp4ToWav] Converting MP4 to WAV...');
    console.log('🔄 Input:', inputPath);
    console.log('🔄 Output:', outputPath);
    
    ffmpeg(inputPath)
      .toFormat('wav')
      .audioCodec('pcm_s16le') // 16-bit PCM
      .audioChannels(1) // Mono
      .audioFrequency(16000) // 16kHz sample rate (optimal for speech)
      .on('start', (commandLine) => {
        console.log('🔄 [convertMp4ToWav] FFmpeg command:', commandLine);
      })
      .on('stderr', (stderrLine) => {
        console.log('🔄 [convertMp4ToWav] FFmpeg stderr:', stderrLine);
      })
      .on('end', () => {
        console.log('✅ [convertMp4ToWav] Conversion completed');
        resolve(outputPath);
      })
      .on('error', (error) => {
        console.error('❌ [convertMp4ToWav] Conversion failed:', error);
        console.error('❌ [convertMp4ToWav] Error message:', error.message);
        reject(error);
      })
      .save(outputPath);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🎙️ [speech-to-text] Request received');
  console.log('📋 Method:', req.method);
  console.log('📋 Content-Type:', req.headers['content-type']);
  console.log('📋 Content-Length:', req.headers['content-length']);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
    console.error('❌ [speech-to-text] OpenAI API key not found in environment variables.');
    return res.status(500).json({ error: 'Server configuration error: Missing API key.' });
  }
  
  console.log('✅ [speech-to-text] OpenAI API key loaded successfully.');

  const contentType = req.headers['content-type'] || '';

  try {
    if (contentType.includes('multipart/form-data')) {
      console.log('🔄 [speech-to-text] Processing FormData upload...');
      await handleFormDataUpload(req, res, openaiApiKey);
    } else if (contentType.includes('application/json')) {
      console.log('🔄 [speech-to-text] Processing JSON upload...');
      await handleJsonUpload(req, res, openaiApiKey);
    } else {
      console.error('❌ [speech-to-text] Unsupported content type:', contentType);
      return res.status(400).json({ 
        error: 'Unsupported content type. Expected multipart/form-data or application/json.',
        received: contentType
      });
    }
  } catch (error: any) {
    console.error('💥 [speech-to-text] Unexpected error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message || 'An unknown error occurred'
    });
  }
}

async function handleFormDataUpload(req: NextApiRequest, res: NextApiResponse, openaiApiKey: string) {
  const form = formidable({
    maxFileSize: 25 * 1024 * 1024, // 25MB limit
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ [speech-to-text] Error parsing FormData:', err);
      return res.status(400).json({ error: 'Failed to parse form data.', details: err.message });
    }

                      const file = (files.file as File[])?.[0];

    if (!file) {
      console.error('❌ [speech-to-text] No file found in FormData');
      return res.status(400).json({ error: 'No file uploaded. Make sure the file is sent under the "file" key.' });
    }

                      console.log('🎧 [speech-to-text] File received:');
                  console.log('• name:', file.originalFilename);
                  console.log('• mimetype:', file.mimetype);
                  console.log('• size:', file.size, 'bytes');
                  console.log('• path:', file.filepath);
                  console.log('📦 Received file mimetype:', file.mimetype);
                  
    if (!file.size || file.size === 0) {
      console.error('❌ [speech-to-text] File is empty');
      return res.status(400).json({ error: 'Uploaded file is empty' });
    }

    let finalFilePath = file.filepath; // Define outside try block for cleanup
    
    try {
      let finalFilename = file.originalFilename || 'voice.webm';
      let finalMimetype = file.mimetype || 'audio/webm';

      // Check if we need to convert MP4 to WAV for Safari compatibility
      if (file.mimetype && file.mimetype.includes('mp4')) {
        console.log('🍎 [speech-to-text] Safari MP4 detected, checking conversion options...');
        
        // Check if FFmpeg is available for conversion
        const ffmpegAvailable = await checkFFmpegAvailable();
        
        if (ffmpegAvailable) {
          console.log('🔄 [speech-to-text] FFmpeg available, converting MP4 to WAV...');
          try {
            finalFilePath = await convertMp4ToWav(file.filepath);
            finalFilename = 'converted_voice.wav';
            finalMimetype = 'audio/wav';
            console.log('✅ [speech-to-text] MP4 to WAV conversion successful');
          } catch (conversionError) {
            console.error('❌ [speech-to-text] MP4 conversion failed:', conversionError);
            return res.status(500).json({ 
              error: 'Audio format conversion failed', 
              details: `FFmpeg conversion error: ${conversionError.message}. Please try using Chrome or Firefox for better compatibility.` 
            });
          }
        } else {
          // Try to send MP4 directly to OpenAI (sometimes it works)
          console.log('⚠️ [speech-to-text] FFmpeg not available, attempting direct MP4 upload to OpenAI...');
          console.log('⚠️ [speech-to-text] This may fail - recommend installing FFmpeg for better Safari support');
          // Keep original file and try direct upload
          finalFilename = 'safari_voice.mp4';
          finalMimetype = 'audio/mp4';
        }
      }

      const formData = new FormData();
      const fileStream = fs.createReadStream(finalFilePath);
      const blob = new Blob([fs.readFileSync(finalFilePath)], { type: finalMimetype });
      
      formData.append('file', blob, finalFilename);
      formData.append('model', 'whisper-1');

      console.log('📡 [speech-to-text] Sending FormData to OpenAI Whisper...');
      console.log('📡 [speech-to-text] Final file format:', finalMimetype);

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('❌ [speech-to-text] OpenAI API error:', responseData);
        return res.status(response.status).json({ 
          error: 'Speech recognition failed', 
          details: responseData.error?.message || 'Unknown error from OpenAI' 
        });
      }

      console.log('✅ [speech-to-text] Transcription successful:', responseData.text);

      res.status(200).json({ 
        text: responseData.text,
        success: true 
      });

    } catch (apiError: any) {
      console.error('💥 [speech-to-text] API call error:', apiError);
      res.status(500).json({
        error: 'Failed to process audio',
        details: apiError.message
      });
    } finally {
      // Clean up original temp file
      fs.unlink(file.filepath, (unlinkErr) => {
        if (unlinkErr) {
          console.warn(`⚠️ [speech-to-text] Could not delete original temp file: ${file.filepath}`, unlinkErr);
        } else {
          console.log(`🗑️ [speech-to-text] Original temp file deleted: ${file.filepath}`);
        }
      });

      // Clean up converted file if it exists and is different from original
      if (finalFilePath !== file.filepath) {
        fs.unlink(finalFilePath, (unlinkErr) => {
          if (unlinkErr) {
            console.warn(`⚠️ [speech-to-text] Could not delete converted temp file: ${finalFilePath}`, unlinkErr);
          } else {
            console.log(`🗑️ [speech-to-text] Converted temp file deleted: ${finalFilePath}`);
          }
        });
      }
    }
  });
}

async function handleJsonUpload(req: NextApiRequest, res: NextApiResponse, openaiApiKey: string) {
  // Parse JSON body manually since we disabled bodyParser
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { audioData } = JSON.parse(body);

      if (!audioData) {
        console.error('❌ [speech-to-text] No audioData in JSON body');
        return res.status(400).json({ error: 'Audio data is required' });
      }

      console.log('✅ [speech-to-text] JSON audioData received, length:', audioData.length);

      const audioBuffer = Buffer.from(audioData, 'base64');
      console.log(`📊 [speech-to-text] Audio buffer created, size: ${audioBuffer.length} bytes`);

      if (audioBuffer.length === 0) {
        console.error('❌ [speech-to-text] Audio buffer is empty');
        return res.status(400).json({ error: 'Audio data is empty' });
      }

      const formData = new FormData();
      const blob = new Blob([audioBuffer], { type: 'audio/webm' });
      formData.append('file', blob, 'audio.webm');
      formData.append('model', 'whisper-1');

      console.log('📡 [speech-to-text] Sending JSON-converted data to OpenAI Whisper...');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('❌ [speech-to-text] OpenAI API error:', responseData);
        return res.status(response.status).json({ 
          error: 'Speech recognition failed', 
          details: responseData.error?.message || 'Unknown error from OpenAI' 
        });
      }

      console.log('✅ [speech-to-text] Transcription successful:', responseData.text);

      res.status(200).json({ 
        text: responseData.text,
        success: true 
      });

    } catch (parseError: any) {
      console.error('❌ [speech-to-text] JSON parsing error:', parseError);
      res.status(400).json({
        error: 'Invalid JSON body',
        details: parseError.message
      });
    }
  });
}