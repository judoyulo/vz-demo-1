// Unified speech-to-text utility function
export async function uploadSpeechToText(audioBlob: Blob): Promise<string> {
  console.log('🎙️ [uploadSpeechToText] Starting upload...');
  console.log('📊 Audio blob:', audioBlob.size, 'bytes, type:', audioBlob.type);

  // Create FormData for file upload
  const formData = new FormData();
  formData.append('file', audioBlob, 'voice.webm');

  console.log('📡 [uploadSpeechToText] Sending to /api/speech-to-text...');

  const response = await fetch('/api/speech-to-text', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ [uploadSpeechToText] API error:', errorData);
    throw new Error(`Speech-to-text failed: ${errorData.error || errorData.details || 'Unknown error'}`);
  }

  const result = await response.json();
  console.log('✅ [uploadSpeechToText] Success:', result.text);
  return result.text;
}