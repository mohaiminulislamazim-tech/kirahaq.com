import React from 'react';
import { DiscountOffer } from '../types';
import { Sparkles, ArrowRight } from 'lucide-react';

interface DiscountBannerSectionProps {
  offers: DiscountOffer[];
  onNavigate: (categoryId: string) => void;
  onSelectOffer?: (offer: DiscountOffer) => void;
}

export const DiscountBannerSection: React.FC<DiscountBannerSectionProps> = ({ offers, onNavigate, onSelectOffer }) => {
  const activeOffers = (offers || []).filter(o => o.isVisible);
  
  if (activeOffers.length === 0) return null;

  return (
    <section className="py-8 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeOffers.map((offer) => {
            const isTailwind = offer.backgroundColor && offer.backgroundColor.startsWith('bg-');
            const customBg = !isTailwind ? (offer.backgroundColor || '#581c87') : undefined;
            const customTextColor = offer.textColor || '#ffffff';

            const handleClick = () => {
              if (onSelectOffer) {
                onSelectOffer(offer);
              } else if (offer.targetCategoryId && offer.targetCategoryId !== 'All') {
                onNavigate(offer.targetCategoryId);
              } else {
                onNavigate('All');
              }
            };

            return (
              <div 
                key={offer.id} 
                className={`group p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col justify-center items-center text-center cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all relative overflow-hidden ${isTailwind ? offer.backgroundColor : ''}`}
                style={{
                  backgroundColor: customBg,
                  color: customTextColor,
                  ...(customBg && customBg.includes('gradient') ? { background: customBg } : {})
                }}
                onClick={handleClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                  }
                }}
              >
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1">
                  <span>Shop Deals</span>
                  <ArrowRight className="w-3 h-3" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight drop-shadow-xs group-hover:scale-105 transition-transform">
                  {offer.title}
                </h2>
                <p className="text-base sm:text-lg font-medium opacity-90">
                  {offer.subtitle}
                </p>

                <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold underline underline-offset-4 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="w-3 h-3" />
                  <span>Click to view eligible products</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
