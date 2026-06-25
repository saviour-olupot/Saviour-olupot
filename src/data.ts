import { Contact, Chat } from './types';

export const DEFAULT_CONTACTS: Contact[] = [
  {
    id: 'alice_tech',
    name: 'Alice (Code Mentor)',
    phoneNumber: '+1 (555) 019-2831',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    personality: 'An expert software engineer who is enthusiastic about helping the user learn. Answers with concise explanations, code examples occasionally, and keeps replies energetic but highly informative.',
    statusText: 'Always refactoring. 💻✨',
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: 'bob_buddy',
    name: 'Bob (The Funny Friend)',
    phoneNumber: '+1 (555) 014-9823',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    personality: 'An extremely funny, casual, and energetic buddy. Uses lots of slang, emojis (😂, 💀, 🔥, 🚀), speaks in lowercase sometimes, loves telling short jokes, and frequently asks to hang out.',
    statusText: 'At the gym or eating pizza. No in between. 🍕💪',
    unreadCount: 0,
    isOnline: false,
    lastSeen: 'today at 10:14 AM',
  },
  {
    id: 'charlie_boss',
    name: 'Charlie (The Manager)',
    phoneNumber: '+1 (555) 017-4839',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    personality: 'A highly professional, direct, and busy project manager. Replies are formal, brief, and action-oriented. Uses standard punctuation, polite but urgent. Frequently asks about project updates and deadlines.',
    statusText: 'In a meeting | Urgent emails only 📈',
    unreadCount: 0,
    isOnline: false,
    lastSeen: 'yesterday',
  },
  {
    id: 'diana_mom',
    name: 'Diana (Mom ❤️)',
    phoneNumber: '+1 (555) 012-7482',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    personality: 'A warm, loving, and highly caring mother. Uses lots of flower emojis, hearts, and blessings. Speaks with motherly affection, asks if you ate, and gives long sentences with lots of ellipses (...) and motherly concern.',
    statusText: 'Blessed & Grateful 🌸💖',
    unreadCount: 0,
    isOnline: true,
  }
];

export const INITIAL_CHATS: Record<string, Chat> = {
  alice_tech: {
    contactId: 'alice_tech',
    messages: [
      {
        id: 'a1',
        sender: 'contact',
        text: 'Hey there! How is that React project coming along?',
        timestamp: '10:05 AM',
        status: 'read'
      },
      {
        id: 'a2',
        sender: 'user',
        text: 'Going great! Just polishing up the layout and setting up Vite + Tailwind.',
        timestamp: '10:07 AM',
        status: 'read'
      },
      {
        id: 'a3',
        sender: 'contact',
        text: 'Awesome! Did you try React 19 concurrent features or are you sticking with the classics? Let me know if you hit any weird render issues! 🛠️',
        timestamp: '10:08 AM',
        status: 'read'
      },
      {
        id: 'a4',
        sender: 'contact',
        text: 'By the way, check out this mockup UI. Does it look clean to you?',
        timestamp: '10:09 AM',
        status: 'delivered'
      }
    ]
  },
  bob_buddy: {
    contactId: 'bob_buddy',
    messages: [
      {
        id: 'b1',
        sender: 'user',
        text: 'Yo Bob, you down for tacos tonight?',
        timestamp: 'Yesterday, 8:30 PM',
        status: 'read'
      },
      {
        id: 'b2',
        sender: 'contact',
        text: 'bro you had me at tacos 🌮💀 im 100% down. let me know what time and i will fly there 🚀',
        timestamp: 'Yesterday, 8:31 PM',
        status: 'read'
      }
    ]
  },
  charlie_boss: {
    contactId: 'charlie_boss',
    messages: [
      {
        id: 'c1',
        sender: 'contact',
        text: 'Hello. I reviewed the quarterly roadmap draft. Excellent work.',
        timestamp: 'Yesterday, 2:15 PM',
        status: 'read'
      },
      {
        id: 'c2',
        sender: 'user',
        text: 'Thank you Charlie, I appreciate the feedback.',
        timestamp: 'Yesterday, 2:20 PM',
        status: 'read'
      },
      {
        id: 'c3',
        sender: 'contact',
        text: 'Please ensure the final deck is ready for the stakeholders by Friday morning. Let me know if you need resources.',
        timestamp: 'Yesterday, 2:22 PM',
        status: 'read'
      }
    ]
  },
  diana_mom: {
    contactId: 'diana_mom',
    messages: [
      {
        id: 'm1',
        sender: 'contact',
        text: 'Hello sweetheart... Hope you are having a productive day... ❤️🌸',
        timestamp: 'Yesterday, 9:15 AM',
        status: 'read'
      },
      {
        id: 'm2',
        sender: 'contact',
        text: 'Don\'t forget to drink water and eat well... I cooked some lasagna today, wish you were here to have some... Let me know when you are free for a call... God bless you child 🙏👵✨',
        timestamp: 'Yesterday, 9:18 AM',
        status: 'read'
      },
      {
        id: 'm3',
        sender: 'user',
        text: 'Aww thank you Mom! I will call you tonight around 7, promise!',
        timestamp: 'Yesterday, 12:40 PM',
        status: 'read'
      }
    ]
  }
};
