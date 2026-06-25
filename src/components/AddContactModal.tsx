import React, { useState } from 'react';
import { X, User, Phone, Smile, Cpu } from 'lucide-react';
import { Contact } from '../types';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContact: (contact: Contact) => void;
}

const PERSONALITY_PRESETS = [
  { name: 'Best Friend', description: 'Energetic, casual, emojis, slang, always supportive' },
  { name: 'Code Mentor', description: 'Technical expert, answers coding questions with helpful explanations' },
  { name: 'Grumpy Boss', description: 'Formal, short replies, action-oriented, slightly impatient' },
  { name: 'Loving Parent', description: 'Warm, nurturing, sends blessings, hearts, asks if you ate' },
  { name: 'Sassy Rival', description: 'Playful banter, slightly sarcastic, competitive but friendly' },
];

export default function AddContactModal({ isOpen, onClose, onAddContact }: AddContactModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [personalityType, setPersonalityType] = useState('Best Friend');
  const [customPersonality, setCustomPersonality] = useState('');
  const [statusText, setStatusText] = useState('Hey there! I am using WhatsApp.');

  if (!isOpen) return null;

  // Use selected preset or custom input
  const getFinalPersonality = () => {
    if (personalityType === 'Custom') {
      return customPersonality || 'A friendly acquaintance chatting casually.';
    }
    const preset = PERSONALITY_PRESETS.find(p => p.name === personalityType);
    return preset ? preset.description : 'A friendly acquaintance chatting casually.';
  };

  const getRandomAvatar = () => {
    const ids = [32, 44, 47, 53, 56, 64, 71, 88, 92];
    const rand = ids[Math.floor(Math.random() * ids.length)];
    return `https://images.unsplash.com/photo-${1500000000000 + rand * 1000}?w=150&auto=format&fit=crop`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalAvatar = avatar.trim() || getRandomAvatar();

    const newContact: Contact = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      phoneNumber: phone.trim() || '+1 (555) ' + Math.floor(100 + Math.random() * 900) + '-' + Math.floor(1000 + Math.random() * 9000),
      avatarUrl: finalAvatar,
      personality: getFinalPersonality(),
      statusText: statusText.trim() || 'Hey there! I am using WhatsApp.',
      unreadCount: 0,
      isOnline: true,
    };

    onAddContact(newContact);
    
    // Reset state
    setName('');
    setPhone('');
    setAvatar('');
    setPersonalityType('Best Friend');
    setCustomPersonality('');
    setStatusText('Hey there! I am using WhatsApp.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800 bg-emerald-600 dark:bg-emerald-800 text-white">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5" /> Add New AI Contact
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-emerald-700 dark:hover:bg-emerald-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Contact Name *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="e.g. Grandma, Sarah, Professor Snape"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="e.g. +1 (555) 019-2831"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* WhatsApp Bio */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              WhatsApp Status/Bio
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                <Smile className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="e.g. Urgent calls only | Busy coding"
                value={statusText}
                onChange={e => setStatusText(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Avatar Image URL */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Avatar Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="Leave blank for a random high-quality photo"
              value={avatar}
              onChange={e => setAvatar(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* AI Chat Personality Preset */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              AI Chat Personality
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {PERSONALITY_PRESETS.map(preset => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setPersonalityType(preset.name)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-all ${
                    personalityType === preset.name
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                  }`}
                >
                  <div className="font-semibold">{preset.name}</div>
                  <div className="truncate text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{preset.description}</div>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPersonalityType('Custom')}
                className={`col-span-2 px-3 py-2 text-xs font-medium rounded-lg border text-left transition-all ${
                  personalityType === 'Custom'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                }`}
              >
                <div className="font-semibold flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" /> Custom AI Personality Prompt
                </div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Write detailed guidelines for how this character should reply.</div>
              </button>
            </div>

            {/* Custom personality textarea */}
            {personalityType === 'Custom' && (
              <textarea
                placeholder="Describe how they should act. (e.g. 'You are a highly sarcastic, dry-witted barista from Brooklyn. You love coffee, use very few emojis, and complain about early shifts.')"
                value={customPersonality}
                onChange={e => setCustomPersonality(e.target.value)}
                className="w-full h-24 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Add Contact
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
