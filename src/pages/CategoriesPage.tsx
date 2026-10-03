import React from 'react';
import { Category, Product, Currency } from '../types';
import { ChevronRight, ArrowRight, Sparkles, Layers } from 'lucide-react';

interface CategoriesPageProps {
  products: Product[];
  currency: Currency;
  onSelectCategory: (cat: Category) => void;
  onGoHome: () => void;
}

export function CategoriesPage({
  products,
  currency,
  onSelectCategory,
  onGoHome,
}: CategoriesPageProps) {
  const categoriesList: {
    name: Category;
    title: string;
    description: string;
    image: string;
    badge: string;
  }[] = [
    {
      name: 'Pure Honey',
      title: 'Raw & Pure Natural Honey',
      description: '100% Raw, Unfiltered Yemeni Sidr & Kalonji Flower Honey certified for maximum bio-active enzyme healing.',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800',
      badge: 'TOP SELLER',
    },
    {
      name: 'Natural Foods',
      title: 'Organic Wholefoods & Cold-Pressed Oils',
      description: 'Handpicked Ajwa Dates from Medina, Extra Virgin Cold-Pressed Olive Oil, Organic Seeds & Premium Dry Fruits.',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800',
      badge: 'PROPHETIC REMEDY',
    },
    {
      name: 'Sunnah Products',
      title: 'Authentic Prophetic Health Essentials',
      description: 'Authentic Ethiopian Black Seed (Kalonji) Oil, Organic Miswak sticks, Zamzam water jars, & pure Ithmid Kohl.',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800',
      badge: '100% PURE',
    },
    {
      name: 'Gift Packs',
      title: 'Islamic Premium Wellness Gift Sets',
      description: 'Elegantly packaged gift boxes containing Sidr Honey, Ajwa Dates, Miswak, and Sunnah oils for loved ones.',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800',
      badge: 'HOLIDAY GIFTS',
    },
    {
      name: 'Health Consultation',
      title: 'Prophetic Tibb-e-Nabawi Consultations',
      description: 'One-on-one virtual herbal consultations with certified Hakims specializing in prophetic medicine & diet.',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800',
      badge: 'CERTIFIED HAKIM',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <button onClick={onGoHome} className="hover:text-[#1b3d2b] cursor-pointer">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-bold">Categories Directory</span>
        </div>

        {/* Hero Banner */}
        <div className="bg-[#1b3d2b] text-white p-8 sm:p-10 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Explore Collections</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold">Shop by Category</h1>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
              Discover natural, unadulterated food products and sunnah remedies organized by specialized categories for your daily health.
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesList.map((cat) => {
            const itemCount = products.filter((p) => p.category === cat.name).length;

            return (
              <div
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Category Image */}
                  <div className="relative h-52 overflow-hidden bg-stone-100">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
                    <span className="absolute top-4 left-4 bg-amber-500 text-stone-950 font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-md shadow-xs">
                      {cat.badge}
                    </span>
                    <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-xs text-stone-900 font-bold text-xs px-3 py-1 rounded-full">
                      {itemCount} Available Items
                    </span>
                  </div>

                  {/* Body Text */}
                  <div className="p-6 space-y-2">
                    <h3 className="text-xl font-serif font-bold text-stone-900 group-hover:text-[#1b3d2b] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0">
                  <div className="py-2.5 px-4 bg-stone-50 group-hover:bg-[#1b3d2b] text-stone-800 group-hover:text-amber-300 rounded-xl font-bold text-xs flex items-center justify-between transition-colors border border-stone-200 group-hover:border-[#1b3d2b]">
                    <span>Browse {cat.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
