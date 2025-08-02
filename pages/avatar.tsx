import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import ModelViewer from "../components/ModelViewer";
import GlobalNav from '../components/GlobalNav';
import { 
  getPageContainerStyle, 
  getMainContainerStyle, 
  getButtonStyle,
  getTitleStyle,
  LAYOUT_CONFIG 
} from "../utils/layoutConfig";

type BackgroundOption = {
  label: string;
  description: string;
};

type ModularRole = {
  background: string | null;
  socialRole: string | null;
  personality: string | null;
};

const BACKGROUNDS: BackgroundOption[] = [
  {
    label: "Urban Shadow",
    description:
      "Raised in the city’s forgotten alleys. Knows the rhythm of neon nights and silent escapes.",
  },
  {
    label: "Desert Nomad",
    description:
      "Walked the sands since childhood. Speaks the language of storms and survival.",
  },
  {
    label: "Cyber Scholar",
    description:
      "Lives in libraries and server farms. Believes code can change the world.",
  },
  {
    label: "Sky Engineer",
    description:
      "Raised on a floating rig. Fixes broken wings and dreams alike.",
  },
];
const SOCIAL_ROLES = [
  "Detective",
  "Bounty Hunter",
  "Puppy",
  "Freshman Highschool",
];
const PERSONALITIES = ["Curious", "Aggressive", "Dreamy", "Playful"];

// Default name/bio
const DEFAULT_NAME = "Your Name";
const DEFAULT_BIO = "This is your bio. Tell others about yourself!";

export default function AvatarPage() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [role, setRole] = useState<ModularRole>({
    background: null,
    socialRole: null,
    personality: null,
  });

  const [bgPreview, setBgPreview] = useState<BackgroundOption | null>(null);
  const [rpmEvents, setRpmEvents] = useState<any[]>([]);

  const RPM_URL = "https://demo.readyplayer.me/avatar?frameApi=true&bodyType=fullbody&clearCache=true&quickStart=false";

  // Listen for Ready Player Me messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://demo.readyplayer.me') return;

      setRpmEvents(prev => [...prev, event.data]);
      console.log('📨 Raw message received:', event.data, 'from origin:', event.origin);

      // CRITICAL FIX: Check if the message data is a direct .glb URL string
      if (typeof event.data === 'string' && event.data.includes('readyplayer.me') && event.data.endsWith('.glb')) {
        console.log('🎉 Direct avatar URL received:', event.data);
        const avatarUrl = event.data;
        setAvatarUrl(avatarUrl);
        localStorage.setItem("avatarUrl", avatarUrl);
        router.push('/role');
        return; // Exit after successfully handling the URL
      }
      
      // If not a direct URL, proceed with JSON parsing for other events
      const json = parse(event);
      
      if (!json || json?.source !== 'readyplayerme') {
        console.log("Info: Received a non-RPM or non-URL message.");
        return;
      }
      
      console.log('✅ Parsed RPM JSON message:', json);
      
      if (json.eventName === 'v1.avatar.exported') {
        console.log('🎉 Ready Player Me avatar exported via JSON event:', json.data.url);
        const avatarUrl = json.data.url;
        if (avatarUrl) {
          setAvatarUrl(avatarUrl);
          localStorage.setItem("avatarUrl", avatarUrl);
          router.push('/role');
        }
      }
      
      if (json.eventName === 'v1.frame.ready') {
        console.log('🖼️ Ready Player Me frame ready');
      }
      
      if (json.eventName === 'v1.user.set') {
        console.log('👤 User avatar created/updated:', json);
      }
    };

    const parse = (event: MessageEvent) => {
      try {
        // Handle both string and object data
        if (typeof event.data === 'string') {
          return JSON.parse(event.data);
        }
        return event.data;
      } catch (error) {
        console.log('Parse error:', error, 'Data:', event.data);
        return null;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Paste from clipboard with improved error handling
  async function handlePasteFromClipboard() {
    try {
      console.log('🔗 Attempting to read from clipboard...');
      const text = await navigator.clipboard.readText();
      console.log('📋 Clipboard content:', text);
      
      const trimmedUrl = text.trim();
      
      // Check for various Ready Player Me URL patterns
      const isValidUrl = (
        (trimmedUrl.includes("readyplayer.me") || trimmedUrl.includes("models.readyplayer.me")) &&
        (trimmedUrl.endsWith(".glb") || trimmedUrl.includes(".glb"))
      ) || 
      // Also accept other 3D model formats as fallback
      (trimmedUrl.startsWith("https://") && 
       (trimmedUrl.endsWith(".glb") || trimmedUrl.endsWith(".gltf")));
      
      if (isValidUrl) {
        console.log('✅ Valid avatar URL found:', trimmedUrl);
        setAvatarUrl(trimmedUrl);
        localStorage.setItem("avatarUrl", trimmedUrl);
        router.push('/role');
        return;
      }
      
      // If no valid URL, try to prompt user for manual input
      const userInput = prompt(
        `🔗 No valid avatar link found in clipboard.\n\nClipboard content: "${trimmedUrl.substring(0, 100)}${trimmedUrl.length > 100 ? '...' : ''}"\n\nPlease paste your Ready Player Me avatar link (.glb URL):`
      );
      
      if (userInput) {
        const userUrl = userInput.trim();
        if ((userUrl.includes("readyplayer.me") || userUrl.startsWith("https://")) && 
            (userUrl.endsWith(".glb") || userUrl.endsWith(".gltf"))) {
          console.log('✅ Valid user-provided URL:', userUrl);
          setAvatarUrl(userUrl);
          localStorage.setItem("avatarUrl", userUrl);
          router.push('/role');
        } else {
          alert("❌ Invalid URL format. Please make sure it's a valid .glb or .gltf link.");
        }
      }
      
    } catch (err) {
      console.error('❌ Clipboard access error:', err);
      
      // Fallback: manual input
      const userInput = prompt(
        `🔗 Clipboard access failed.\n\nPlease manually paste your Ready Player Me avatar link (.glb URL):\n\nExample: https://models.readyplayer.me/[your-avatar-id].glb`
      );
      
      if (userInput) {
        const userUrl = userInput.trim();
        if ((userUrl.includes("readyplayer.me") || userUrl.startsWith("https://")) && 
            (userUrl.endsWith(".glb") || userUrl.endsWith(".gltf"))) {
          console.log('✅ Valid manually entered URL:', userUrl);
          setAvatarUrl(userUrl);
          localStorage.setItem("avatarUrl", userUrl);
          router.push('/role');
        } else {
          alert("❌ Invalid URL format. Please make sure it's a valid .glb or .gltf link.");
        }
      }
    }
  }

  // If avatarUrl exists, go to role step
  // useEffect(() => {
  //   if (avatarUrl) setStep("role");
  // }, [avatarUrl]);

  // Check if role is complete
  const roleComplete = role.background && role.socialRole && role.personality;

  // Responsive iframe style - optimized for Ready Player Me
  const iframeContainerStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 600,
    minWidth: 320,
    height: "700px", // Increased height for better display
    borderRadius: 20,
    overflow: "hidden",
    margin: "0 auto 24px",
    background: "#ffffff",
    boxShadow: "0 4px 24px 0 rgba(31,38,135,0.18)",
    position: "relative",
    border: "2px solid rgba(79,195,247,0.2)"
  };

  return (
    <div style={getPageContainerStyle()}>
      <GlobalNav />
      <div
        style={{
          ...getMainContainerStyle(),
          textAlign: "center",
        }}
      >

            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                marginBottom: 18,
                letterSpacing: 1,
              }}
            >
              🧍 Create Your Ready Player Me Avatar
            </h1>
            <div style={iframeContainerStyle}>
              <iframe
                ref={iframeRef}
                title="Ready Player Me"
                src={RPM_URL}
                allow="camera *; microphone *; clipboard-read *; clipboard-write *"
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  border: "none",
                  borderRadius: "16px",
                  background: "#fff"
                }}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
            

            {avatarUrl && (
              <div
                style={{
                  background: "rgba(44,52,80,0.7)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 13,
                  wordBreak: "break-all",
                  margin: "18px 0",
                }}
              >
                {avatarUrl}
              </div>
            )}

        {/* Background Preview Modal */}
        {bgPreview && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.45)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setBgPreview(null)}
          >
            <div
              style={{
                background: "#232b4d",
                borderRadius: 18,
                padding: "32px 28px",
                maxWidth: 340,
                width: "90vw",
                boxShadow: "0 8px 32px 0 rgba(31,38,135,0.37)",
                color: "#fff",
                textAlign: "center",
                position: "relative",
              }}
              onClick={e => e.stopPropagation()}
            >
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
                {bgPreview.label}
              </h3>
              <p style={{ fontSize: 15, opacity: 0.92, marginBottom: 24 }}>
                {bgPreview.description}
              </p>
              <button
                style={{
                  padding: "10px 28px",
                  background:
                    "linear-gradient(90deg, #4fc3f7 0%, #7b61ff 100%)",
                  border: "none",
                  borderRadius: 10,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  marginRight: 10,
                }}
                onClick={() => {
                  setRole(r => ({ ...r, background: bgPreview.label }));
                  setBgPreview(null);
                }}
              >
                Select
              </button>
              <button
                style={{
                  padding: "10px 18px",
                  background: "#222a",
                  border: "none",
                  borderRadius: 10,
                  color: "#fff",
                  fontWeight: 500,
                  fontSize: 15,
                  cursor: "pointer",
                }}
                onClick={() => setBgPreview(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      <div style={{ opacity: 0.25, fontSize: 13, marginTop: 12 }}>
        Powered by Ready Player Me
      </div>
    </div>
  );
}
