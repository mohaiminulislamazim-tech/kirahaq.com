import React from 'react';
import { X, Ruler, Check } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, category }) => {
  if (!isOpen) return null;

  const isClothing = category?.toLowerCase().includes('fashion') || category?.toLowerCase().includes('apparel') || category?.toLowerCase().includes('clothing');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1b3d2b]/10 flex items-center justify-center text-[#1b3d2b]">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">Product Sizing & Measurement Guide</h3>
              <p className="text-xs text-stone-500">Find the perfect volume or size for your needs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/60 hover:bg-stone-300 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
            aria-label="Close size guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-stone-700">
          <div>
            <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1b3d2b]" />
              {isClothing ? 'Standard Clothing Size Chart (Inches / CM)' : 'Standard Package Volume & Weight Dimensions'}
            </h4>
            <p className="text-xs text-stone-500 mb-4">
              {isClothing 
                ? 'Refer to the measurements below to determine your best fit. For relaxed fit, consider going one size up.'
                : 'All natural and organic containers are hermetically sealed and weighed with precision laboratory scales.'}
            </p>

            <div className="overflow-x-auto rounded-xl border border-stone-200">
              {isClothing ? (
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-900 font-bold border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Chest (in)</th>
                      <th className="py-3 px-4">Waist (in)</th>
                      <th className="py-3 px-4">Length (in)</th>
                      <th className="py-3 px-4">Fits Weight (kg)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-600">
                    <tr className="hover:bg-stone-50/80">
                      <td className="py-2.5 px-4 font-bold text-stone-900">XS</td>
                      <td className="py-2.5 px-4">34 - 36"</td>
                      <td className="py-2.5 px-4">28 - 30"</td>
                      <td className="py-2.5 px-4">26"</td>
                      <td className="py-2.5 px-4">45 - 55 kg</td>
                    </tr>
                    <tr className="hover:bg-stone-50/80 bg-stone-50/40">
                      <td className="py-2.5 px-4 font-bold text-stone-900">S</td>
                      <td className="py-2.5 px-4">36 - 38"</td>
                      <td className="py-2.5 px-4">30 - 32"</td>
                      <td className="py-2.5 px-4">27"</td>
                      <td className="py-2.5 px-4">55 - 65 kg</td>
                    </tr>
                    <tr className="hover:bg-stone-50/80">
                      <td className="py-2.5 px-4 font-bold text-stone-900">M</td>
                      <td className="py-2.5 px-4">38 - 40"</td>
                      <td className="py-2.5 px-4">32 - 34"</td>
                      <td className="py-2.5 px-4">28"</td>
                      <td className="py-2.5 px-4">65 - 75 kg</td>
                    </tr>
                    <tr className="hover:bg-stone-50/80 bg-stone-50/40">
                      <td className="py-2.5 px-4 font-bold text-stone-900">L</td>
                      <td className="py-2.5 px-4">40 - 42"</td>
                      <td className="py-2.5 px-4">34 - 36"</td>
                      <td className="py-2.5 px-4">29"</td>
                      <td className="py-2.5 px-4">75 - 85 kg</td>
                    </tr>
                    <tr className="hover:bg-stone-50/80">
                      <td className="py-2.5 px-4 font-bold text-stone-900">XL</td>
                      <td className="py-2.5 px-4">42 - 44"</td>
                      <td className="py-2.5 px-4">36 - 38"</td>
                      <td className="py-2.5 px-4">30"</td>
                      <td className="py-2.5 px-4">85 - 95 kg</td>
                    </tr>
                    <tr className="hover:bg-stone-50/80 bg-stone-50/40">
                      <td className="py-2.5 px-4 font-bold text-stone-900">XXL</td>
                      <td className="py-2.5 px-4">44 - 48"</td>
                      <td className="py-2.5 px-4">38 - 42"</td>
                      <td className="py-2.5 px-4">31"</td>
                      <td className="py-2.5 px-4">95+ kg</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-900 font-bold border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Variant / Volume</th>
                      <th className="py-3 px-4">Net Weight</th>
                      <th className="py-3 px-4">Serving Duration</th>
                      <th className="py-3 px-4">Recommended For</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-600">
                    <tr className="hover:bg-stone-50/80">
                      <td className="py-2.5 px-4 font-bold text-stone-900">250g / 100ml (Sampler)</td>
                      <td className="py-2.5 px-4">~250 Grams</td>
                      <td className="py-2.5 px-4">10 - 15 Days</td>
                      <td className="py-2.5 px-4">Individual trial & travel</td>
                    </tr>
                    <tr className="hover:bg-stone-50/80 bg-stone-50/40">
                      <td className="py-2.5 px-4 font-bold text-stone-900">500g / 250ml (Standard)</td>
                      <td className="py-2.5 px-4">~500 Grams</td>
                      <td className="py-2.5 px-4">30 - 45 Days</td>
                      <td className="py-2.5 px-4">Monthly personal routine</td>
                    </tr>
                    <tr className="hover:bg-stone-50/80">
                      <td className="py-2.5 px-4 font-bold text-stone-900">1000g / 1kg (Family Pack)</td>
                      <td className="py-2.5 px-4">~1.00 Kilogram</td>
                      <td className="py-2.5 px-4">60 - 90 Days</td>
                      <td className="py-2.5 px-4">Family wellness & maximum value</td>
                    </tr>
                    <tr className="hover:bg-stone-50/80 bg-stone-50/40">
                      <td className="py-2.5 px-4 font-bold text-stone-900">Gift Box / Multi-Jar</td>
                      <td className="py-2.5 px-4">1.5 - 2.0 kg</td>
                      <td className="py-2.5 px-4">90+ Days</td>
                      <td className="py-2.5 px-4">Premium gifting & VIP hampers</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-100 space-y-2">
            <h5 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-700" />
              Need Assistance Choosing?
            </h5>
            <p className="text-xs text-emerald-900/80 leading-relaxed">
              If you have any doubts regarding weight, dosage, or size choices, feel free to contact our customer wellness advisors via WhatsApp or live consultation anytime!
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#1b3d2b] hover:bg-emerald-950 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Got it, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
