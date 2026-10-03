import React from 'react';
import { X, MessageCircle, Send } from 'lucide-react';
import { ChatPosition } from './FloatingChatButton';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactInfo?: {
    whatsapp?: string;
    messenger?: string;
  };
  position?: ChatPosition;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, contactInfo, position }) => {
  if (!isOpen) return null;

  const rawWhatsapp = contactInfo?.whatsapp || '+60 17-4505868';
  const cleanWhatsapp = rawWhatsapp.replace(/\D/g, '');
  const whatsappLink = `https://wa.me/${cleanWhatsapp || '60174505868'}`;
    
  const messengerLink = contactInfo?.messenger || 'https://m.me/your-facebook-page-id';

  // Compute smart dynamic positioning based on button location
  const isLeft = typeof position?.right === 'number' && position.right > (window.innerWidth / 2);
  const bottomOffset = typeof position?.bottom === 'number' 
    ? Math.min(Math.max(position.bottom + 68, 20), Math.max(20, window.innerHeight - 380))
    : 96;

  const modalStyle: React.CSSProperties = position
    ? isLeft
      ? {
          left: `${Math.min(Math.max(window.innerWidth - position.right - 50, 16), Math.max(16, window.innerWidth - 336))}px`,
          bottom: `${bottomOffset}px`
        }
      : {
          right: `${Math.min(Math.max(position.right, 16), Math.max(16, window.innerWidth - 336))}px`,
          bottom: `${bottomOffset}px`
        }
    : {
        right: '20px',
        bottom: '96px'
      };

  return (
    <div 
      style={modalStyle}
      className="fixed z-50 w-80 max-w-[calc(100vw-32px)] bg-stone-900 border border-stone-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 font-bold text-sm">
          <MessageCircle className="w-5 h-5" />
          <span>Customer Support Chat</span>
        </div>
        <button 
          onClick={onClose} 
          className="cursor-pointer hover:bg-black/10 p-1.5 rounded-full transition-colors text-stone-950"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-5 text-stone-200 text-xs space-y-3.5">
        <div className="bg-stone-800/80 p-3 rounded-2xl border border-stone-700/60">
          <p className="text-amber-400 font-semibold text-xs mb-1">Hello & Welcome! 👋</p>
          <p className="text-stone-300 leading-relaxed text-[11px]">
            Message our dedicated team directly for instant support, product advice, or order inquiries.
          </p>
        </div>
        
        <a 
          href={whatsappLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-600/20 active:scale-98"
        >
          <Send className="w-4 h-4" />
          <span>Chat on WhatsApp</span>
        </a>

        <a 
          href={messengerLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-600/20 active:scale-98"
        >
          <Send className="w-4 h-4" />
          <span>Chat on Messenger</span>
        </a>

        <div className="text-center pt-1">
          <span className="text-[10px] text-stone-400">
            🟢 Typically replies within a few minutes
          </span>
        </div>
      </div>
    </div>
  );
};

