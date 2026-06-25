import React, { useState } from 'react';
import { X, Smartphone, Check, AlertCircle, RefreshCw, Upload, Eye } from 'lucide-react';
import { Contact } from '../types';

interface SyncContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportContacts: (contacts: Contact[]) => void;
}

const SAMPLE_PHONE_CONTACTS = [
  { name: 'Dr. Sarah Carter', phone: '+1 (555) 432-8819', statusText: 'At the clinic 🩺', personality: 'A supportive, smart family doctor. Answers questions professionally, with warmth and medical mindfulness, offering helpful non-definitive healthy lifestyle guidance.' },
  { name: 'Uncle Dave', phone: '+1 (555) 762-9901', statusText: 'Fishing this weekend! 🎣', personality: 'A classic friendly uncle who loves barbecue, fishing, dad jokes, and replying in ALL CAPS sometimes. Super excited to hear from you!' },
  { name: 'Sonia (Classmate)', phone: '+1 (555) 219-5433', statusText: 'Studying for exams 📚✍️', personality: 'A friendly and energetic college classmate. Loves chatting about homework, coffee, study schedules, and uses college student slang.' },
  { name: 'Chef Francesco', phone: '+1 (555) 881-2294', statusText: 'Cooking is love made visible 🍝', personality: 'An enthusiastic Italian chef. Speaks with immense passion about pasta, dough, seasoning, and olive oil, often throwing in Italian phrases like "Mamma Mia!" or "Delizioso!"' },
];

export default function SyncContactsModal({ isOpen, onClose, onImportContacts }: SyncContactsModalProps) {
  const [syncing, setSyncing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [contactsCount, setContactsCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isContactPickerSupported = typeof window !== 'undefined' && 'contacts' in navigator && 'select' in (navigator as any).contacts;

  const handlePhoneSync = async () => {
    setSyncing(true);
    setErrorMsg(null);
    try {
      if (isContactPickerSupported) {
        // Real browser Contact Picker API call!
        const props = ['name', 'tel', 'icon'];
        const options = { multiple: true };
        const selectedContacts = await (navigator as any).contacts.select(props, options);
        
        if (selectedContacts && selectedContacts.length > 0) {
          const imported: Contact[] = selectedContacts.map((c: any, index: number) => {
            const name = c.name && c.name[0] ? c.name[0] : `Phone Contact ${index + 1}`;
            const tel = c.tel && c.tel[0] ? c.tel[0] : `+1 (555) 000-${Math.floor(1000 + Math.random() * 9000)}`;
            const avatarUrl = c.icon && c.icon[0] 
              ? URL.createObjectURL(c.icon[0]) 
              : `https://images.unsplash.com/photo-${1500000000000 + (index * 10000)}?w=150&auto=format&fit=crop`;

            return {
              id: `phone_${Date.now()}_${index}`,
              name: name,
              phoneNumber: tel,
              avatarUrl: avatarUrl,
              personality: `A friendly synced contact named "${name}". Acts like a close phone contact, responding to the user casually.`,
              statusText: 'Synced via Contact Picker',
              unreadCount: 0,
              isOnline: Math.random() > 0.4,
            };
          });

          onImportContacts(imported);
          setContactsCount(imported.length);
          setSuccess(true);
        } else {
          setErrorMsg("No contacts were selected from your phone's picker.");
        }
      } else {
        // Fallback: Simulator mode with beautiful presets representing realistic phone contacts
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate loading delay
        
        const imported: Contact[] = SAMPLE_PHONE_CONTACTS.map((c, index) => ({
          id: `sim_phone_${Date.now()}_${index}`,
          name: c.name,
          phoneNumber: c.phone,
          avatarUrl: [
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
            'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
          ][index % 4],
          personality: c.personality,
          statusText: c.statusText,
          unreadCount: 0,
          isOnline: index % 2 === 0,
        }));

        onImportContacts(imported);
        setContactsCount(imported.length);
        setSuccess(true);
      }
    } catch (err: any) {
      console.error("Contact picker error:", err);
      setErrorMsg(err.message || "An unexpected error occurred while accessing contacts.");
    } finally {
      setSyncing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSyncing(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const imported: Contact[] = [];
        
        // Very basic VCF (vCard) parser or CSV parser fallback
        if (file.name.endsWith('.vcf')) {
          const cards = text.split('BEGIN:VCARD');
          cards.forEach((card, idx) => {
            if (!card.includes('FN:') && !card.includes('FN;')) return;
            
            const fnMatch = card.match(/FN:(.*)/) || card.match(/FN;[^:]*:(.*)/);
            const telMatch = card.match(/TEL;[^:]*:(.*)/) || card.match(/TEL:(.*)/);
            
            if (fnMatch) {
              const name = fnMatch[1].trim();
              const tel = telMatch ? telMatch[1].trim() : `+1 (555) 123-${Math.floor(1000 + Math.random() * 9000)}`;
              
              imported.push({
                id: `vcf_${Date.now()}_${idx}`,
                name: name,
                phoneNumber: tel,
                avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', // standard placeholder
                personality: `A friendly imported contact named "${name}". Response style is polite and helpful.`,
                statusText: 'Imported from vCard',
                unreadCount: 0,
                isOnline: Math.random() > 0.5,
              });
            }
          });
        } else {
          // Assume CSV or plain text with "Name, Phone"
          const lines = text.split('\n');
          lines.forEach((line, idx) => {
            const parts = line.split(',');
            if (parts.length >= 1 && parts[0].trim().length > 1) {
              const name = parts[0].trim();
              const tel = parts[1] ? parts[1].trim() : `+1 (555) 123-${Math.floor(1000 + Math.random() * 9000)}`;
              
              imported.push({
                id: `csv_${Date.now()}_${idx}`,
                name: name,
                phoneNumber: tel,
                avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                personality: `A friendly imported contact named "${name}". Response style is polite and helpful.`,
                statusText: 'Imported from file',
                unreadCount: 0,
                isOnline: Math.random() > 0.5,
              });
            }
          });
        }

        if (imported.length > 0) {
          onImportContacts(imported);
          setContactsCount(imported.length);
          setSuccess(true);
        } else {
          setErrorMsg("Could not find any valid contacts in the file. Ensure the file contains names and phone numbers.");
        }
      } catch (err) {
        setErrorMsg("Failed to parse file. Make sure it is a valid .vcf or text file.");
      } finally {
        setSyncing(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800 bg-emerald-600 dark:bg-emerald-800 text-white">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Smartphone className="w-5 h-5" /> Sync Phone Contacts
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-emerald-700 dark:hover:bg-emerald-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {!syncing && !success && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <Smartphone className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h4 className="text-md font-semibold text-zinc-900 dark:text-zinc-100">
                  {isContactPickerSupported ? "Access Phone Contacts" : "Simulate Syncing Phone Contacts"}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed px-2">
                  {isContactPickerSupported 
                    ? "Connect your real contacts from your mobile phone! We use the modern browser Contact Picker API to securely import names and phone numbers so you can chat with them instantly."
                    : "The Contact Picker API is a modern mobile browser feature. Since you're running this in an iframe or on desktop, we've loaded a set of simulated contacts from a phone book with diverse, fully interactive AI characters!"}
                </p>
              </div>

              {/* Real Sync / Sim Button */}
              <button
                onClick={handlePhoneSync}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {isContactPickerSupported ? (
                  <>🔑 Allow & Sync Phone Contacts</>
                ) : (
                  <>🚀 Simulate Phone Contacts Sync</>
                )}
              </button>

              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-100 dark:border-zinc-800"></div>
                </div>
                <span className="relative px-3 bg-white dark:bg-zinc-900 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  Or import VCF (vCard) on desktop
                </span>
              </div>

              {/* Drag/Click File Upload */}
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl cursor-pointer bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/85 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-6 h-6 text-zinc-400 mb-2" />
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                    Click to upload a .vcf or .csv contact file
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    File contains names and phone numbers
                  </p>
                </div>
                <input 
                  type="file" 
                  accept=".vcf,.csv,.txt" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          )}

          {/* Syncing State */}
          {syncing && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-spin" />
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Syncing phone contacts...
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                  Securely querying contact database and generating custom AI personalities...
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {success && (
            <div className="py-4 text-center space-y-4">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-md font-semibold text-zinc-900 dark:text-zinc-100">
                  Contacts Synced Successfully!
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 px-4">
                  We successfully imported <strong>{contactsCount}</strong> contacts into your WhatsApp chat list. Each contact has been assigned a unique AI conversation core!
                </p>
              </div>

              {/* Show list of synced items */}
              <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-xl p-3 text-left space-y-2 max-h-40 overflow-y-auto">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Imported contacts:</span>
                {SAMPLE_PHONE_CONTACTS.slice(0, contactsCount).map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-zinc-100 dark:border-zinc-800/40 last:border-0">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{c.name}</span>
                    <span className="text-zinc-400 font-mono">{c.phone}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setSuccess(false);
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Start Chatting!
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex gap-2.5 text-xs items-start">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Sync failed</p>
                <p className="mt-0.5 opacity-90">{errorMsg}</p>
                <button 
                  onClick={() => setErrorMsg(null)}
                  className="mt-2 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
