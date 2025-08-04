// Browser detection utility
function isSafari(): boolean {
  const userAgent = navigator.userAgent;
  return userAgent.includes("Safari") && !userAgent.includes("Chrome");
}

// Get optimal MIME type for current browser
function getMimeTypeForBrowser(): string {
  if (isSafari()) {
    // Safari only supports MP4/AAC
    if (MediaRecorder.isTypeSupported("audio/mp4")) {
      return "audio/mp4";
    } else if (MediaRecorder.isTypeSupported("audio/mp4;codecs=mp4a.40.2")) {
      return "audio/mp4;codecs=mp4a.40.2"; // AAC-LC
    } else {
      return "audio/mp4"; // Fallback
    }
  } else {
    // Chrome/Firefox prefer WebM
    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
      return "audio/webm;codecs=opus";
    } else if (MediaRecorder.isTypeSupported("audio/webm")) {
      return "audio/webm";
    } else {
      return "audio/webm"; // Fallback
    }
  }
}

// Unified MediaRecorder utility for consistent audio recording across the app
export function createMediaRecorder(stream: MediaStream): MediaRecorder {
  const mimeType = getMimeTypeForBrowser();
  const browserType = isSafari() ? "Safari" : "Chrome/Firefox";
  
  console.log(`🎙️ [createMediaRecorder] Detected browser: ${browserType}`);
  console.log('🎙️ [createMediaRecorder] Using MIME type:', mimeType);
  
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    console.error(`❌ [createMediaRecorder] ${mimeType} not supported on ${browserType}!`);
    
    // Try fallback
    const fallbackMimeType = isSafari() ? "audio/mp4" : "audio/webm";
    if (MediaRecorder.isTypeSupported(fallbackMimeType)) {
      console.log(`⚠️ [createMediaRecorder] Using fallback: ${fallbackMimeType}`);
      return new MediaRecorder(stream, { mimeType: fallbackMimeType });
    } else {
      console.error(`❌ [createMediaRecorder] No supported audio format found on ${browserType}!`);
      throw new Error(`Audio recording not supported on ${browserType}. Please try a different browser.`);
    }
  }

  return new MediaRecorder(stream, { mimeType });
}

// Create audio blob with browser-appropriate format
export function createAudioBlob(chunks: Blob[]): Blob {
  console.log('🎵 [createAudioBlob] Creating blob with', chunks.length, 'chunks');
  
  // Use appropriate MIME type based on browser
  const mimeType = getMimeTypeForBrowser();
  const blob = new Blob(chunks, { type: mimeType });
  
  console.log('✅ [createAudioBlob] Blob created with type:', blob.type);
  console.log('✅ [createAudioBlob] Blob size:', blob.size, 'bytes');
  console.log('🌐 [createAudioBlob] Browser-appropriate format:', mimeType);
  
  return blob;
}