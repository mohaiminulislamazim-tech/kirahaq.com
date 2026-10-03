import React from 'react';
import { Leaf, ShieldCheck, HeartHandshake, Award } from 'lucide-react';

export const ValuePropositionBar: React.FC = () => {
  const props = [
    {
      icon: <Leaf className="w-8 h-8 text-amber-400 shrink-0" />,
      title: '100% Natural',
      desc: 'Pure ingredients harvested directly from nature'
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-amber-400 shrink-0" />,
      title: 'Chemical Free',
      desc: 'No harmful chemicals, pesticides, or artificial additives'
    },
    {
      icon: <HeartHandshake className="w-8 h-8 text-amber-400 shrink-0" />,
      title: 'Sunnah Inspired',
      desc: 'Guided by authentic teachings of Prophet Muhammad (ﷺ)'
    },
    {
      icon: <Award className="w-8 h-8 text-amber-400 shrink-0" />,
      title: 'Trusted Quality',
      desc: 'Tested for maximum purity & medicinal strength'
    }
  ];

  return (
    <section className="bg-[#132c1e] text-white py-10 border-y border-emerald-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {props.map((p, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-emerald-900/80 border border-emerald-700/50">
                {p.icon}
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-amber-100">
                  {p.title}
                </h4>
                <p className="text-xs text-emerald-200/80 mt-1 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
