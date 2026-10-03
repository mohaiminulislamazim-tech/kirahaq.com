import React from 'react';
import { ChevronRight, ShieldCheck, HeartHandshake, Award, Sparkles, CheckCircle2 } from 'lucide-react';

interface AboutPageProps {
  onGoHome: () => void;
  onOpenConsultation: () => void;
}

export function AboutPage({ onGoHome, onOpenConsultation }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-stone-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <button onClick={onGoHome} className="hover:text-[#1b3d2b] cursor-pointer">Home</button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-bold">About Kira Haq</span>
        </div>

        {/* Hero Section */}
        <div className="bg-[#1b3d2b] text-white rounded-3xl p-8 sm:p-12 shadow-md relative overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pure by Nature • Guided by Sunnah</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold leading-tight">
              Reviving Prophetic Wellness & Pure Natural Foods
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
              KIRA HAQ was founded with a singular sacred mission: to deliver 100% authentic, unadulterated natural foods, wild-harvested honey, and prophetic remedies to households worldwide according to strict Islamic purity principles.
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/30 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800"
              alt="Raw Honey Sourcing"
              className="w-full h-72 object-cover"
            />
          </div>
        </div>

        {/* 4 Pillars of Guarantee */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">100% Certified Pure</h3>
            <p className="text-xs text-stone-600">Lab-tested for HMF levels, zero added sugars, and zero chemical preservatives.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
            <div className="p-3 bg-amber-50 text-amber-800 rounded-xl w-fit">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Ethically Farmed</h3>
            <p className="text-xs text-stone-600">Sourced directly from certified apiaries in Hadramaut Yemen & Medina groves.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl w-fit">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Guided by Tibb</h3>
            <p className="text-xs text-stone-600">All products curated under guidance of licensed Tibb-e-Nabawi practitioners.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
            <div className="p-3 bg-stone-100 text-stone-800 rounded-xl w-fit">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Money-Back Guarantee</h3>
            <p className="text-xs text-stone-600">If any item fails purity or lab testing, we offer 100% full instant refund.</p>
          </div>
        </div>

        {/* Detailed Brand Story */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-xs space-y-6">
          <h2 className="text-2xl font-serif font-bold text-stone-900">Our Sourcing & Testing Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-stone-600 leading-relaxed">
            <div className="space-y-3">
              <p>
                In today's commercial food market, over 70% of honey sold globally contains corn syrup dilutions, pasteurization heat damage, or synthetic residues.
              </p>
              <p>
                At <strong>KIRA HAQ</strong>, we personally inspect every harvest batch before bottle sealing. Our Sidr Honey comes directly from wild Sidr tree blossoms in remote valleys, harvested using traditional non-destructive beekeeping traditions.
              </p>
            </div>
            <div className="space-y-3">
              <p>
                Our Black Seed (Kalonji) oil is cold-pressed below 35°C without any solvent extraction, preserving the maximum concentration of <strong>Thymoquinone (TQ)</strong> — the active medicinal bio-compound mentioned in Prophetic medicine.
              </p>
              <p>
                We believe that pure food is both physical nourishment and spiritual blessing (Barakah).
              </p>
            </div>
          </div>

          {/* Consultation CTA banner */}
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Need Holistic Prophetic Health Guidance?</h3>
              <p className="text-xs text-stone-600">Speak directly with our qualified Hakim for personalized dietary plans.</p>
            </div>
            <button
              onClick={onOpenConsultation}
              className="px-5 py-2.5 bg-[#1b3d2b] text-amber-300 hover:bg-emerald-950 font-bold text-xs rounded-xl cursor-pointer shrink-0"
            >
              Book Herbal Consultation
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
