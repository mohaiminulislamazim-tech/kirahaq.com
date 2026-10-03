import React from 'react';
import { Check, Ruler, Tag } from 'lucide-react';
import { ProductWeightVariant } from '../../types';

export interface ProductColorVariant {
  id: string;
  name: string;
  hex: string;
  inStock: boolean;
  image?: string;
}

export interface ProductSizeVariant {
  id: string;
  name: string;
  label: string;
  inStock: boolean;
  priceMultiplier?: number;
  badge?: string;
  formattedPrice?: string;
  variantData?: ProductWeightVariant;
}

export interface ProductVariantSelectorProps {
  colors?: ProductColorVariant[];
  selectedColor?: ProductColorVariant | null;
  onSelectColor?: (color: ProductColorVariant) => void;
  sizes: ProductSizeVariant[];
  selectedSize: ProductSizeVariant | null;
  onSelectSize: (size: ProductSizeVariant) => void;
  onOpenSizeGuide: () => void;
  category?: string;
}

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  colors = [],
  selectedColor,
  onSelectColor,
  sizes,
  selectedSize,
  onSelectSize,
  onOpenSizeGuide,
}) => {
  return (
    <div className="space-y-4 pt-1 border-t border-stone-200/80">
      {/* Color Selection (only if colors exist) */}
      {colors && colors.length > 0 && onSelectColor && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-stone-900">Color / Shade:</span>
              <span className="text-stone-600 font-semibold">{selectedColor?.name || 'Select a shade'}</span>
            </div>
            <span className="text-[11px] text-stone-400 font-medium">
              {colors.filter((c) => c.inStock).length} available
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {colors.map((color) => {
              const isSelected = selectedColor?.id === color.id;
              const disabled = !color.inStock;

              return (
                <button
                  key={color.id}
                  disabled={disabled}
                  onClick={() => onSelectColor(color)}
                  className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                    disabled
                      ? 'opacity-40 cursor-not-allowed border-dashed border-stone-300 bg-stone-100 text-stone-400'
                      : isSelected
                      ? 'border-[#1b3d2b] bg-[#1b3d2b]/5 text-[#1b3d2b] ring-2 ring-[#1b3d2b]/20 shadow-xs'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                  }`}
                  title={`${color.name}${disabled ? ' (Out of Stock)' : ''}`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shadow-xs flex items-center justify-center shrink-0"
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && (
                      <Check
                        className={`w-2.5 h-2.5 ${
                          ['#ffffff', '#fff', 'white'].includes(color.hex.toLowerCase())
                            ? 'text-stone-900'
                            : 'text-white'
                        }`}
                      />
                    )}
                  </span>
                  <span>{color.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size / Volume Selection */}
      {sizes.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-stone-900">Package Volume / Weight:</span>
              <span className="text-[#1b3d2b] font-extrabold">{selectedSize?.name || selectedSize?.label || 'Select weight/size'}</span>
            </div>
            <button
              onClick={onOpenSizeGuide}
              className="text-[#1b3d2b] hover:text-emerald-950 font-bold flex items-center gap-1 text-[11px] underline underline-offset-2 cursor-pointer"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Weight Guide</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {sizes.map((size) => {
              const isSelected = selectedSize?.id === size.id;
              const disabled = !size.inStock;

              return (
                <button
                  key={size.id}
                  disabled={disabled}
                  onClick={() => onSelectSize(size)}
                  className={`relative p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    disabled
                      ? 'opacity-40 cursor-not-allowed border-dashed border-stone-300 bg-stone-100 text-stone-400'
                      : isSelected
                      ? 'border-[#1b3d2b] bg-[#1b3d2b]/5 text-[#1b3d2b] ring-2 ring-[#1b3d2b]/25 shadow-sm'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50/80 shadow-2xs'
                  }`}
                >
                  {size.badge && (
                    <span className="absolute -top-2.5 right-2 bg-amber-400 text-stone-950 font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs border border-amber-300">
                      {size.badge}
                    </span>
                  )}
                  <span className={`text-xs font-bold ${isSelected ? 'text-[#1b3d2b]' : 'text-stone-900'}`}>{size.name}</span>
                  <span className={`text-[11px] font-bold ${disabled ? 'text-stone-400' : isSelected ? 'text-[#1b3d2b]' : 'text-amber-800'}`}>
                    {disabled ? 'Sold Out' : size.formattedPrice || size.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
