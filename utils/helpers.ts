import { UserProfile, ChatMessage, Notification } from "../types";

export const generateVoiceIntroText = (user: UserProfile) => {
  const templates = [
    `Hey there! I'm ${user.name}, ${user.age} years old from ${user.city}. ${user.bio}`,
    `Hi! I'm ${user.name}, a ${user.age}-year-old ${user.genderIdentity.toLowerCase()} from ${user.city}. ${user.bio}`,
    `Hello! I'm ${user.name}, ${user.age} and living in ${user.city}. ${user.bio}`,
    `Hey! I'm ${user.name}, ${user.age} years old. ${user.bio} I'm based in ${user.city}.`,
    `Hi there! I'm ${user.name}, a ${user.age}-year-old from ${user.city}. ${user.bio}`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
};

export const generateMoodVoiceText = (user: UserProfile) => {
  const moodTexts = {
    connect: [
      "I'm feeling really social today and would love to meet new people!",
      "Today's a great day for meaningful conversations and connections.",
      "I'm in the mood to connect with interesting people and share stories.",
      "Feeling open and ready to meet someone special today!",
      "I'm looking forward to some great conversations and new friendships.",
    ],
    roleplay: [
      `I'm in the mood for some ${user.role.background} roleplay today!`,
      `Ready to dive into the world of ${user.role.background} and explore together.`,
      `Today I'm embracing my ${user.role.personality} ${user.role.socialRole} persona.`,
      `Let's create some ${user.role.background} adventures together!`,
      `I'm channeling my inner ${user.role.personality} ${user.role.socialRole} today.`,
    ],
    casual: [
      "Just looking for some casual conversation and good vibes today.",
      "Feeling relaxed and open to whatever the day brings.",
      "Today's about keeping it light and having fun conversations.",
      "Just here to chat and see where things go naturally.",
      "Feeling easy-going and ready for some casual connections.",
    ],
  };

  const texts =
    moodTexts[user.mood as keyof typeof moodTexts] || moodTexts.casual;
  return texts[Math.floor(Math.random() * texts.length)];
};

export const getRandomMoodText = (mood: string) => {
  const moodTexts = {
    connect: [
      "Looking for meaningful connections today! 💫",
      "Ready to meet someone special ✨",
      "Open to deep conversations and new friendships 🌟",
    ],
    roleplay: [
      "In the mood for some creative roleplay! 🎭",
      "Ready to dive into fantasy worlds together 🚀",
      "Let's create some amazing stories together 📚",
    ],
    casual: [
      "Just here for some casual vibes 😊",
      "Keeping it light and fun today 🌈",
      "Open to whatever the day brings ✨",
    ],
  };

  const texts = moodTexts[mood as keyof typeof moodTexts] || moodTexts.casual;
  return texts[Math.floor(Math.random() * texts.length)];
};

export const formatTimeAgo = (timestamp: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - timestamp.getTime()) / 1000
  );

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export const getNotificationText = (notification: Notification) => {
  switch (notification.type) {
    case "like":
      return `${notification.fromUserName} liked your profile! ❤️`;
    case "message":
      return `${notification.fromUserName} sent you a message 💬`;
    case "voice":
      return `${notification.fromUserName} sent you a voice message 🎤`;
    case "thumbs":
      return `${notification.fromUserName} gave you a thumbs up 👍`;
    default:
      return `${notification.fromUserName} interacted with you`;
  }
};
