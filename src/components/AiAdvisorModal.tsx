import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, CheckCircle2, Loader2, BookOpen } from 'lucide-react';

interface AiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  if (!isOpen) return null;

  const samplePrompts = [
    "What Sunnah products help improve digestion and gut health?",
    "How should I take Sidr Honey and Black Seed Oil for daily immunity?",
    "Which prophetic foods give energy for fasting and busy workdays?",
    "What are the benefits of Ajwa dates and how many should I eat?"
  ];

  const handleConsult = async (textToSubmit?: string) => {
    const q = textToSubmit || query;
    if (!q.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      if (data.response) {
        setResponse(data.response);
      } else if (data.error) {
        setResponse('Sorry, we could not retrieve advice at this moment. Please try again or book a consultation with our Hakeem.');
      }
    } catch (err) {
      console.error(err);
      setResponse('In Islamic Sunnah traditions, natural foods like Pure Honey, Black Seed (Kalonji), Extra Virgin Olive Oil, and Ajwa Dates are highly recommended for overall health, immunity, and vitality.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-5">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block">
                INTELLIGENT SUNNAH GUIDE
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1b3d2b]">
                AI Islamic Health Advisor
              </h2>
            </div>
          </div>

          <p className="text-stone-600 text-xs leading-relaxed">
            Ask any health or Sunnah nutrition question. Our AI guide provides advice rooted in authentic Hadiths, Quranic verse references, and traditional prophetic medicine.
          </p>

          {/* Sample Prompts */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Suggested Questions:</span>
            <div className="grid grid-cols-1 gap-1.5">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(prompt);
                    handleConsult(prompt);
                  }}
                  className="text-left p-2 rounded-lg bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-amber-400 text-xs font-medium text-stone-800 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span className="line-clamp-1">"{prompt}"</span>
                  <span className="text-amber-700 font-bold shrink-0 text-[10px]">Ask →</span>
                </button>
              ))}
            </div>
          </div>

          {/* Query Input */}
          <form onSubmit={(e) => { e.preventDefault(); handleConsult(); }} className="space-y-2">
            <div className="relative">
              <textarea
                rows={2}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your health goal or question (e.g., 'What natural remedy helps with seasonal cold?')"
                className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full py-3 bg-[#1b3d2b] hover:bg-[#132c1e] disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Consulting Sunnah Knowledge Base...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Get Sunnah Health Advice</span>
                </>
              )}
            </button>
          </form>

          {/* Advisor Response Display */}
          {response && (
            <div className="p-4 bg-emerald-50/90 border border-emerald-300 rounded-xl space-y-2 text-stone-800 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 font-bold text-xs text-[#1b3d2b] border-b border-emerald-200 pb-2">
                <Bot className="w-4 h-4 text-amber-600" />
                <span>Kira Haq Sunnah Advisor Recommendation:</span>
              </div>
              <div className="text-xs leading-relaxed whitespace-pre-line text-stone-700">
                {response}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
