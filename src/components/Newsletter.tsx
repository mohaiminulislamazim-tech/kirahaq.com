import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (clean) {
      try {
        const saved = localStorage.getItem('kirahaq_subscribers');
        const existing = saved ? JSON.parse(saved) : [];
        if (!existing.some((s: any) => s.email === clean)) {
          const newSub = {
            id: 'sub_' + Date.now(),
            email: clean,
            subscribedAt: new Date().toISOString().split('T')[0],
            status: 'active'
          };
          const updated = [newSub, ...(Array.isArray(existing) ? existing : [])];
          localStorage.setItem('kirahaq_subscribers', JSON.stringify(updated));
          window.dispatchEvent(new Event('kirahaq_subscribers_updated'));
        }
      } catch (err) {
        console.error('Error saving subscriber:', err);
      }
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-stone-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="text-center md:text-left space-y-1">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950">
              Stay Updated With Our Latest Offers & Islamic Health Tips
            </h3>
            <p className="text-stone-900/80 text-xs sm:text-sm font-medium">
              Subscribe to get 10% off your first order + weekly Sunnah wellness newsletters.
            </p>
          </div>

          <div className="w-full md:w-auto min-w-[320px] sm:min-w-[400px]">
            {subscribed ? (
              <div className="bg-emerald-950 text-white p-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>JazakAllah Khair! You are now subscribed.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white/90 p-1.5 rounded-xl shadow-md border border-amber-300">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full px-3 py-2 text-xs font-medium text-stone-900 placeholder-stone-500 bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1b3d2b] hover:bg-[#132c1e] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>Subscribe</span>
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
