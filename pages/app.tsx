import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import ModelViewer from "@/components/ModelViewer";
import AppHeader from "../components/AppHeader";
import TabNavigation from "../components/TabNavigation";
import ProfileCard from "../components/ProfileCard";
import ChatList from "@/components/ChatList";
import GlobalNav from "../components/GlobalNav";
import ErrorBoundary from "../components/ErrorBoundary";
import { MOCK_USERS } from "../data/mockUsers";
import { UserProfile, Notification, Chat, ChatMessage } from "../types";
import {
  generateVoiceIntroText,
  generateMoodVoiceText,
  formatTimeAgo,
} from "../utils/helpers";
import { speakWithElevenLabs, playUserVoice } from "../utils/voiceUtils";
import { generateAIResponse } from "../utils/aiUtils";
import { 
  getPageContainerStyle, 
  getMainContainerStyle, 
  getModalStyle,
  getButtonStyle,
  LAYOUT_CONFIG 
} from "../utils/layoutConfig";

export default function App() {
  console.log('App component rendering...');
  
  const router = useRouter();

  // State management
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"profiles" | "chats">("profiles");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [chatMessageText, setChatMessageText] = useState("");
  const [isGeneratingAIResponse, setIsGeneratingAIResponse] = useState(false);

  // Interaction states
  const [thumbsClicked, setThumbsClicked] = useState<Record<string, boolean>>({});
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageTarget, setMessageTarget] = useState<"voice" | "role" | "mood" | null>(null);
  const [voiceTarget, setVoiceTarget] = useState<"voice" | "role" | "mood" | "chat" | null>(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingMimeType, setRecordingMimeType] = useState<string>('');


  // Mock data
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS[0]);

  // Initialize user profile
  useEffect(() => {
    try {
    const profile = MOCK_USERS[currentUserIndex];
      if (!profile) {
        console.error('No profile found for index:', currentUserIndex);
        return;
      }
      
    setUserProfile(profile);
    setCurrentUser(profile);

    // Generate voice intro and mood text
    if (!profile.voiceIntroText) {
        try {
      const introText = generateVoiceIntroText(profile);
      setUserProfile(prev =>
        prev ? { ...prev, voiceIntroText: introText } : null
      );
        } catch (error) {
          console.error('Error generating voice intro text:', error);
        }
    }

    if (!profile.moodVoiceText) {
        try {
      const moodText = generateMoodVoiceText(profile);
      setUserProfile(prev =>
        prev ? { ...prev, moodVoiceText: moodText } : null
      );
        } catch (error) {
          console.error('Error generating mood voice text:', error);
        }
      }
    } catch (error) {
      console.error('Error initializing user profile:', error);
    }
  }, [currentUserIndex]);

  // Mock notifications
  useEffect(() => {
    try {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        fromUserId: "2",
        fromUserName: "Alex",
        type: "like",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      },
      {
        id: "2",
        fromUserId: "3",
        fromUserName: "Maya",
        type: "message",
        message: "Hey! I loved your profile!",
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      },
      {
        id: "3",
        fromUserId: "4",
        fromUserName: "Jordan",
        type: "voice",
        message: "Voice message",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
      {
        id: "4",
        fromUserId: "5",
        fromUserName: "Sarah",
        type: "like",
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      },
      {
        id: "5",
        fromUserId: "6",
        fromUserName: "Emma",
        type: "message",
        message: "Your voice intro is amazing! Would love to chat more.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      },
      {
        id: "6",
        fromUserId: "7",
        fromUserName: "David",
        type: "voice",
        message: "Voice message",
        timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
      },
      {
        id: "7",
        fromUserId: "8",
        fromUserName: "Sophie",
        type: "like",
        timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      },
      {
        id: "8",
        fromUserId: "9",
        fromUserName: "Michael",
        type: "message",
        message: "Love your interests! We should definitely meet up!",
        timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
      },
      {
        id: "9",
        fromUserId: "10",
        fromUserName: "Lisa",
        type: "voice",
        message: "Voice message",
        timestamp: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
      },
      {
        id: "10",
        fromUserId: "11",
        fromUserName: "Chris",
        type: "like",
        timestamp: new Date(Date.now() - 1000 * 60 * 300), // 5 hours ago
      },
    ];
    setNotifications(mockNotifications);
    setAllNotifications(mockNotifications);
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  }, []);

  // Mock chats
  useEffect(() => {
    const mockChats: Chat[] = [
      {
        id: "1",
        userId: "2",
        userName: "Alex",
        userAvatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Alex",
        lastMessage: {
          id: "msg1",
          senderId: "2",
          senderName: "Alex",
          type: "text",
          content: "Hey! I loved your profile!",
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          isRead: false,
        },
        unreadCount: 1,
        messages: [
          {
            id: "msg1",
            senderId: "2",
            senderName: "Alex",
            type: "text",
            content: "Hey! I loved your profile!",
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
            isRead: false,
          }
        ],
        isOnline: true,
        lastSeen: new Date(),
        isAIBot: true,
        aiPersonality: "Tech enthusiast",
      },
      {
        id: "2",
        userId: "3",
        userName: "Maya",
        userAvatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Maya",
        lastMessage: {
          id: "msg2",
          senderId: "3",
          senderName: "Maya",
          type: "text",
          content: "Your profile is so interesting!",
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          isRead: true,
        },
        unreadCount: 0,
        messages: [
          {
            id: "msg2",
            senderId: "3",
            senderName: "Maya",
            type: "text",
            content: "Your profile is so interesting!",
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            isRead: true,
          }
        ],
        isOnline: false,
        lastSeen: new Date(Date.now() - 1000 * 60 * 30),
        isAIBot: true,
        aiPersonality: "Creative artist",
      },
      {
        id: "3",
        userId: "4",
        userName: "Jordan",
        userAvatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Jordan",
        lastMessage: {
          id: "msg3",
          senderId: "4",
          senderName: "Jordan",
          type: "text",
          content: "Would you like to grab coffee sometime?",
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          isRead: false,
        },
        unreadCount: 1,
        messages: [
          {
            id: "msg3",
            senderId: "4",
            senderName: "Jordan",
            type: "text",
            content: "Would you like to grab coffee sometime?",
            timestamp: new Date(Date.now() - 1000 * 60 * 60),
            isRead: false,
          }
        ],
        isOnline: true,
        lastSeen: new Date(),
        isAIBot: true,
        aiPersonality: "Adventure seeker",
      },
    ];
    setChats(mockChats);
  }, []);

  // Event handlers
  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "right") {
      // Like - move to next user
      setCurrentUserIndex(prev => (prev + 1) % MOCK_USERS.length);
    } else {
      // Pass - move to next user
      setCurrentUserIndex(prev => (prev + 1) % MOCK_USERS.length);
    }
  };

  const handleAvatarClick = (chat: Chat) => {
    if (chat.isAIBot) {
      // Find the AI user profile
      const aiUser = MOCK_USERS.find(user => user.id === chat.userId);
      if (aiUser) {
        console.log("Opening AI profile for:", aiUser.name);
        setSelectedProfile(aiUser);
        setShowProfileModal(true);
      }
    } else {
      // Open 3D avatar viewer for regular users
    console.log("Opening avatar viewer for:", chat.userName);
    }
  };

  const handleInteraction = (
    type: "thumbs" | "message" | "voice" | "play",
    details?: {
      message?: string;
      target?: "voice" | "role" | "mood";
      voice?: string;
    }
  ) => {
    const target = details?.target;

    if (type === 'thumbs' && target) {
      const key = `${currentUserIndex}-${target}`;
      setThumbsClicked(prev => ({ ...prev, [key]: !prev[key] }));
      return;
    }

    if (type === 'message' && target) {
      setMessageTarget(target);
      setShowMessageModal(true);
      return;
    }

    if (type === 'voice' && target) {
      setVoiceTarget(target);
      setShowVoiceModal(true);
      return;
    }

    if (type === 'play' && userProfile && target && details?.voice) {
      if (target === 'voice' && userProfile.voiceIntroText) {
        playAIVoice(userProfile.voiceIntroText, details.voice, true);
      } else if (target === 'mood' && userProfile.moodVoiceText) {
        playAIVoice(userProfile.moodVoiceText, details.voice, true);
      }
      return;
    }
  };

  const sendMessage = () => {
    if (messageText.trim() && messageTarget) {
      handleInteraction('message', { target: messageTarget, message: messageText });
      setMessageText('');
      setShowMessageModal(false);
      setMessageTarget(null);
    }
  };

  const playAIVoice = async (text: string, voice: string, autoplay: boolean = true) => {
    try {
      console.log(`playAIVoice called with text: "${text}" and voice: "${voice}"`);
      if (text && voice) {
        await playUserVoice(text, voice, autoplay);
      } else {
        console.log('No text or voice provided to playAIVoice');
      }
    } catch (error) {
      console.error('Error in playAIVoice:', error);
    }
  };

  const handleChatSelect = (chat: Chat) => {
    const updatedChat = {
      ...chat,
      messages: chat.messages.map(msg => ({
        ...msg,
        isRead: true
      })),
      unreadCount: 0
    };
    
    const updatedChats = chats.map(c => 
      c.id === chat.id ? updatedChat : c
    );
    setChats(updatedChats);
    
    setSelectedChat(updatedChat);
    setShowChatModal(true);
  };

  const handleNotificationClick = () => {
    setNotifications([]);
  };

  const sendAIMessage = async (chatId: string, message: string) => {
    if (!selectedChat || !selectedChat.isAIBot) return;
    
    console.log('🤖 sendAIMessage called with:', { chatId, message, selectedChat: selectedChat.userName });
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random()}`,
      senderId: "current",
      senderName: "You",
      type: 'text',
      content: message,
      timestamp: new Date(),
      isRead: true
    };
    
    const updatedChatsWithUser = chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, userMessage],
          lastMessage: userMessage,
          unreadCount: 0
        };
      }
      return chat;
    });
    
    setChats(updatedChatsWithUser);
    
    setSelectedChat(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage],
      lastMessage: userMessage,
      unreadCount: 0
    } : null);

    setIsGeneratingAIResponse(true);

    try {
      const aiUser = MOCK_USERS.find(user => user.id === selectedChat.userId);
      if (!aiUser) {
        console.error('AI user not found:', selectedChat.userId);
        return;
      }
      
      const aiResponse = await generateAIResponse(aiUser, message, selectedChat.messages);
      
      const shouldSendVoice = Math.random() < 0.5;
      
      let aiMessage: ChatMessage;
      
      if (shouldSendVoice) {
        console.log('🎤 AI will send voice clip');
        const voiceAudioUrl = await playUserVoice(aiResponse, aiUser.voice, false);

        aiMessage = {
          id: `ai-${Date.now()}-${Math.random()}`,
          senderId: chatId,
          senderName: selectedChat.userName,
          type: 'voice',
          content: aiResponse,
          voiceUrl: voiceAudioUrl || undefined,
          timestamp: new Date(),
          isRead: false
        };
      } else {
        console.log('💬 AI will send text message');
        aiMessage = {
          id: `ai-${Date.now()}-${Math.random()}`,
          senderId: chatId,
          senderName: selectedChat.userName,
          type: 'text',
          content: aiResponse,
          timestamp: new Date(),
          isRead: false
        };
      }
      
      const updatedChatsWithAI = updatedChatsWithUser.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, aiMessage],
            lastMessage: aiMessage,
            unreadCount: 0
          };
        }
        return chat;
      });

      setChats(updatedChatsWithAI);
      
      setSelectedChat(prev => prev ? {
              ...prev,
              messages: [...prev.messages, aiMessage],
              lastMessage: aiMessage,
        unreadCount: 0
      } : null);
      
      console.log('🤖 AI message sent successfully');
      
    } catch (error) {
      console.error('🤖 Error sending AI message:', error);
    } finally {
      setIsGeneratingAIResponse(false);
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav'
      ];
      
      let selectedMimeType: string | null = null;
      for (const mimeType of mimeTypes) {
        if (typeof window !== 'undefined' && window.MediaRecorder && MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }
      
      if (!selectedMimeType) {
        alert('Your browser does not support any of the required audio recording formats.');
        throw new Error('No supported audio MIME type found');
      }
      
      console.log('Using MIME type for recording:', selectedMimeType);
      setRecordingMimeType(selectedMimeType);
      
      const recorder = new MediaRecorder(stream, { mimeType: selectedMimeType });
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: selectedMimeType! });
        const audioUrl = URL.createObjectURL(blob);
        setRecordedAudioUrl(audioUrl);
        setRecordedChunks(chunks);
        console.log('Recording stopped, audio URL created:', audioUrl, 'Size:', blob.size, 'Type:', selectedMimeType);
      };
      
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert(`Could not start recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      console.log('Recording stopped');
    }
  };

  const playRecordedAudio = async () => {
    if (!recordedAudioUrl || !voiceTarget || recordedChunks.length === 0) {
      console.log('❌ No recorded audio URL, voice target, or recorded chunks available for AI voice');
      return;
    }
    
    console.log('🎤 Converting your recording to AI Voice for', voiceTarget);
    
    try {
      const audioBlob = new Blob(recordedChunks, { type: recordingMimeType });
      const formData = new FormData();
      formData.append("file", audioBlob, "voice.webm");

      console.log('📡 Converting speech to text via FormData...');
      const sttResponse = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });
      
      if (!sttResponse.ok) {
        const errorData = await sttResponse.json();
        console.error('STT API Error:', errorData);
        throw new Error(`Speech-to-text failed: ${errorData.details || sttResponse.statusText}`);
      }
      
      const sttResult = await sttResponse.json();
      const recognizedText = sttResult.text;
      console.log('✅ Recognized text:', recognizedText);
      
      const selectedVoiceId = localStorage.getItem("selectedVoice");
      if (!selectedVoiceId) {
        throw new Error("No selected voice found in localStorage.");
      }
      console.log('Using ElevenLabs voice ID:', selectedVoiceId);

      await speakWithElevenLabs(recognizedText, selectedVoiceId);
      console.log('✅ ElevenLabs AI voice played successfully');
      
    } catch (error) {
      console.error('❌ Error playing AI voice:', error);
      alert(`Error playing AI voice: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      console.log('Falling back to original recorded audio...');
      try {
        const audio = new Audio(recordedAudioUrl);
        await audio.play();
      } catch (fallbackError) {
        console.error('Fallback audio playback failed:', fallbackError);
      }
    }
  };

  const sendVoiceMessage = async () => {
    if (!recordedAudioUrl || !voiceTarget || !selectedChat) {
      console.log('❌ No recorded audio URL, voice target, or selected chat available.');
      return;
    }

    console.log('📤 Sending voice message for', voiceTarget);

    try {
      const audioBlob = new Blob(recordedChunks, { type: recordingMimeType });
      const formData = new FormData();
      formData.append("file", audioBlob, "voice.webm");
      
      console.log('📡 Converting speech to text via FormData...');
      const sttResponse = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });
      
      if (!sttResponse.ok) {
        const errorData = await sttResponse.json();
        throw new Error(`Speech-to-text failed: ${errorData.details || sttResponse.statusText}`);
      }
      
      const sttResult = await sttResponse.json();
      const recognizedText = sttResult.text;
      console.log('✅ Recognized text from voice:', recognizedText);

      const userVoiceMessage: ChatMessage = {
        id: `user-voice-${Date.now()}`,
        senderId: "current",
        senderName: "You",
        type: 'voice',
        content: recognizedText,
        timestamp: new Date(),
        isRead: true,
        voiceUrl: recordedAudioUrl
      };
      
      const updatedChatsWithUser = chats.map(chat => 
        chat.id === selectedChat.id 
          ? { ...chat, messages: [...chat.messages, userVoiceMessage], lastMessage: userVoiceMessage }
          : chat
      );
      setChats(updatedChatsWithUser);
      setSelectedChat(prev => prev ? { ...prev, messages: [...prev.messages, userVoiceMessage], lastMessage: userVoiceMessage } : null);

      // Clean up voice modal state
      setShowVoiceModal(false);
      setVoiceTarget(null);
      setIsRecording(false);
      setRecordedAudioUrl(null);
      setRecordedChunks([]);

      // Now, trigger the AI's response based on the recognized text.
      await sendAIMessage(selectedChat.id, recognizedText);

    } catch (error) {
      console.error('❌ Error processing voice message:', error);
      alert(`Could not send voice message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };


  if (!userProfile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(ellipse at 60% 20%, #232b4d 0%, #0c0c0c 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div style={getPageContainerStyle()}>
        <GlobalNav />
        <style jsx global>{`
          /* Custom Scrollbar for Webkit Browsers */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          ::-webkit-scrollbar-track {
            background: rgba(44, 52, 80, 0.5); /* A semi-transparent track */
            border-radius: 10px;
          }

          ::-webkit-scrollbar-thumb {
            background: rgba(123, 97, 255, 0.6); /* The app's primary purple, semi-transparent */
            border-radius: 10px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: rgba(123, 97, 255, 0.8); /* Lighter on hover */
          }
        `}</style>
        {/* Main Container */}
        <div
          style={{
            ...getMainContainerStyle(),
            height: "100vh",
            maxHeight: "1200px",
            padding: `${LAYOUT_CONFIG.spacing.container} ${LAYOUT_CONFIG.spacing.container} ${LAYOUT_CONFIG.spacing.element} ${LAYOUT_CONFIG.spacing.container}`,
          }}
        >
          {/* Header */}
          <AppHeader
            userProfile={{
              id: "current-user",
              name: "You",
              age: "25",
              city: "Your City",
              bio: "Your Bio",
              aboutMe: "About you",
              interests: ["Your Interests"],
              lookingFor: "Your preferences",
              voice: "your-voice",
              voiceIntroText: "Your voice intro",
              moodVoiceText: "Your mood voice",
              tags: ["Your Tags"],
              mood: "Your Mood",
              role: {
                background: "Your Background",
                socialRole: "Your Role",
                personality: "Your Personality"
              },
              zodiac: "Your Zodiac",
              mbti: "Your MBTI",
              birthDate: "Your Birth Date",
              genderIdentity: "Your Gender",
              seekingGender: ["Your Preferences"],
              languages: ["Your Languages"],
              avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=You"
            }}
            notifications={notifications}
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            onNotificationClick={handleNotificationClick}
          />

          {/* Tab Navigation */}
          <TabNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            chats={chats}
          />

          {/* Content Area */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            {activeTab === "profiles" ? (
              <div
                style={{
                  height: "100%",
                  overflowY: "auto",
                  paddingRight: "4px",
                }}
              >
                <ProfileCard
                  user={currentUser}
                  onInteraction={handleInteraction}
                  onAvatarClick={() => handleAvatarClick({} as Chat)}
                    currentUserIndex={currentUserIndex}
                    thumbsClicked={thumbsClicked}
                />
              </div>
            ) : (
              <ChatList
                chats={chats}
                selectedChat={selectedChat}
                onChatSelect={handleChatSelect}
                onAvatarClick={handleAvatarClick}
              />
            )}
          </div>

            {/* Skip/Like Buttons - Only show on profiles tab */}
            {activeTab === "profiles" && (
              <div style={{
                display: "flex",
                gap: "12px",
                marginTop: "16px",
                padding: "0 4px"
              }}>
                <button
                  onClick={() => handleSwipe("left")}
                  style={{
                    flex: 1,
                    background: "rgba(255,107,107,0.2)",
                    border: "1px solid rgba(255,107,107,0.3)",
                    borderRadius: "12px",
                    color: "#ff6b6b",
                    padding: "12px",
                    fontSize: "16px",
                    cursor: "pointer",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  👎 Skip
                </button>
                <button
                  onClick={() => handleSwipe("right")}
                  style={{
                    flex: 1,
                    background: "rgba(255,107,107,0.2)",
                    border: "1px solid rgba(255,107,107,0.3)",
                    borderRadius: "12px",
                    color: "#ff6b6b",
                    padding: "12px",
                    fontSize: "16px",
                    cursor: "pointer",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  ❤️ Like
                </button>
              </div>
            )}
        </div>

        {/* Chat Modal */}
        {showChatModal && selectedChat && (
          <div style={getModalStyle()}>
            <div
              style={{
                ...getMainContainerStyle(),
                height: "100vh",
                maxHeight: "1200px",
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Chat Header */}
              <div
                style={{
                  background: "rgba(44,52,80,0.95)",
                  padding: "16px 20px",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <button
                  onClick={() => {
                    setShowChatModal(false);
                    setSelectedChat(null);
                  }}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: "16px",
                  }}
                >
                  ←
                </button>

                <div style={{ position: "relative" }}>
                  <img
                    src={selectedChat.userAvatar}
                    alt={selectedChat.userName}
                    onClick={() => handleAvatarClick(selectedChat)}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "2px",
                      right: "2px",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: selectedChat.isOnline ? "#4caf50" : "#9e9e9e",
                      border: "2px solid rgba(44,52,80,0.8)",
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#fff",
                      fontSize: "16px",
                    }}
                  >
                    {selectedChat.userName}
                    {selectedChat.isAIBot && (
                      <span
                        style={{
                          background: "rgba(123,97,255,0.2)",
                          color: "#7b61ff",
                          fontSize: "10px",
                          padding: "2px 6px",
                          borderRadius: "8px",
                          marginLeft: "6px",
                          fontWeight: "normal",
                        }}
                      >
                        AI
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#b0b8d0",
                    }}
                  >
                    {selectedChat.isOnline ? "Online" : "Offline"}
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {selectedChat.messages.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#b0b8d0",
                      marginTop: "40px",
                    }}
                  >
                    <div style={{ fontSize: 48, marginBottom: "16px" }}>💬</div>
                    <div>Start a conversation with {selectedChat.userName}!</div>
                  </div>
                ) : (
                  selectedChat.messages.map(message => (
                    <div
                      key={message.id}
                      style={{
                        alignSelf:
                          message.senderId === "current"
                            ? "flex-end"
                            : "flex-start",
                        maxWidth: "70%",
                      }}
                    >
                      <div
                        style={{
                          background:
                            message.senderId === "current"
                              ? "rgba(123,97,255,0.2)"
                              : "rgba(44,52,80,0.95)",
                          borderRadius: "16px",
                          padding: "12px 16px",
                          border:
                            message.senderId === "current"
                              ? "1px solid rgba(123,97,255,0.3)"
                              : "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                          {message.type === "voice" ? (
                            // Voice message - only show Play button
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px"
                            }}>
                              <button
                                onClick={() => {
                                  if (message.voiceUrl) {
                                    const audio = new Audio(message.voiceUrl);
                                    audio.play();
                                  }
                                }}
                                style={{
                                  background: "rgba(79,195,247,0.2)",
                                  border: "1px solid #4fc3f7",
                                  borderRadius: "8px",
                                  color: "#4fc3f7",
                                  padding: "8px 16px",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px"
                                }}
                              >
                                ▶️ Play Voice
                              </button>
                            </div>
                          ) : (
                            // Text message - show content
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#fff",
                            wordBreak: "break-word",
                          }}
                        >
                          {message.content}
                        </div>
                          )}
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#b0b8d0",
                            marginTop: "4px",
                          }}
                        >
                          {formatTimeAgo(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input Area */}
              <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {selectedChat.isAIBot && (
                    <button
                      onClick={() => {
                        setVoiceTarget('chat');
                        setShowVoiceModal(true);
                      }}
                      disabled={isGeneratingAIResponse}
                      style={{
                        ...getButtonStyle(),
                        padding: '0',
                        width: '40px',
                        height: '40px',
                        flexShrink: 0,
                      }}
                      title="Record AI Voice Message"
                    >
                      🎤
                    </button>
                  )}
                  <input
                    type="text"
                    value={chatMessageText}
                    onChange={e => setChatMessageText(e.target.value)}
                    onKeyPress={e => {
                      if (e.key === "Enter" && chatMessageText.trim()) {
                        if (selectedChat.isAIBot) {
                          sendAIMessage(selectedChat.id, chatMessageText);
                          setChatMessageText("");
                        }
                      }
                    }}
                    disabled={isGeneratingAIResponse}
                    placeholder="Type a message..."
                    style={{
                      flex: 1,
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '20px',
                      color: "#fff",
                      fontSize: 14,
                      padding: '10px 16px',
                      outline: "none",
                      opacity: isGeneratingAIResponse ? 0.5 : 1,
                    }}
                  />
                  <button
                    onClick={() => {
                      if (chatMessageText.trim()) {
                        if (selectedChat.isAIBot) {
                          sendAIMessage(selectedChat.id, chatMessageText);
                          setChatMessageText("");
                        }
                      }
                    }}
                    disabled={!chatMessageText.trim() || isGeneratingAIResponse}
                    style={{
                      ...getButtonStyle(),
                       padding: '0',
                       width: '40px',
                       height: '40px',
                       flexShrink: 0,
                    }}
                  >
                    {isGeneratingAIResponse ? "⏳" : "➤"}
                  </button>
                </div>

                {selectedChat.isAIBot && (
                   <button
                    onClick={() => router.push(`/rpg?opponentId=${selectedChat.userId}`)}
                    disabled={isGeneratingAIResponse}
                    style={{
                        ...getButtonStyle(),
                        width: '100%',
                        marginTop: '12px',
                        background: isGeneratingAIResponse ? "rgba(255,255,255,0.1)" : "rgba(123,97,255,0.6)",
                    }}
                    title="Let's Play 1v1 RPG!"
                  >
                    Let's Play 1v1 RPG
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

          {/* Message Modal */}
          {showMessageModal && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
              padding: "20px"
            }}>
              <div style={{
                background: "rgba(30,34,54,0.95)",
                borderRadius: 20,
                padding: "24px",
                maxWidth: 400,
                width: "100%",
                border: "1px solid rgba(255,255,255,0.1)"
              }}>
                <div style={{ marginBottom: "16px" }}>
                  <h3 style={{ color: "#fff", margin: 0, marginBottom: "8px" }}>
                    Send Message {messageTarget && `(${messageTarget})`}
                  </h3>
                  <p style={{ color: "#b0b8d0", fontSize: 14, margin: 0 }}>
                    Write a message about this {messageTarget}...
                  </p>
      </div>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  style={{
                    width: "100%",
                    minHeight: 100,
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 8,
                    padding: "12px",
                    color: "#fff",
                    fontSize: 14,
                    resize: "vertical",
                    outline: "none"
                  }}
                />
                <div style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "16px"
                }}>
                  <button
                    onClick={() => {
                      setShowMessageModal(false);
                      setMessageText("");
                      setMessageTarget(null);
                    }}
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: 8,
                      padding: "12px",
                      color: "#fff",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={!messageText.trim()}
                    style={{
                      flex: 1,
                      background: messageText.trim() ? "rgba(123,97,255,0.8)" : "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(123,97,255,0.3)",
                      borderRadius: 8,
                      padding: "12px",
                      color: "#fff",
                      cursor: messageText.trim() ? "pointer" : "not-allowed",
                      opacity: messageText.trim() ? 1 : 0.5
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Voice Modal */}
          {showVoiceModal && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
              padding: "20px"
            }}>
              <div style={{
                background: "rgba(30,34,54,0.95)",
                borderRadius: 20,
                padding: "24px",
                maxWidth: 450,
                width: "100%",
                border: "1px solid rgba(255,255,255,0.1)"
              }}>
                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ color: "#fff", margin: 0, marginBottom: "8px" }}>
                    Voice Message {voiceTarget && `(${voiceTarget})`}
                  </h3>
                  <p style={{ color: "#b0b8d0", fontSize: 14, margin: 0 }}>
                    Record a voice message about this {voiceTarget} using your AI voice...
                  </p>
                </div>
                
                {/* Voice Recording Controls */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  alignItems: "center",
                  marginBottom: "20px"
                }}>
                  {/* Record Button */}
                  <button
                    onClick={() => {
                      if (!isRecording) {
                        startRecording();
                      } else {
                        stopRecording();
                      }
                    }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: isRecording ? "rgba(255,107,107,0.2)" : "rgba(79,195,247,0.2)",
                      border: `2px solid ${isRecording ? "#ff6b6b" : "#4fc3f7"}`,
                      color: isRecording ? "#ff6b6b" : "#4fc3f7",
                      fontSize: 24,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s"
                    }}
                  >
                    {isRecording ? "⏹️" : "🎤"}
                  </button>
                  
                  <div style={{ color: "#b0b8d0", fontSize: 14, textAlign: "center" }}>
                    {isRecording ? "Recording... Tap to stop" : "Tap to record voice message"}
                  </div>
                  
                  {/* Playback Controls */}
                  {recordedAudioUrl && (
                    <div style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center"
                    }}>
                      <button
                        onClick={playRecordedAudio}
                        style={{
                          background: "rgba(123,97,255,0.2)",
                          border: "1px solid #7b61ff",
                          borderRadius: "8px",
                          color: "#7b61ff",
                          padding: "8px 16px",
                          cursor: "pointer",
                          fontSize: 14,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        ▶️ Play
                      </button>
                      <button
                        onClick={() => {
                          setRecordedAudioUrl(null);
                          setRecordedChunks([]);
                          console.log("Delete recorded audio");
                        }}
                        style={{
                          background: "rgba(255,107,107,0.2)",
                          border: "1px solid #ff6b6b",
                          borderRadius: "8px",
                          color: "#ff6b6b",
                          padding: "8px 16px",
                          cursor: "pointer",
                          fontSize: 14,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div style={{
                  display: "flex",
                  gap: "12px"
                }}>
                  <button
                    onClick={() => {
                      setShowVoiceModal(false);
                      setVoiceTarget(null);
                      setIsRecording(false);
                      setRecordedAudioUrl(null);
                    }}
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: 8,
                      padding: "12px",
                      color: "#fff",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      console.log('🎤 Send Voice button clicked!');
                      console.log('recordedAudioUrl:', recordedAudioUrl);
                      console.log('voiceTarget:', voiceTarget);
                      sendVoiceMessage();
                    }}
                    disabled={!recordedAudioUrl}
                    title={recordedAudioUrl ? 'Send Voice Message' : 'Record audio first'}
                    style={{
                      flex: 1,
                      background: recordedAudioUrl ? "rgba(79,195,247,0.8)" : "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(79,195,247,0.3)",
                      borderRadius: 8,
                      padding: "12px",
                      color: "#fff",
                      cursor: recordedAudioUrl ? "pointer" : "not-allowed",
                      opacity: recordedAudioUrl ? 1 : 0.5
                    }}
                  >
                    Send Voice
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification Modal */}
          {showNotifications && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
              padding: "20px"
            }}>
              <div style={{
                background: "rgba(30,34,54,0.95)",
                borderRadius: 20,
                padding: "24px",
                maxWidth: 500,
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                border: "1px solid rgba(255,255,255,0.1)"
              }}>
                {/* Notification Header */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid rgba(255,255,255,0.1)"
                }}>
                  <h2 style={{ color: "#fff", margin: 0 }}>
                    🔔 Notifications
                  </h2>
                                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      // Don't clear notifications, just mark them as read
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#b0b8d0",
                      fontSize: "20px",
                      cursor: "pointer",
                      padding: "4px"
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Notification List */}
                <div style={{ marginBottom: "20px" }}>
                  {allNotifications.length === 0 ? (
                    <div style={{
                      textAlign: "center",
                      color: "#b0b8d0",
                      padding: "40px 20px"
                    }}>
                      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔕</div>
                      <p style={{ margin: 0, fontSize: "16px" }}>No notifications yet</p>
                      <p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>When someone likes or messages you, it will appear here</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {allNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: 12,
                            padding: "16px",
                            border: "1px solid rgba(255,255,255,0.1)"
                          }}
                        >
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "8px"
                          }}>
                            <div style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              background: "rgba(123,97,255,0.2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "18px"
                            }}>
                              {notification.type === "like" && "❤️"}
                              {notification.type === "message" && "💬"}
                              {notification.type === "voice" && "🎤"}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                color: "#fff",
                                fontWeight: "600",
                                fontSize: "14px"
                              }}>
                                {notification.fromUserName}
                              </div>
                              <div style={{
                                color: "#b0b8d0",
                                fontSize: "12px"
                              }}>
                                {notification.type === "like" && "liked your profile"}
                                {notification.type === "message" && "sent you a message"}
                                {notification.type === "voice" && "sent you a voice message"}
                              </div>
                            </div>
                            <div style={{
                              color: "#b0b8d0",
                              fontSize: "11px",
                              textAlign: "right"
                            }}>
                              {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          
                          {notification.message && (
                            <div style={{
                              color: "#b0b8d0",
                              fontSize: "13px",
                              lineHeight: "1.4",
                              marginTop: "8px",
                              padding: "8px 12px",
                              background: "rgba(0,0,0,0.2)",
                              borderRadius: 8,
                              border: "1px solid rgba(255,255,255,0.1)"
                            }}>
                              "{notification.message}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowNotifications(false);
                  }}
                  style={{
                    width: "100%",
                    background: "rgba(123,97,255,0.2)",
                    border: "1px solid rgba(123,97,255,0.3)",
                    borderRadius: 8,
                    padding: "12px",
                    color: "#7b61ff",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  Close Notifications
                </button>
              </div>
            </div>
          )}

          {/* Profile Modal */}
          {showProfileModal && selectedProfile && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
              padding: "20px"
            }}>
              <div style={{
                background: "rgba(30,34,54,0.95)",
                borderRadius: 20,
                padding: "24px",
                maxWidth: 500,
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                border: "1px solid rgba(255,255,255,0.1)"
              }}>
                {/* Profile Header */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid rgba(255,255,255,0.1)"
                }}>
                  <img
                    src={selectedProfile.avatarUrl}
                    alt={selectedProfile.name}
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      objectFit: "cover"
                    }}
                  />
                  <div>
                    <h2 style={{ color: "#fff", margin: 0, marginBottom: "4px" }}>
                      {selectedProfile.name}, {selectedProfile.age}
                      <span style={{
                        background: "rgba(123,97,255,0.2)",
                        color: "#7b61ff",
                        fontSize: "12px",
                        padding: "2px 8px",
                        borderRadius: "8px",
                        marginLeft: "8px",
                        fontWeight: "normal"
                      }}>
                        AI Bot
                      </span>
                    </h2>
                    <p style={{ color: "#b0b8d0", margin: 0, fontSize: "14px" }}>
                      {selectedProfile.city} • {selectedProfile.bio}
                    </p>
                  </div>
                </div>

                {/* Profile Content */}
                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ color: "#fff", margin: "0 0 12px 0", fontSize: "16px" }}>
                    About Me
                  </h3>
                  <p style={{ color: "#b0b8d0", margin: 0, lineHeight: "1.5" }}>
                    {selectedProfile.aboutMe}
                  </p>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ color: "#fff", margin: "0 0 12px 0", fontSize: "16px" }}>
                    Interests
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {selectedProfile.interests.map((interest, index) => (
                      <span key={index} style={{
                        background: "rgba(123,97,255,0.2)",
                        border: "1px solid rgba(123,97,255,0.3)",
                        borderRadius: "12px",
                        padding: "4px 12px",
                        fontSize: "12px",
                        color: "#7b61ff"
                      }}>
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ color: "#fff", margin: "0 0 12px 0", fontSize: "16px" }}>
                    🎭 Role
                  </h3>
                  <div style={{ color: "#b0b8d0", lineHeight: "1.5" }}>
                    <p style={{ margin: "0 0 8px 0" }}>
                      <strong>Background:</strong> {selectedProfile.role.background}
                    </p>
                    <p style={{ margin: "0 0 8px 0" }}>
                      <strong>Social Role:</strong> {selectedProfile.role.socialRole}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Personality:</strong> {selectedProfile.role.personality}
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ color: "#fff", margin: "0 0 12px 0", fontSize: "16px" }}>
                    🎤 Voice
                  </h3>
                  <div style={{ color: "#b0b8d0", lineHeight: "1.5" }}>
                    <p style={{ margin: "0 0 8px 0" }}>
                      <strong>Voice Setting:</strong> {selectedProfile.voice}
                    </p>
                    <p style={{ margin: "0 0 8px 0" }}>
                      <strong>Voice Intro:</strong> {selectedProfile.voiceIntroText || "Not set"}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Mood Voice:</strong> {selectedProfile.moodVoiceText || "Not set"}
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setSelectedProfile(null);
                  }}
                  style={{
                    width: "100%",
                    background: "rgba(123,97,255,0.2)",
                    border: "1px solid rgba(123,97,255,0.3)",
                    borderRadius: 8,
                    padding: "12px",
                    color: "#7b61ff",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  Close Profile
                </button>
              </div>
            </div>
          )}
        </div>
    </ErrorBoundary>
  );
}
