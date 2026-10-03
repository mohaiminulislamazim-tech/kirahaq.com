import React from 'react';
import { 
  Stethoscope, ShieldCheck, UserCheck, Calendar, ArrowRight,
  HeartPulse, Sparkles, BookOpen, CheckCircle
} from 'lucide-react';

interface ConsultationSectionProps {
  onOpenConsultation: () => void;
}

export const ConsultationSection: React.FC<ConsultationSectionProps> = ({
  onOpenConsultation
}) => {
  const services = [
    { title: 'Hijama Therapy', icon: '🩸', desc: 'Sunnah cupping detox for pain relief & immunity' },
    { title: 'Ruqyah Treatment', icon: '📖', desc: 'Spiritual healing using Quranic verses & Sunnah supplications' },
    { title: 'Diet Consultation', icon: '🥗', desc: 'Personalized Sunnah & wholesome nutrition plans' },
    { title: 'Lifestyle Guidance', icon: '🌿', desc: 'Stress management and daily prophetic health habits' },
    { title: 'Prophetic Medicine', icon: '🍯', desc: 'Herbal remedies using Honey, Kalonji & Olive Oil' },
    { title: 'Health Education', icon: '🎓', desc: 'Workshops & private family wellness counseling' },
  ];

  return (
    <section id="consultation" className="py-16 bg-[#0f281b] text-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-800/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Text & Services */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold tracking-widest uppercase">
              ISLAMIC WELLNESS
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-amber-50 leading-tight">
              Prophetic Guidance <br />
              <span className="text-amber-400">For A Better Life</span>
            </h2>

            <p className="text-emerald-100/80 text-base max-w-xl leading-relaxed">
              Get professional consultation based on Islamic principles and Prophetic medicine for you and your family from certified Hakeems and healthcare practitioners.
            </p>

            {/* Services Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {services.map((s) => (
                <div
                  key={s.title}
                  onClick={onOpenConsultation}
                  className="p-3.5 bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/50 hover:border-amber-400/50 rounded-xl transition-all cursor-pointer group"
                >
                  <span className="text-2xl block mb-1">{s.icon}</span>
                  <h4 className="font-semibold text-sm text-white group-hover:text-amber-300 transition-colors">
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-emerald-200/70 mt-1 line-clamp-2">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Consultation Appointment Banner */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-b from-[#183c2a] to-[#122e20] rounded-2xl p-6 sm:p-8 border border-amber-400/40 shadow-2xl relative">
              
              {/* Doctor Image Header */}
              <div className="relative rounded-xl overflow-hidden mb-6 h-48 border border-emerald-800">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"
                  alt="Islamic Health Practitioner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#122e20] via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 text-xs font-semibold bg-amber-500 text-stone-950 px-2.5 py-1 rounded-md">
                  Certified Sunnah Hakeems
                </span>
              </div>

              <h3 className="text-2xl font-serif font-bold text-white mb-4">
                Book Your Consultation
              </h3>

              <ul className="space-y-2.5 text-sm text-emerald-100 mb-6">
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>One to One Consultation with Certified Practitioner</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>100% Private & Confidential Session</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Available Online or In-Person (Dhaka Center)</span>
                </li>
              </ul>

              <button
                onClick={onOpenConsultation}
                className="w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Book Appointment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
