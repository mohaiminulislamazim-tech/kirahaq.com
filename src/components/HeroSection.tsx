import React from 'react';
import { ShoppingBag, Calendar, Sparkles, ShieldCheck, CheckCircle2, Lock, Truck } from 'lucide-react';
import { HeroButton } from '../types';

interface HeroSectionProps {
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  shopCtaText?: string;
  heroButtons?: HeroButton[];
  onShopNow: () => void;
  onBookConsultation: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  heroBadge = 'PURE BY NATURE, GUIDED BY SUNNAH',
  heroTitle,
  heroSubtitle = '100% natural products and Sunnah based wellness solutions for a healthier life according to Islamic principles.',
  heroImage = 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800',
  shopCtaText = 'Shop Now',
  heroButtons = [],
  onShopNow,
  onBookConsultation
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-stone-50 to-white pt-8 pb-12 lg:py-16">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-[#1b3d2b] text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>{heroBadge}</span>
            </div>

            {/* Main Headline */}
            {heroTitle ? (
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#1b3d2b] tracking-tight leading-[1.15] whitespace-pre-line">
                {heroTitle}
              </h1>
            ) : (
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#1b3d2b] tracking-tight leading-[1.15]">
                Pure Honey.<br />
                <span className="text-amber-800">Natural Foods.</span><br />
                Sunnah Wellness.
              </h1>
            )}

            {/* Subtitle */}
            <p className="text-stone-600 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {heroSubtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {heroButtons.length > 0 ? (
                heroButtons.map(btn => (
                  <a
                    key={btn.id}
                    href={btn.url}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#1b3d2b] hover:bg-[#132c1e] text-white rounded-lg font-semibold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <span>{btn.label}</span>
                  </a>
                ))
              ) : (
                <>
                  <button
                    onClick={onShopNow}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#1b3d2b] hover:bg-[#132c1e] text-white rounded-lg font-semibold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <ShoppingBag className="w-5 h-5 text-amber-400" />
                    <span>{shopCtaText}</span>
                  </button>

                  <button
                    onClick={onBookConsultation}
                    className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-amber-50 border-2 border-amber-500 text-stone-800 rounded-lg font-semibold text-base shadow-2xs hover:border-amber-600 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <Calendar className="w-5 h-5 text-amber-600" />
                    <span>Book Consultation</span>
                  </button>
                </>
              )}
            </div>


            {/* Trust Badges Row */}
            <div className="pt-6 border-t border-amber-200/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-stone-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-medium">100% Natural</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-medium">Halal Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-medium">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-medium">Fast Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Image & Quranic Frame Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Product Hero Showcase Image */}
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-amber-50/50">
                <img
                  src={heroImage}
                  alt="Pure Honey and Sunnah Foods"
                  className="w-full h-80 sm:h-96 object-cover transform hover:scale-105 transition-transform duration-700"
                />
                
                {/* Product Float Tag */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-amber-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center font-bold text-amber-800 text-lg">
                    🍯
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1b3d2b]">100% Pure Sidr Honey</p>
                    <p className="text-[11px] text-amber-700 font-medium">Harvested from Wild Groves</p>
                  </div>
                </div>
              </div>

              {/* Quranic Ayah Card Overlay (Matching reference image right card) */}
              <div className="mt-4 lg:absolute lg:-top-6 lg:-right-6 lg:mt-0 z-20 bg-amber-50/95 backdrop-blur-md border border-amber-300 p-4 sm:p-5 rounded-xl shadow-xl max-w-xs mx-auto lg:mx-0 text-center space-y-2">
                <p className="font-serif text-amber-950 text-xl font-bold dir-rtl leading-relaxed">
                  وَكُلُوا مِمَّا رَزَقَكُمُ اللَّهُ حَلَالًا طَيِّبًا
                </p>
                <p className="text-stone-700 text-xs italic font-medium leading-normal">
                  "And eat of the good things which We have provided for you"
                </p>
                <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider border-t border-amber-200 pt-1.5">
                  (Al-Baqarah 2:172)
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
