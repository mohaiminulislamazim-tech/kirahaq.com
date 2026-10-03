import React from 'react';
import { ArrowRight, Stethoscope, Droplets, Leaf, ShieldAlert } from 'lucide-react';
import { Category } from '../types';

interface CategoriesSectionProps {
  onSelectCategory: (cat: Category) => void;
  onOpenConsultation: () => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  onSelectCategory,
  onOpenConsultation
}) => {
  const categoryCards = [
    {
      id: 'Pure Honey' as Category,
      title: 'Pure Honey',
      subtitle: '100% Pure & Raw Natural Honey',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400',
      icon: '🍯'
    },
    {
      id: 'Natural Foods' as Category,
      title: 'Natural Foods',
      subtitle: 'Organic & Healthy Food Products',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400',
      icon: '🌿'
    },
    {
      id: 'Sunnah Products' as Category,
      title: 'Sunnah Products',
      subtitle: 'Prophetic Foods & Sunnah Items',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=400',
      icon: '✨'
    },
    {
      id: 'Health Consultation' as Category,
      title: 'Health Consultation',
      subtitle: 'Islamic Health Consultation',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400',
      icon: '🩺'
    }
  ];

  const handleClick = (cat: Category) => {
    if (cat === 'Health Consultation') {
      onOpenConsultation();
    } else {
      onSelectCategory(cat);
      const el = document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 bg-stone-50 border-y border-amber-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryCards.map((card) => (
            <div
              key={card.title}
              onClick={() => handleClick(card.id)}
              className="group bg-white rounded-xl p-4 shadow-2xs hover:shadow-md border border-stone-200 hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-amber-50">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="flex-1">
                  <span className="text-xl">{card.icon}</span>
                  <h3 className="font-serif font-bold text-stone-900 group-hover:text-[#1b3d2b] text-base leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-stone-500 text-xs mt-0.5 line-clamp-2">
                    {card.subtitle}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-[#1b3d2b] group-hover:text-amber-700">
                <span>Explore Category</span>
                <div className="w-6 h-6 rounded-full bg-emerald-50 group-hover:bg-amber-400 text-[#1b3d2b] flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
