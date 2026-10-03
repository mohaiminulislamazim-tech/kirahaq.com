import React from 'react';
import { ShoppingBag, Sparkles, Heart } from 'lucide-react';
import { Product, ProductPriceInfo } from '../../types';

interface StickyAddToCartBarProps {
  product: Product;
  priceInfo: ProductPriceInfo;
  quantity: number;
  onIncreaseQuantity: () => void;
  onDecreaseQuantity: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  selectedVariantLabel?: string;
  visible: boolean;
  addedNotice: boolean;
}

export const StickyAddToCartBar: React.FC<StickyAddToCartBarProps> = ({
  product,
  priceInfo,
  quantity,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
  selectedVariantLabel,
  visible,
  addedNotice,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-2xl p-3 sm:py-3.5 sm:px-6 transition-all duration-300 animate-slideUp">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Product Thumbnail & Title (Hidden on tiny screens if tight) */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-stone-200 shrink-0"
          />
          <div className="min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
              {product.name}
            </h4>
            <div className="flex items-center gap-2 flex-wrap text-[11px]">
              <span className="font-extrabold text-[#1b3d2b]">
                {priceInfo.currentPriceFormatted}
              </span>
              {priceInfo.hasDiscount && (
                <span className="line-through text-stone-400 font-semibold text-[10px]">
                  {priceInfo.regularPriceFormatted}
                </span>
              )}
              {selectedVariantLabel && (
                <span className="text-stone-500 font-medium hidden sm:inline">
                  • {selectedVariantLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quantity & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quantity (hidden on very small screens) */}
          <div className="hidden sm:flex items-center border border-stone-300 rounded-xl overflow-hidden bg-stone-50 h-10">
            <button
              onClick={onDecreaseQuantity}
              disabled={quantity <= 1}
              className="px-2.5 text-xs font-bold text-stone-700 hover:bg-stone-200 disabled:opacity-30 cursor-pointer"
            >
              -
            </button>
            <span className="px-3 text-xs font-bold text-stone-900">{quantity}</span>
            <button
              onClick={onIncreaseQuantity}
              disabled={!product.inStock || quantity >= product.stock}
              className="px-2.5 text-xs font-bold text-stone-700 hover:bg-stone-200 disabled:opacity-30 cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Wishlist button */}
          <button
            onClick={onToggleWishlist}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer hidden md:flex items-center justify-center ${
              isWishlisted ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
            title="Toggle Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Add to Cart */}
          <button
            onClick={onAddToCart}
            disabled={!product.inStock}
            className="h-10 px-3.5 sm:px-5 bg-[#1b3d2b] hover:bg-emerald-950 disabled:bg-stone-300 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span className="whitespace-nowrap">{addedNotice ? 'Added!' : 'Add to Cart'}</span>
          </button>

          {/* Buy Now */}
          <button
            onClick={onBuyNow}
            disabled={!product.inStock}
            className="h-10 px-3.5 sm:px-5 bg-amber-400 hover:bg-amber-300 disabled:bg-stone-300 text-stone-950 font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-stone-900" />
            <span className="whitespace-nowrap">Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
