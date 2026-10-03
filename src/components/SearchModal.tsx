import React, { useState } from 'react';
import { X, Search, ShoppingBag, Eye, ArrowRight, Tag } from 'lucide-react';
import { Product, Currency, formatProductPrice, getProductPriceInfo } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  currency: Currency;
  onSelectProduct: (p: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  currency,
  onSelectProduct
}) => {
  const [term, setTerm] = useState('');

  if (!isOpen) return null;

  const matches = term.trim() === ''
    ? products.slice(0, 4)
    : products.filter(p => 
        p.name.toLowerCase().includes(term.toLowerCase()) ||
        p.description.toLowerCase().includes(term.toLowerCase()) ||
        p.category.toLowerCase().includes(term.toLowerCase())
      );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-amber-700 absolute left-3.5 top-3.5" />
            <input
              type="text"
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search Sidr Honey, Black Seed Oil, Ajwa Dates..."
              className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-sm font-medium text-stone-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
              {term.trim() ? `Search Results (${matches.length})` : 'Popular Searches'}
            </span>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {matches.map((product) => {
                const priceInfo = getProductPriceInfo(product, currency);
                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 hover:bg-amber-50 rounded-xl border border-stone-100 hover:border-amber-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover border border-stone-200"
                        />
                        {priceInfo.hasDiscount && (
                          <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[8px] font-extrabold px-1 rounded-full">
                            {priceInfo.badgeLabel}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-xs">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-amber-800 font-bold">
                            {priceInfo.currentPriceFormatted}
                          </span>
                          {priceInfo.hasDiscount && (
                            <span className="text-[10px] text-stone-400 line-through">
                              {priceInfo.regularPriceFormatted}
                            </span>
                          )}
                          {priceInfo.hasDiscount && (
                            <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded">
                              {priceInfo.discountLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
