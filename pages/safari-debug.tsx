import React, { useState } from 'react';
import { playAudioWithContext, speakWithElevenLabs } from '../utils/voiceUtils';

export default function SafariDebug() {
  const [testResult, setTestResult] = useState<string>('Ready to test Safari AudioContext');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [systemInfo, setSystemInfo] = useState<any>({});

  const collectSystemInfo = () => {
    const info = {
      userAgent: navigator.userAgent,
      isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
      audioContextSupport: !!(window.AudioContext || (window as any).webkitAudioContext),
      mediaDevices: !!navigator.mediaDevices,
      screen: `${screen.width}x${screen.height}`,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
    setSystemInfo(info);
    return info;
  };

  const testGenerateAudio = async () => {
    setIsGenerating(true);
    setTestResult('🎤 Generating test audio with ElevenLabs...');
    
    try {
      console.log("🧪 [Safari Debug] Starting audio generation...");
      const url = await speakWithElevenLabs(
        "Safari ultimate test. If you can hear this, AudioContext is working perfectly.",
        "9BWtsMINqrJLrRacOk9x", // Aria voice
        false // Don't autoplay
      );
      
      setAudioUrl(url);
      setTestResult('✅ Audio generated! Now test AudioContext playback.');
      console.log("🧪 [Safari Debug] Audio URL:", url);
    } catch (error) {
      setTestResult(`❌ Audio generation failed: ${error}`);
      console.error("🧪 [Safari Debug] Generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const testAudioContext = async () => {
    if (!audioUrl) {
      setTestResult('❌ Please generate audio first');
      return;
    }
    
    console.log("🧪 [Safari Debug] === STARTING AUDIOCONTEXT TEST ===");
    setTestResult('🍎 Testing AudioContext with detailed Safari debugging...');
    
    // Collect system info
    const info = collectSystemInfo();
    console.log("🧪 [Safari Debug] System info:", info);
    
    try {
      console.log("🧪 [Safari Debug] Calling playAudioWithContext...");
      await playAudioWithContext(audioUrl);
      setTestResult('🎉 SUCCESS! AudioContext playback completed. Check console for details.');
      console.log("🧪 [Safari Debug] === TEST COMPLETED SUCCESSFULLY ===");
    } catch (error) {
      setTestResult(`❌ AudioContext test failed: ${error}`);
      console.error("🧪 [Safari Debug] === TEST FAILED ===", error);
    }
  };

  const testSystemPermissions = async () => {
    setTestResult('🔍 Testing system permissions and audio capabilities...');
    
    try {
      // Test AudioContext creation
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        setTestResult('❌ AudioContext not supported');
        return;
      }
      
      const ctx = new AudioContextClass();
      const info = {
        state: ctx.state,
        sampleRate: ctx.sampleRate,
        maxChannels: ctx.destination.maxChannelCount,
        baseLatency: ctx.baseLatency || 'unknown'
      };
      
      // Test media devices
      let mediaPermission = 'unknown';
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaPermission = 'granted';
        stream.getTracks().forEach(track => track.stop());
      } catch (e) {
        mediaPermission = 'denied or unavailable';
      }
      
      ctx.close();
      
      setTestResult(`📊 System Test Results:
AudioContext: ✅ Available
State: ${info.state}
Sample Rate: ${info.sampleRate}Hz
Max Channels: ${info.maxChannels}
Media Permission: ${mediaPermission}
Safari: ${/safari/i.test(navigator.userAgent) ? '✅' : '❌'}
Mobile: ${/mobile/i.test(navigator.userAgent) ? '✅' : '❌'}`);
      
    } catch (error) {
      setTestResult(`❌ System test failed: ${error}`);
    }
  };

  React.useEffect(() => {
    collectSystemInfo();
  }, []);

  return (
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
      minHeight: '100vh',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1>🍎 Safari AudioContext Ultimate Debug</h1>
      
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3>🔍 System Information</h3>
        <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
          <p>Safari: {systemInfo.isSafari ? '✅ Yes' : '❌ No'}</p>
          <p>AudioContext: {systemInfo.audioContextSupport ? '✅ Supported' : '❌ Not supported'}</p>
          <p>Platform: {systemInfo.platform}</p>
          <p>Screen: {systemInfo.screen}</p>
          <p>User Agent: <br/><span style={{ fontSize: '12px' }}>{systemInfo.userAgent}</span></p>
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3>🧪 Test Controls</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={testSystemPermissions}
            style={{
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              padding: '12px 20px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🔍 Test System
          </button>
          
          <button
            onClick={testGenerateAudio}
            disabled={isGenerating}
            style={{
              background: isGenerating ? '#666' : 'linear-gradient(90deg, #4fc3f7 0%, #7b61ff 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              padding: '12px 20px',
              fontSize: '14px',
              cursor: isGenerating ? 'not-allowed' : 'pointer'
            }}
          >
            {isGenerating ? '⏳ Generating...' : '🎤 Generate Audio'}
          </button>

          <button
            onClick={testAudioContext}
            disabled={!audioUrl}
            style={{
              background: audioUrl ? 'linear-gradient(90deg, #ff6b35 0%, #f7931e 100%)' : '#666',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              padding: '12px 20px',
              fontSize: '14px',
              cursor: audioUrl ? 'pointer' : 'not-allowed'
            }}
          >
            🍎 Test AudioContext
          </button>
        </div>
      </div>

      <div style={{
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '12px',
        padding: '20px'
      }}>
        <h3>📋 Test Results</h3>
        <pre style={{
          background: 'rgba(0,0,0,0.3)',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '13px',
          lineHeight: '1.4',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          {testResult}
        </pre>
      </div>

      <div style={{
        background: 'rgba(255,193,7,0.1)',
        border: '1px solid rgba(255,193,7,0.3)',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px'
      }}>
        <h4>🍎 Safari Debug Instructions</h4>
        <ol style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <li>Open Safari Developer Tools (⌘⌥I)</li>
          <li>Go to Console tab</li>
          <li>Click "Test System" to verify AudioContext support</li>
          <li>Click "Generate Audio" to create test audio</li>
          <li>Click "Test AudioContext" and watch console for detailed logs</li>
          <li>Look for 🍎 [AudioContext] logs to see exactly what happens</li>
          <li>Check if you see "PLAYBACK COMPLETED SUCCESSFULLY!" message</li>
        </ol>
      </div>
    </div>
  );
}