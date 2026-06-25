import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  MoreVertical, 
  Search, 
  Paperclip, 
  Smile, 
  Send, 
  Plus, 
  Smartphone, 
  Check, 
  CheckCheck, 
  Image as ImageIcon, 
  Mic, 
  UserPlus, 
  ArrowLeft, 
  Info, 
  X,
  FileText,
  Video,
  Phone,
  Moon,
  Sun,
  Laptop
} from 'lucide-react';
import { Contact, Message, Chat } from './types';
import { DEFAULT_CONTACTS, INITIAL_CHATS } from './data';
import AddContactModal from './components/AddContactModal';
import SyncContactsModal from './components/SyncContactsModal';
import ContactInfoModal from './components/ContactInfoModal';

export default function App() {
  // State initialization
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('whatsapp_contacts');
    return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
  });

  const [chats, setChats] = useState<Record<string, Chat>>(() => {
    const saved = localStorage.getItem('whatsapp_chats');
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });

  const [selectedContactId, setSelectedContactId] = useState<string>(() => {
    return DEFAULT_CONTACTS[0]?.id || '';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [typingContacts, setTypingContacts] = useState<Record<string, boolean>>({});
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  
  // Mobile navigation state
  const [showSidebar, setShowSidebar] = useState(true);

  // Attachment overlay state
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [attachedMedia, setAttachedMedia] = useState<{ url: string; type: 'image' | 'audio' } | null>(null);

  // Audio recording simulation
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  // Message scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persist contacts and chats to localStorage on changes
  useEffect(() => {
    localStorage.setItem('whatsapp_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('whatsapp_chats', JSON.stringify(chats));
  }, [chats]);

  // Scroll to bottom of current chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedContactId, chats]);

  // Scroll on typing state changes or when chats render
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [typingContacts]);

  // Handle selected contact
  const activeContact = contacts.find(c => c.id === selectedContactId) || contacts[0];
  const activeChat = activeContact ? chats[activeContact.id] || { contactId: activeContact.id, messages: [] } : null;

  // Set selected contact to zero unreads
  useEffect(() => {
    if (activeContact && activeContact.unreadCount > 0) {
      setContacts(prev => prev.map(c => 
        c.id === activeContact.id ? { ...c, unreadCount: 0 } : c
      ));
    }
  }, [selectedContactId]);

  // Handle manual contact creation
  const handleAddContact = (newContact: Contact) => {
    // Add contact
    setContacts(prev => [newContact, ...prev]);
    // Initialize empty chat
    setChats(prev => ({
      ...prev,
      [newContact.id]: {
        contactId: newContact.id,
        messages: []
      }
    }));
    // Select the contact
    setSelectedContactId(newContact.id);
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  // Handle synced phone contacts list import
  const handleImportContacts = (importedList: Contact[]) => {
    setContacts(prev => {
      // Avoid duplicate IDs
      const existingIds = new Set(prev.map(c => c.id));
      const filtered = importedList.filter(c => !existingIds.has(c.id));
      return [...filtered, ...prev];
    });

    setChats(prev => {
      const updated = { ...prev };
      importedList.forEach(c => {
        if (!updated[c.id]) {
          updated[c.id] = {
            contactId: c.id,
            messages: []
          };
        }
      });
      return updated;
    });

    if (importedList.length > 0) {
      setSelectedContactId(importedList[0].id);
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      }
    }
  };

  // Update specific contact personality bio from right panel info drawer
  const handleUpdatePersonality = (contactId: string, newPersonality: string) => {
    setContacts(prev => prev.map(c => 
      c.id === contactId ? { ...c, personality: newPersonality } : c
    ));
  };

  // Clear chat history for specific contact
  const handleClearChat = (contactId: string) => {
    setChats(prev => ({
      ...prev,
      [contactId]: {
        contactId,
        messages: []
      }
    }));
  };

  // Simulate AI Reply triggered on user message
  const triggerAiResponse = async (targetContact: Contact, userMessageText: string, currentHistory: Message[]) => {
    const cid = targetContact.id;
    
    // 1. Set typing indicator
    setTypingContacts(prev => ({ ...prev, [cid]: true }));
    
    // Simulate natural typing delay (between 2 to 4 seconds depending on length)
    const typingDelay = Math.min(Math.max(userMessageText.length * 40, 1500), 3800);
    await new Promise(resolve => setTimeout(resolve, typingDelay));

    try {
      // 2. Query Gemini / AI agent server route
      const response = await fetch('/api/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contactName: targetContact.name,
          contactPersonality: targetContact.personality,
          newMessage: userMessageText,
          chatHistory: currentHistory.slice(-10) // Send last 10 messages for context
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Server error');
      }

      // Format clean time
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // 3. Assemble and push the incoming simulated response
      const aiMessage: Message = {
        id: `msg_ai_${Date.now()}`,
        sender: 'contact',
        text: data.reply || "👍",
        timestamp: timeStr,
        status: 'read'
      };

      setChats(prev => {
        const chat = prev[cid] || { contactId: cid, messages: [] };
        return {
          ...prev,
          [cid]: {
            ...chat,
            messages: [...chat.messages, aiMessage]
          }
        };
      });

      // Update contact online status, set unread if user is not viewing this chat
      setContacts(prev => prev.map(c => {
        if (c.id === cid) {
          return {
            ...c,
            unreadCount: selectedContactId === cid ? 0 : c.unreadCount + 1,
            isOnline: true // Active contact shows online
          };
        }
        return c;
      }));

    } catch (error) {
      console.error("Failed to generate response:", error);
      
      // Fallback fallback response
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const fallbackMessage: Message = {
        id: `msg_fallback_${Date.now()}`,
        sender: 'contact',
        text: "Sorry, I lost my connection for a second. Let's catch up later! 📱✨",
        timestamp: timeStr,
        status: 'read'
      };

      setChats(prev => {
        const chat = prev[cid] || { contactId: cid, messages: [] };
        return {
          ...prev,
          [cid]: {
            ...chat,
            messages: [...chat.messages, fallbackMessage]
          }
        };
      });
    } finally {
      // Stop typing status
      setTypingContacts(prev => ({ ...prev, [cid]: false }));
    }
  };

  // Submit new user message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Check if there is text or attachment
    if (!messageInput.trim() && !attachedMedia) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessageId = `msg_user_${Date.now()}`;
    
    const textToSend = messageInput.trim();

    const newUserMessage: Message = {
      id: userMessageId,
      sender: 'user',
      text: textToSend || (attachedMedia?.type === 'image' ? 'Sent an image' : 'Sent an audio message'),
      timestamp: timeStr,
      status: 'sending',
      mediaUrl: attachedMedia?.url,
      mediaType: attachedMedia?.type
    };

    const targetContact = activeContact;
    const cid = targetContact.id;

    // 1. Instantly append message locally in UI
    setChats(prev => {
      const chat = prev[cid] || { contactId: cid, messages: [] };
      return {
        ...prev,
        [cid]: {
          ...chat,
          messages: [...chat.messages, newUserMessage]
        }
      };
    });

    // Clear text/media states
    setMessageInput('');
    setAttachedMedia(null);

    // Simulate "sent" status after 400ms
    setTimeout(() => {
      setChats(prev => {
        const chat = prev[cid];
        if (!chat) return prev;
        return {
          ...prev,
          [cid]: {
            ...chat,
            messages: chat.messages.map(m => m.id === userMessageId ? { ...m, status: 'sent' } : m)
          }
        };
      });
    }, 400);

    // Simulate "delivered" status after 800ms
    setTimeout(() => {
      setChats(prev => {
        const chat = prev[cid];
        if (!chat) return prev;
        return {
          ...prev,
          [cid]: {
            ...chat,
            messages: chat.messages.map(m => m.id === userMessageId ? { ...m, status: 'delivered' } : m)
          }
        };
      });
    }, 800);

    // Simulate "read" double blue checkmark and trigger simulated AI response
    setTimeout(() => {
      let finalHistory: Message[] = [];
      setChats(prev => {
        const chat = prev[cid];
        if (!chat) return prev;
        finalHistory = chat.messages.map(m => m.id === userMessageId ? { ...m, status: 'read' } : m);
        return {
          ...prev,
          [cid]: {
            ...chat,
            messages: finalHistory
          }
        };
      });

      // Send chat logs + new message context to AI reply agent loop
      triggerAiResponse(targetContact, textToSend || "[Sent Attachment]", finalHistory);
    }, 1500);
  };

  // Simulate file click
  const handleMockAttachment = (type: 'image' | 'audio') => {
    setShowAttachmentMenu(false);
    if (type === 'image') {
      const sampleImages = [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600',
        'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600',
        'https://images.unsplash.com/photo-1472214222541-d510753a4907?w=600'
      ];
      const randomImg = sampleImages[Math.floor(Math.random() * sampleImages.length)];
      setAttachedMedia({ url: randomImg, type: 'image' });
    } else if (type === 'audio') {
      // Simulate audio note attachments
      setAttachedMedia({ url: '#voice_note', type: 'audio' });
    }
  };

  // Audio recording simulation triggers
  const startRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    recordingTimer.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopRecordingAndSend = () => {
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
    }
    setIsRecording(false);
    const totalSecs = recordingSeconds;
    setRecordingSeconds(0);

    // Append as a mock voice note attachment
    const sampleVoiceUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // Safe public mp3 file format fallback
    
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const voiceMsgId = `msg_voice_${Date.now()}`;
    const cid = activeContact.id;

    const newVoiceMessage: Message = {
      id: voiceMsgId,
      sender: 'user',
      text: `Voice message (${totalSecs}s)`,
      timestamp: timeStr,
      status: 'sending',
      mediaUrl: sampleVoiceUrl,
      mediaType: 'audio'
    };

    setChats(prev => {
      const chat = prev[cid] || { contactId: cid, messages: [] };
      return {
        ...prev,
        [cid]: {
          ...chat,
          messages: [...chat.messages, newVoiceMessage]
        }
      };
    });

    // Simulate standard receipt checkmarks transition
    setTimeout(() => {
      setChats(prev => {
        const chat = prev[cid];
        if (!chat) return prev;
        return {
          ...prev,
          [cid]: {
            ...chat,
            messages: chat.messages.map(m => m.id === voiceMsgId ? { ...m, status: 'read' } : m)
          }
        };
      });

      // AI triggers custom voice-note-received dialogue personality prompt
      triggerAiResponse(activeContact, "[Sent a Voice Message / Audio Note]", chats[cid]?.messages || []);
    }, 1500);
  };

  const cancelRecording = () => {
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // Filter contacts by name or phone
  const filteredContacts = contacts.filter(contact => {
    const q = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(q) ||
      (contact.phoneNumber && contact.phoneNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div id="app-root" className="flex h-screen w-screen bg-[#050505] text-gray-200 overflow-hidden font-sans relative">
      
      {/* Background Decorative Immersive Gradients (Immersive UI Theme style) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[130px] rounded-full"></div>
      </div>

      <div className="flex w-full h-full z-10 overflow-hidden">

        {/* Sidebar Left: Chats List Column */}
        <aside 
          id="whatsapp-sidebar" 
          className={`w-full md:w-[350px] shrink-0 flex flex-col border-r border-white/5 bg-[#0f0f0f] transition-all duration-300 z-20 ${
            showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0 absolute md:static h-full'
          }`}
        >
          {/* Sidebar Header */}
          <header className="h-16 flex items-center justify-between px-4 bg-[#1a1a1a]/50 backdrop-blur-md border-b border-white/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-[2px] shadow-sm">
                <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center font-bold text-xs text-white">
                  ME
                </div>
              </div>
              <div>
                <span className="font-semibold text-sm text-zinc-100 block">WhatsApp Web</span>
                <span className="text-[10px] text-emerald-400 font-medium">Active Sync Portal</span>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-2">
              <button 
                id="btn-add-contact"
                onClick={() => setIsAddOpen(true)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-300 hover:text-white transition-all hover:scale-105 cursor-pointer"
                title="Add AI Contact"
              >
                <UserPlus className="w-4 h-4" />
              </button>
              <button 
                id="btn-sync-phone"
                onClick={() => setIsSyncOpen(true)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-300 hover:text-white transition-all hover:scale-105 cursor-pointer"
                title="Sync Contacts from Phone"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Search Contacts Bar */}
          <div className="p-3 bg-[#0f0f0f]/80 border-b border-white/5 shrink-0">
            <div className="relative">
              <input 
                id="contact-search"
                type="text" 
                placeholder="Search contacts..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a1a] border-none rounded-xl py-2 pl-10 pr-4 text-xs text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600"
              />
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-zinc-600 pointer-events-none" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-zinc-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Contacts Scrolling Stream */}
          <div className="flex-1 overflow-y-auto space-y-0.5 divide-y divide-white/2">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 space-y-2">
                <p className="text-xs font-semibold">No contacts found</p>
                <p className="text-[10px]">Create a new custom AI contact or try simulating phone synchronization!</p>
              </div>
            ) : (
              filteredContacts.map(contact => {
                const isSelected = contact.id === selectedContactId;
                const contactChat = chats[contact.id];
                const lastMessage = contactChat?.messages[contactChat.messages.length - 1];
                const isTyping = typingContacts[contact.id];

                return (
                  <div 
                    id={`contact-item-${contact.id}`}
                    key={contact.id}
                    onClick={() => {
                      setSelectedContactId(contact.id);
                      if (window.innerWidth < 768) {
                        setShowSidebar(false);
                      }
                    }}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all relative ${
                      isSelected 
                        ? 'bg-emerald-500/10 border-r-2 border-emerald-500 shadow-[inset_-10px_0_20px_rgba(16,185,129,0.05)]' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Avatar Group */}
                    <div className="relative flex-shrink-0">
                      <img 
                        src={contact.avatarUrl} 
                        alt={contact.name} 
                        className="w-12 h-12 rounded-full object-cover border border-white/5"
                      />
                      {contact.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0f0f0f] rounded-full shadow-[0_0_8px_#10b981]"></span>
                      )}
                    </div>

                    {/* Metadata Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className={`text-sm truncate ${isSelected ? 'text-white font-semibold' : 'text-zinc-300 font-medium'}`}>
                          {contact.name}
                        </h3>
                        <span className="text-[9px] text-zinc-500 shrink-0">
                          {lastMessage ? lastMessage.timestamp : 'Empty'}
                        </span>
                      </div>

                      {/* Snippet message text */}
                      {isTyping ? (
                        <p className="text-xs text-emerald-400 font-medium animate-pulse">typing...</p>
                      ) : (
                        <p className="text-xs text-zinc-500 truncate">
                          {lastMessage ? (
                            <span className="flex items-center gap-1">
                              {lastMessage.sender === 'user' && (
                                <span className="inline-flex">
                                  {lastMessage.status === 'read' ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                                  ) : lastMessage.status === 'delivered' ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-zinc-500" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-zinc-500" />
                                  )}
                                </span>
                              )}
                              {lastMessage.text}
                            </span>
                          ) : (
                            contact.statusText || "Hey there! I am using WhatsApp."
                          )}
                        </p>
                      )}
                    </div>

                    {/* Unread badge indicators */}
                    {contact.unreadCount > 0 && (
                      <span className="absolute right-4 bottom-3 min-w-5 h-5 px-1.5 flex items-center justify-center text-[10px] font-bold text-[#0a0a0a] bg-emerald-400 rounded-full shadow-lg">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Main Conversation Stream Panel */}
        <main 
          id="whatsapp-chat-panel" 
          className={`flex-1 flex flex-col relative bg-[#050505] transition-all duration-300 overflow-hidden ${
            !showSidebar ? 'translate-x-0' : 'translate-x-full md:translate-x-0 absolute md:static w-full h-full'
          }`}
        >
          {activeContact ? (
            <>
              {/* Main Chat Header Bar */}
              <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-white/5 shrink-0 z-10">
                <div className="flex items-center gap-3">
                  
                  {/* Back button for mobile view screens */}
                  <button 
                    onClick={() => setShowSidebar(true)}
                    className="md:hidden p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Avatar Profile */}
                  <div 
                    onClick={() => setIsInfoOpen(!isInfoOpen)}
                    className="relative cursor-pointer flex-shrink-0"
                  >
                    <img 
                      src={activeContact.avatarUrl} 
                      alt={activeContact.name} 
                      className="w-10 h-10 rounded-full object-cover border border-white/5"
                    />
                    {activeContact.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0a0a0a] rounded-full shadow-[0_0_8px_#10b981]"></span>
                    )}
                  </div>

                  {/* Details */}
                  <div 
                    onClick={() => setIsInfoOpen(!isInfoOpen)}
                    className="cursor-pointer"
                  >
                    <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                      {activeContact.name}
                    </h2>
                    
                    {typingContacts[activeContact.id] ? (
                      <span className="text-[10px] text-emerald-400 font-semibold animate-pulse">typing...</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${activeContact.isOnline ? 'bg-emerald-500' : 'bg-zinc-500'}`}></span>
                        <span className="text-[9px] text-zinc-400 font-medium uppercase tracking-wider">
                          {activeContact.isOnline ? 'Online' : activeContact.lastSeen || 'Offline'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Top Action Toolbar */}
                <div className="flex items-center gap-4">
                  <button className="text-zinc-400 hover:text-white transition-colors hidden sm:block">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="text-zinc-400 hover:text-white transition-colors hidden sm:block">
                    <Video className="w-4.5 h-4.5" />
                  </button>
                  <div className="w-[1px] h-5 bg-white/10 hidden sm:block"></div>
                  <button 
                    onClick={() => setIsInfoOpen(!isInfoOpen)}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      isInfoOpen ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                    title="Toggle Contact Bio details"
                  >
                    <Info className="w-4.5 h-4.5" />
                  </button>
                </div>
              </header>

              {/* Chat Canvas Messages Display */}
              <div 
                id="message-scroller"
                className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 relative z-10"
              >
                {/* Central Chat Starter Stamp */}
                <div className="flex justify-center my-2">
                  <span className="text-[9px] bg-white/5 text-zinc-500 px-3 py-1 rounded-full uppercase tracking-widest font-bold">
                    SECURED WITH END-TO-END ENCRYPTION SIMULATOR
                  </span>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-center text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                  👋 Chatting with <strong>{activeContact.name}</strong>. Their personality is governed by detailed system prompt instructions. Try speaking naturally!
                </div>

                {/* Message items loop */}
                {activeChat && activeChat.messages.length === 0 ? (
                  <div className="text-center text-zinc-600 py-12">
                    <p className="text-xs font-semibold">No messages yet</p>
                    <p className="text-[10px] mt-1">Start typing below to invoke their AI brain!</p>
                  </div>
                ) : (
                  activeChat?.messages.map((msg, index) => {
                    const isMe = msg.sender === 'user';
                    
                    return (
                      <div 
                        key={msg.id || index}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}
                      >
                        <div className={`flex items-end gap-2.5 max-w-[85%] md:max-w-[70%]`}>
                          {!isMe && (
                            <img 
                              src={activeContact.avatarUrl} 
                              alt="Avatar" 
                              className="w-7 h-7 rounded-full object-cover border border-white/5 shrink-0 hidden sm:block mb-1"
                            />
                          )}

                          {/* Bubble Container */}
                          <div 
                            className={`rounded-2xl px-4 py-3 border shadow-xl relative ${
                              isMe 
                                ? 'bg-emerald-600/25 border-emerald-500/30 rounded-br-none text-zinc-100 shadow-[0_0_30px_rgba(16,185,129,0.04)]' 
                                : 'bg-[#1a1a1a] border-white/5 rounded-bl-none text-zinc-200'
                            }`}
                          >
                            {/* Embedded Media attachment displays */}
                            {msg.mediaUrl && (
                              <div className="mb-2 rounded-lg overflow-hidden border border-white/5">
                                {msg.mediaType === 'image' ? (
                                  msg.mediaUrl === '#voice_note' ? (
                                    <div className="p-3 bg-zinc-900 flex items-center gap-3">
                                      <Mic className="w-5 h-5 text-emerald-400" />
                                      <span className="text-xs text-zinc-300 font-medium">Voice Memo Note</span>
                                    </div>
                                  ) : (
                                    <img src={msg.mediaUrl} alt="Attachment" className="max-w-full h-auto max-h-60 object-cover" />
                                  )
                                ) : msg.mediaType === 'audio' ? (
                                  <div className="p-2 md:p-3 bg-[#111] dark:bg-black rounded-lg flex items-center gap-2.5 min-w-[200px]">
                                    <button className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black shrink-0 hover:scale-105 transition-transform">
                                      <Mic className="w-4 h-4 ml-0.5" />
                                    </button>
                                    <div className="flex-1">
                                      <div className="h-1 bg-zinc-800 rounded-full relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 bg-emerald-400 w-1/2"></div>
                                      </div>
                                      <div className="flex justify-between text-[8px] text-zinc-500 mt-1 font-mono">
                                        <span>0:04</span>
                                        <span>Voice note</span>
                                      </div>
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            )}

                            {/* Main Body Text */}
                            <p className="text-xs md:text-sm leading-relaxed break-words">
                              {msg.text}
                            </p>

                            {/* Footer timestamp & status indicators */}
                            <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-zinc-500 select-none">
                              <span>{msg.timestamp}</span>
                              {isMe && (
                                <span className="inline-flex shrink-0">
                                  {msg.status === 'read' ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                                  ) : msg.status === 'delivered' ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-zinc-500" />
                                  ) : msg.status === 'sent' ? (
                                    <Check className="w-3.5 h-3.5 text-zinc-500" />
                                  ) : (
                                    <span className="w-2 h-2 rounded-full border border-zinc-500 border-t-transparent animate-spin"></span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Simulated Contact Typing bubble status bubble */}
                {typingContacts[activeContact.id] && (
                  <div className="flex justify-start w-full animate-pulse">
                    <div className="flex items-end gap-2.5 max-w-[70%]">
                      <img 
                        src={activeContact.avatarUrl} 
                        alt="Avatar" 
                        className="w-7 h-7 rounded-full object-cover border border-white/5 shrink-0 hidden sm:block"
                      />
                      <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl rounded-bl-none px-4 py-3 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                        <span className="flex gap-0.5">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-100"></span>
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-200"></span>
                        </span>
                        {activeContact.name} is typing...
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Typing Input Tray Footer */}
              <footer className="p-4 z-10 shrink-0 border-t border-white/5 bg-[#0f0f0f]/50">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative">
                  
                  {/* Attachment Overlay Popups */}
                  {showAttachmentMenu && (
                    <div className="absolute bottom-16 left-2 bg-[#1a1a1a] border border-white/10 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 z-50 animate-slide-up">
                      <button 
                        type="button"
                        onClick={() => handleMockAttachment('image')}
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 rounded-xl text-xs text-zinc-200 text-left transition-colors cursor-pointer"
                      >
                        <span className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg"><ImageIcon className="w-4 h-4" /></span>
                        Attach Gallery Photo
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleMockAttachment('audio')}
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 rounded-xl text-xs text-zinc-200 text-left transition-colors cursor-pointer"
                      >
                        <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg"><Mic className="w-4 h-4" /></span>
                        Attach Audio Record
                      </button>
                    </div>
                  )}

                  {/* Pending attached media banner */}
                  {attachedMedia && (
                    <div className="mb-2.5 p-2 bg-[#1a1a1a] rounded-xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {attachedMedia.type === 'image' ? (
                          <img src={attachedMedia.url} alt="Thumbnail" className="w-10 h-10 object-cover rounded-lg" />
                        ) : (
                          <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400">
                            <Mic className="w-5 h-5" />
                          </div>
                        )}
                        <span className="text-xs font-semibold text-white">
                          {attachedMedia.type === 'image' ? 'Image Attachment' : 'Audio Note Attachment'}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setAttachedMedia(null)}
                        className="p-1 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Main Input Box container */}
                  <div className="flex items-center gap-3 bg-[#1a1a1a]/80 backdrop-blur-xl p-2 rounded-2xl border border-white/5 shadow-2xl">
                    
                    {/* Attachment trigger */}
                    <button 
                      type="button"
                      onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${showAttachmentMenu ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'}`}
                      title="Attach media files"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>

                    {/* Emoji trigger */}
                    <button 
                      type="button"
                      className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="Emojis panel"
                    >
                      <Smile className="w-5 h-5" />
                    </button>

                    {/* Microphone voice-recording indicator display or main text-input */}
                    {isRecording ? (
                      <div className="flex-1 bg-red-950/20 text-red-400 border border-red-500/10 rounded-xl px-4 py-2 flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                          Recording Audio Note ({recordingSeconds}s)
                        </div>
                        <div className="flex gap-2">
                          <button 
                            type="button" 
                            onClick={cancelRecording}
                            className="px-2.5 py-1 text-[10px] uppercase font-extrabold tracking-wider bg-zinc-800 text-zinc-400 rounded-lg hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button 
                            type="button" 
                            onClick={stopRecordingAndSend}
                            className="px-2.5 py-1 text-[10px] uppercase font-extrabold tracking-wider bg-emerald-500 text-black rounded-lg font-bold hover:scale-105 cursor-pointer"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        placeholder="Write a message..." 
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value)}
                        className="flex-1 bg-transparent border-none focus:outline-hidden focus:ring-0 text-xs md:text-sm text-white placeholder:text-zinc-600 outline-hidden py-1"
                      />
                    )}

                    {/* Right-most action triggers: voice record or message send */}
                    {!isRecording && (
                      messageInput.trim() || attachedMedia ? (
                        <button 
                          type="submit"
                          className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-[#050505] shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                        >
                          <Send className="w-4 h-4 ml-0.5" />
                        </button>
                      ) : (
                        <button 
                          type="button"
                          onClick={startRecording}
                          className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          title="Record simulated audio note"
                        >
                          <Mic className="w-5 h-5" />
                        </button>
                      )
                    )}

                  </div>
                </form>
              </footer>
            </>
          ) : (
            // Fallback screen when there is no contact active
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h3 className="text-md font-bold text-white">Select a contact to start chatting</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                  Choose from your active list, click "Add Contact" to construct your own custom personality guidelines, or select "Sync Contacts" to download simulated templates!
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Info Right Panel Drawer */}
        {activeContact && (
          <ContactInfoModal 
            isOpen={isInfoOpen}
            contact={activeContact}
            onClose={() => setIsInfoOpen(false)}
            onUpdatePersonality={handleUpdatePersonality}
            onClearChat={handleClearChat}
          />
        )}

      </div>

      {/* MODALS */}
      <AddContactModal 
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddContact={handleAddContact}
      />

      <SyncContactsModal 
        isOpen={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
        onImportContacts={handleImportContacts}
      />

    </div>
  );
}
