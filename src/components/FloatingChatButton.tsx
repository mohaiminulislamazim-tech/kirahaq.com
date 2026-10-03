import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Move } from 'lucide-react';

export interface ChatPosition {
  right: number;
  bottom: number;
}

interface FloatingChatButtonProps {
  onClick: () => void;
  isOpen?: boolean;
  position?: ChatPosition;
  onPositionChange?: (pos: ChatPosition) => void;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ 
  onClick, 
  isOpen,
  position: controlledPos,
  onPositionChange 
}) => {
  // Store 2D position (right and bottom offset in pixels)
  const [internalPos, setInternalPos] = useState<ChatPosition>(() => {
    try {
      const saved = localStorage.getItem('kira_chat_btn_pos_2d');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.right === 'number' && typeof parsed.bottom === 'number') {
          return {
            right: Math.min(Math.max(parsed.right, 12), Math.max(12, window.innerWidth - 70)),
            bottom: Math.min(Math.max(parsed.bottom, 16), Math.max(16, window.innerHeight - 70))
          };
        }
      }
    } catch (e) {
      // fallback
    }
    return { right: 20, bottom: 24 }; // default bottom-6 right-5
  });

  const pos = controlledPos || internalPos;

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPosRef = useRef<ChatPosition>({ right: 20, bottom: 24 });
  const didDragRef = useRef<boolean>(false);

  // Keep inside viewport on window resize
  useEffect(() => {
    const handleResize = () => {
      const maxRight = Math.max(12, window.innerWidth - 70);
      const maxBottom = Math.max(16, window.innerHeight - 70);
      const clampedRight = Math.min(Math.max(pos.right, 12), maxRight);
      const clampedBottom = Math.min(Math.max(pos.bottom, 16), maxBottom);
      if (clampedRight !== pos.right || clampedBottom !== pos.bottom) {
        const updated = { right: clampedRight, bottom: clampedBottom };
        setInternalPos(updated);
        onPositionChange?.(updated);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pos, onPositionChange]);

  // Handle pointer down (touch or mouse)
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    didDragRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = { ...pos };
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch (err) {}
  };

  // Handle pointer move (2D delta)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = dragStartRef.current.x - e.clientX; // moving left increases right offset
    const deltaY = dragStartRef.current.y - e.clientY; // moving up increases bottom offset

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      didDragRef.current = true;
    }

    const maxRight = Math.max(12, window.innerWidth - 68);
    const minRight = 12;
    const maxBottom = Math.max(16, window.innerHeight - 76);
    const minBottom = 16;

    const newRight = Math.min(Math.max(initialPosRef.current.right + deltaX, minRight), maxRight);
    const newBottom = Math.min(Math.max(initialPosRef.current.bottom + deltaY, minBottom), maxBottom);

    const newPos = { right: Math.round(newRight), bottom: Math.round(newBottom) };
    setInternalPos(newPos);
    onPositionChange?.(newPos);
  };

  // Handle pointer up
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch (err) {}

    // Save 2D position preference
    try {
      localStorage.setItem('kira_chat_btn_pos_2d', JSON.stringify(pos));
    } catch (e) {}

    // If it was just a tap/click without dragging, open the chat
    if (!didDragRef.current) {
      onClick();
    }
  };

  return (
    <div
      style={{ 
        right: `${pos.right}px`, 
        bottom: `${pos.bottom}px` 
      }}
      className={`fixed z-50 select-none touch-none transition-transform duration-75 ${
        isDragging ? 'scale-110 cursor-grabbing' : 'cursor-grab'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setIsDragging(false)}
      title="Drag anywhere on screen • Click to chat"
    >
      <div className="relative group flex items-center">
        {/* Drag handle tooltip on hover */}
        <div className={`absolute ${pos.right > 150 ? 'right-full mr-2' : 'left-full ml-2'} hidden group-hover:flex items-center gap-1.5 bg-stone-900/95 text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-xl pointer-events-none whitespace-nowrap backdrop-blur-md border border-stone-700/60 transition-opacity`}>
          <Move className="w-3 h-3 text-amber-400" />
          <span>Drag to move</span>
        </div>

        <button
          type="button"
          className="relative bg-gradient-to-tr from-amber-500 to-amber-400 text-stone-950 p-3.5 sm:p-4 rounded-full shadow-2xl hover:shadow-amber-500/20 hover:brightness-105 active:scale-95 transition-all flex items-center justify-center border-2 border-white/50"
          aria-label="Open Live Chat"
        >
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
          
          {/* Subtle 4-way move indicator icon */}
          <span className="absolute -top-1 -left-1 bg-stone-900 text-amber-400 text-[9px] font-bold p-1 rounded-full border border-stone-700 shadow flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity">
            <Move className="w-2.5 h-2.5" />
          </span>

          {/* Pulse notification dot */}
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
          </span>
        </button>
      </div>
    </div>
  );
};


