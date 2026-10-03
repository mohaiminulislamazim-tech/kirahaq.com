import React, { useState } from 'react';
import { 
  CheckCircle2, Sparkles, FileText, Truck, RotateCcw, 
  ShieldCheck, Award, Info, ChevronDown, ChevronUp, PackageCheck, AlertCircle
} from 'lucide-react';
import { Product } from '../../types';

interface ProductTabsAccordionProps {
  product: Product;
}

export const ProductTabsAccordion: React.FC<ProductTabsAccordionProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState<'desc' | 'features' | 'specs' | 'shipping'>('desc');
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    desc: true,
    features: false,
    specs: false,
    shipping: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Structured specifications
  const specs = [
    { label: 'Brand & Origin', value: 'Kira Haq Natural Organics (Premium Heritage)' },
    { label: 'Category', value: product.category },
    { label: 'Net Weight / Volume', value: product.weight || 'Standard Pack (500g)' },
    { label: 'Stock Keeping Unit (SKU)', value: `KH-${product.id.toUpperCase()}-${product.category.substring(0, 3).toUpperCase()}` },
    { label: 'Formulation / Purity', value: product.ingredients || '100% Pure, Organic & Chemical-Free' },
    { label: 'Purity Certification', value: 'BSTI & Halal Certified Pure Grade' },
    { label: 'Storage Instructions', value: 'Store in a cool, dry place away from direct sunlight. No refrigeration required.' },
    { label: 'Shelf Life / Expiry', value: '24 Months from manufacturing date' },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6">
      {/* Desktop Tabs Header */}
      <div className="hidden md:flex items-center gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('desc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'desc'
              ? 'bg-[#1b3d2b] text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Product Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('features')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'features'
              ? 'bg-[#1b3d2b] text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Key Benefits & Features</span>
        </button>

        <button
          onClick={() => setActiveTab('specs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'specs'
              ? 'bg-[#1b3d2b] text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Specifications</span>
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'shipping'
              ? 'bg-[#1b3d2b] text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Shipping & Easy Returns</span>
        </button>
      </div>

      {/* Desktop Tab Contents */}
      <div className="hidden md:block min-h-[220px]">
        {activeTab === 'desc' && (
          <div className="space-y-4 text-stone-700 text-sm leading-relaxed animate-fadeIn">
            <h3 className="text-base font-bold text-stone-900">About {product.name}</h3>
            <p className="text-stone-600 leading-relaxed">{product.description}</p>

            {product.sunnahFact && (
              <div className="p-4 rounded-2xl bg-emerald-950 text-amber-200 border border-emerald-900 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-amber-300 text-xs mb-1">Prophetic Tradition & Sunnah Heritage</h4>
                  <p className="text-xs italic leading-relaxed text-emerald-100">"{product.sunnahFact}"</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
                <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-stone-900 text-xs mb-0.5">100% Pure Origin</h5>
                  <p className="text-[11px] text-stone-500">Unfiltered, raw, and unadulterated source guaranteed.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-stone-900 text-xs mb-0.5">Laboratory Tested</h5>
                  <p className="text-[11px] text-stone-500">Verified for optimal enzyme count & active compounds.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
                <PackageCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-stone-900 text-xs mb-0.5">Eco Hermetic Pack</h5>
                  <p className="text-[11px] text-stone-500">Aroma-lock food grade sealed packaging for peak freshness.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-base font-bold text-stone-900 mb-3">Key Wellness Benefits</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.benefits?.map((benefit, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span className="text-xs text-stone-800 font-medium leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 mt-4">
              <h4 className="font-bold text-stone-900 text-xs">Ingredients & Composition:</h4>
              <p className="text-xs text-stone-600">{product.ingredients || '100% Pure, Organic & Chemical-Free'}</p>
            </div>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-base font-bold text-stone-900 mb-2">Technical Specifications & Details</h3>
            <div className="overflow-hidden rounded-2xl border border-stone-200">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-stone-100">
                  {specs.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/70'}>
                      <td className="py-3 px-4 font-bold text-stone-700 w-1/3 sm:w-1/4">{item.label}</td>
                      <td className="py-3 px-4 text-stone-900 font-medium">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2">
                <div className="flex items-center gap-2 text-[#1b3d2b] font-bold text-sm">
                  <Truck className="w-5 h-5" />
                  <span>Express Worldwide & Domestic Shipping</span>
                </div>
                <ul className="text-xs text-stone-600 space-y-1.5 list-disc list-inside">
                  <li><strong>Dhaka City:</strong> Same-day or Next-Day Express Delivery (৳60).</li>
                  <li><strong>All Bangladesh Districts:</strong> 2–3 business days via Courier (৳120).</li>
                  <li><strong>International:</strong> 3–7 business days via DHL Express worldwide.</li>
                  <li><strong>Free Delivery:</strong> Applied automatically on orders qualifying minimum value.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <RotateCcw className="w-5 h-5" />
                  <span>7-Day Return & Replacement Guarantee</span>
                </div>
                <ul className="text-xs text-stone-600 space-y-1.5 list-disc list-inside">
                  <li>100% money-back or replacement if seal is damaged or taste does not match pure grade.</li>
                  <li>Hassle-free reverse courier pickup from your doorstep.</li>
                  <li>Simply contact our customer helpline via WhatsApp or phone.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Accordion View */}
      <div className="md:hidden space-y-3">
        {/* Accordion 1: Description */}
        <div className="border border-stone-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleAccordion('desc')}
            className="w-full p-4 bg-stone-50 flex items-center justify-between font-bold text-xs text-stone-900 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1b3d2b]" />
              <span>Product Overview</span>
            </div>
            {openAccordions.desc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openAccordions.desc && (
            <div className="p-4 bg-white text-xs text-stone-600 leading-relaxed space-y-3">
              <p>{product.description}</p>
              {product.sunnahFact && (
                <div className="p-3 bg-emerald-950 text-amber-200 rounded-xl text-[11px] italic">
                  "{product.sunnahFact}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Accordion 2: Features */}
        <div className="border border-stone-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleAccordion('features')}
            className="w-full p-4 bg-stone-50 flex items-center justify-between font-bold text-xs text-stone-900 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Key Features & Benefits</span>
            </div>
            {openAccordions.features ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openAccordions.features && (
            <div className="p-4 bg-white space-y-2">
              {product.benefits?.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accordion 3: Specs */}
        <div className="border border-stone-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleAccordion('specs')}
            className="w-full p-4 bg-stone-50 flex items-center justify-between font-bold text-xs text-stone-900 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-blue-600" />
              <span>Specifications</span>
            </div>
            {openAccordions.specs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openAccordions.specs && (
            <div className="p-4 bg-white">
              <div className="space-y-2 text-xs divide-y divide-stone-100">
                {specs.map((item, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex flex-col">
                    <span className="text-stone-400 font-bold">{item.label}</span>
                    <span className="text-stone-900 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Accordion 4: Shipping */}
        <div className="border border-stone-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleAccordion('shipping')}
            className="w-full p-4 bg-stone-50 flex items-center justify-between font-bold text-xs text-stone-900 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>Shipping & Return Policies</span>
            </div>
            {openAccordions.shipping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openAccordions.shipping && (
            <div className="p-4 bg-white text-xs text-stone-600 space-y-2">
              <p>✓ <strong>Delivery:</strong> 1-2 days Dhaka, 2-3 days nationwide.</p>
              <p>✓ <strong>Returns:</strong> 7 days full refund or replacement warranty.</p>
              <p>✓ <strong>Guarantee:</strong> 100% authentic product or double refund.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
