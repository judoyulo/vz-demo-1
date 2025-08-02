export type UserProfile = {
  id: string;
  name: string;
  age: string;
  avatarUrl: string;
  bio: string;
  aboutMe: string;
  interests: string[];
  lookingFor: string;
  voice: string;
  voiceIntroUrl?: string | null;
  voiceIntroText?: string;
  moodVoiceUrl?: string | null;
  moodVoiceText?: string;
  tags: string[];
  mood: string;
  role: {
    background: string;
    socialRole: string;
    personality: string;
  };
  zodiac: string;
  mbti: string;
  birthDate: string;
  genderIdentity: string;
  seekingGender: string[];
  languages: string[];
  city: string;
};

export type Notification = {
  id: string;
  fromUserId: string;
  fromUserName: string;
  type: "like" | "message" | "voice" | "thumbs" | "play";
  message?: string;
  voiceUrl?: string;
  timestamp: Date;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  type: "text" | "voice" | "image";
  content: string;
  voiceUrl?: string;
  timestamp: Date;
  isRead: boolean;
  voiceId?: string; // For AI Voice Mask
  recordedAudioBlob?: Blob; // Store the original recorded audio
  recordedAudioUrl?: string; // Store the original recorded audio URL
};

export type Chat = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: ChatMessage;
  unreadCount: number;
  messages: ChatMessage[];
  isOnline: boolean;
  lastSeen: Date;
  isAIBot?: boolean;
  aiPersonality?: string;
};

export type AIVoiceSettings = {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
};
