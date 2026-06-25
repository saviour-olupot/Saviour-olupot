import React, { useState } from 'react';
import { X, Phone, User, Settings, Info, MessageSquare, ShieldAlert, Trash2 } from 'lucide-react';
import { Contact } from '../types';

interface ContactInfoModalProps {
  isOpen: boolean;
  contact: Contact;
  onClose: () => void;
  onUpdatePersonality: (contactId: string, newPersonality: string) => void;
  onClearChat: (contactId: string) => void;
}

export default function ContactInfoModal({ isOpen, contact, onClose, onUpdatePersonality, onClearChat }: ContactInfoModalProps) {
  const [personality, setPersonality] = useState(contact.personality);
  const [isEditingPersonality, setIsEditingPersonality] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleSavePersonality = () => {
    onUpdatePersonality(contact.id, personality);
    setIsEditingPersonality(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-zinc-50 dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col animate-slide-in">
      
      {/* Header */}
      <div className="h-16 px-4 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <span className="font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-600" /> Contact Info
        </span>
        <button 
          onClick={onClose}
          className="p-1 rounded-full text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Profile Card */}
        <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-xs text-center space-y-3">
          <img 
            src={contact.avatarUrl} 
            alt={contact.name} 
            className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100 dark:border-emerald-950/50 shadow-md"
          />
          <div>
            <h3 className="text-md font-bold text-zinc-900 dark:text-zinc-100">{contact.name}</h3>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">{contact.phoneNumber || 'No phone number'}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full ${
            contact.isOnline 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40' 
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${contact.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`}></span>
            {contact.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Info Detail */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-4 space-y-4">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
              WhatsApp Status/Bio
            </span>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 italic">
              "{contact.statusText || 'Hey there! I am using WhatsApp.'}"
            </p>
          </div>
        </div>

        {/* AI Personality Configuration */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <Settings className="w-3 h-3 text-emerald-600" /> AI Response Personality
            </span>
            {!isEditingPersonality ? (
              <button
                onClick={() => setIsEditingPersonality(true)}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Customize
              </button>
            ) : (
              <div className="flex gap-2 text-[11px] font-bold">
                <button
                  onClick={() => {
                    setPersonality(contact.personality);
                    setIsEditingPersonality(false);
                  }}
                  className="text-zinc-400 hover:underline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePersonality}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {!isEditingPersonality ? (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 leading-relaxed border border-zinc-100 dark:border-zinc-800">
              {contact.personality}
            </p>
          ) : (
            <textarea
              value={personality}
              onChange={e => setPersonality(e.target.value)}
              className="w-full h-32 p-3 text-xs text-zinc-800 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              placeholder="Configure prompt guidelines for how this AI contact should reply to you..."
            />
          )}

          {successMsg && (
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              ✓ AI Personality Updated!
            </div>
          )}
        </div>

        {/* Chat Control Center */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-4 space-y-3">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
            Chat Actions
          </span>
          
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear this entire chat history? This cannot be undone.")) {
                onClearChat(contact.id);
                alert("Chat history cleared!");
              }
            }}
            className="w-full py-2.5 px-3 flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl transition-all font-medium border border-zinc-100 dark:border-zinc-800/80 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-zinc-400" /> Clear Chat History
          </button>

          <button
            className="w-full py-2.5 px-3 flex items-center gap-2.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all font-medium border border-red-100/50 dark:border-red-950/30 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-red-500 dark:text-red-400" /> Block {contact.name}
          </button>
        </div>

      </div>
    </div>
  );
}
