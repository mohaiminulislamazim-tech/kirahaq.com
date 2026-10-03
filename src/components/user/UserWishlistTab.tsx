import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight, Star } from 'lucide-react';
import { Product, Currency, formatProductPrice } from '../../types';

interface UserWishlistTabProps {
  wishlistProducts: Product[];
  currency: Currency;
  onAddToCart: (product: Product) => void;
  onRemoveFromWishlist: (product: Product) => void;
  onExploreProducts: () => void;
}

export const UserWishlistTab: React.FC<UserWishlistTabProps> = ({
  wishlistProducts,
  currency,
  onAddToCart,
  onRemoveFromWishlist,
  onExploreProducts,
}) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-5">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span>Saved Wishlist ({wishlistProducts.length})</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Your saved Sunnah products & organic foods for quick re-ordering.
          </p>
        </div>

        {wishlistProducts.length > 0 && (
          <button
            onClick={() => {
              wishlistProducts.forEach((p) => onAddToCart(p));
            }}
            className="px-4 py-2 bg-[#1b3d2b] hover:bg-emerald-950 text-amber-400 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Move All To Cart</span>
          </button>
        )}
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-16 bg-stone-50/70 rounded-3xl border border-dashed border-stone-300 space-y-3">
          <Heart className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-serif font-bold text-stone-800">Your Wishlist is Empty</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            You haven't saved any products yet. Browse our pure honey, Sidr nectar, and Sunnah items to add them here.
          </p>
          <button
            onClick={onExploreProducts}
            className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 bg-[#1b3d2b] text-white text-xs font-bold rounded-xl hover:bg-emerald-900 transition-colors cursor-pointer"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishlistProducts.map((product) => (
            <div
              key={product.id}
              className="bg-stone-50/60 rounded-2xl border border-stone-200/80 p-4 space-y-3 hover:border-amber-400/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="relative h-44 rounded-xl overflow-hidden bg-white">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-[#1b3d2b] text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {product.category}
                  </span>
                  <button
                    onClick={() => onRemoveFromWishlist(product)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-rose-500 hover:text-white text-stone-600 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mb-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                    <span className="text-stone-400 font-normal">({product.reviewCount})</span>
                  </div>
                  <h3 className="font-serif font-bold text-stone-900 text-sm line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">{product.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-2">
                <span className="text-base font-serif font-extrabold text-[#1b3d2b]">
                  {formatProductPrice(product, currency)}
                </span>
                <button
                  onClick={() => onAddToCart(product)}
                  className="px-3.5 py-2 bg-[#1b3d2b] hover:bg-emerald-950 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
