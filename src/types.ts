export interface Message {
  id: string;
  sender: 'user' | 'contact';
  text: string;
  timestamp: string; // "10:42 AM"
  status: 'sending' | 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
}

export interface Contact {
  id: string;
  name: string;
  phoneNumber?: string;
  avatarUrl: string;
  personality: string; // System instruction context for Gemini, e.g. "Friendly classmate"
  statusText?: string;  // WhatsApp status/bio, e.g. "Urgent calls only"
  unreadCount: number;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Chat {
  contactId: string;
  messages: Message[];
}
