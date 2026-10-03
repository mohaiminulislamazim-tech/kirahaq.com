import React, { useState } from 'react';
import { Star, Heart, ShoppingBag, Eye, ArrowRight, Check, Tag } from 'lucide-react';
import { Product, Currency, Category, formatProductPrice, getProductPriceInfo } from '../types';

interface FeaturedProductsProps {
  products: Product[];
  currency: Currency;
  wishlistIds: string[];
  activeCategory: Category;
  onSelectCategory: (cat: Category) => void;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onViewAllProducts?: () => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  currency,
  wishlistIds,
  activeCategory,
  onSelectCategory,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  onViewAllProducts
}) => {
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const categories: Category[] = [
    'All',
    'Pure Honey',
    'Natural Foods',
    'Sunnah Products',
    'Gift Packs'
  ];

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const handleAddToCart = (product: Product) => {
    onAddToCart(product);
    setAddedToast(product.id);
    setTimeout(() => {
      setAddedToast(null);
    }, 2000);
  };

  const formatPrice = (p: Product) => {
    const priceInfo = getProductPriceInfo(p, currency);
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[14px] font-extrabold text-stone-900">
            {priceInfo.currentPriceFormatted}
          </span>
          {priceInfo.hasDiscount && (
            <span className="text-xs text-stone-400 line-through font-semibold">
              {priceInfo.regularPriceFormatted}
            </span>
          )}
        </div>
        {priceInfo.hasDiscount && (
          <span 
            className="text-[16px] font-extrabold text-red-600 mt-0.5 whitespace-nowrap" 
          >
            {priceInfo.discountLabel}
          </span>
        )}
      </div>
    );
  };

  return (
    <section id="products-section" className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-1">
              OUR BEST SELLERS
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1b3d2b]">
              Featured Products
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onViewAllProducts) onViewAllProducts();
                else onSelectCategory('All');
              }}
              className="text-xs font-bold text-[#1b3d2b] hover:text-amber-700 flex items-center gap-1.5 hover:underline cursor-pointer bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200"
            >
              <span>Explore All Products Page</span>
              <ArrowRight className="w-4 h-4 text-amber-700" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar border-b border-stone-100">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1b3d2b] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid (Strictly Max 8 Items on Home Page) */}
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.slice(0, 8).map((product) => {
            const isWishlisted = wishlistIds.includes(product.id);
            const isAdded = addedToast === product.id;

            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-stone-200 hover:border-amber-400 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Container */}
                <div className="relative aspect-4/3 bg-stone-50 overflow-hidden cursor-pointer" onClick={() => onQuickView(product)}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${(product.stock ?? 0) <= 0 ? 'grayscale' : ''}`}
                  />

                  {/* Sold Out Badge Overlay */}
                  {(product.stock ?? 0) <= 0 && (
                    <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center">
                      <span className="bg-white text-stone-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                        Sold Out
                      </span>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
                    {(product.stock ?? 0) > 0 && product.badge && (
                      <span className="bg-amber-500 text-stone-950 text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md tracking-wider uppercase shadow-xs">
                        {product.badge}
                      </span>
                    )}
                    {(product.stock ?? 0) > 0 && getProductPriceInfo(product, currency).hasDiscount && (
                      <span className="bg-rose-600 text-white text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-md tracking-wider uppercase shadow-md flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />
                        {getProductPriceInfo(product, currency).badgeLabel}
                      </span>
                    )}
                  </div>

                  {/* Quick View Hover Button */}
                  {(product.stock ?? 0) > 0 && (
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickView(product);
                        }}
                        className="px-3.5 py-1.5 bg-white text-stone-900 text-xs font-semibold rounded-full shadow-md hover:bg-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Quick View
                      </button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-3">
                  <div>
                    {/* Rating */}
                    <div className="flex items-center gap-1.5 text-xs text-amber-500">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="font-semibold text-stone-800 text-[10px] sm:text-[11px] mt-0.5">
                        {product.rating.toFixed(1)} ({product.reviewCount})
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 
                      onClick={() => onQuickView(product)}
                      className="font-serif font-bold text-stone-900 hover:text-[#1b3d2b] text-sm sm:text-base mt-1 cursor-pointer line-clamp-1"
                    >
                      {product.name}
                    </h3>

                    {/* Short Description */}
                    <p className="text-stone-500 text-xs mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  {/* Price & Actions */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                    {formatPrice(product)}

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Wishlist Button */}
                      <button
                        onClick={() => onToggleWishlist(product)}
                        className={`p-2 rounded-lg border transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
                          isWishlisted
                            ? 'bg-red-50 border-red-200 text-red-600'
                            : 'border-stone-200 text-stone-500 hover:text-red-500 hover:bg-stone-50'
                        }`}
                        title="Wishlist"
                        aria-label="Add to Wishlist"
                      >
                        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
                      </button>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => (product.stock ?? 0) > 0 && handleAddToCart(product)}
                        disabled={(product.stock ?? 0) <= 0}
                        className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs min-h-[36px] whitespace-nowrap ${
                          (product.stock ?? 0) <= 0
                            ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                            : isAdded
                            ? 'bg-emerald-700 text-white cursor-pointer'
                            : 'bg-[#1b3d2b] hover:bg-[#132c1e] text-white cursor-pointer'
                        }`}
                      >
                        {(product.stock ?? 0) <= 0 ? (
                          <span>Out Of Stock</span>
                        ) : isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* View All Products Page CTA */}
        {onViewAllProducts && (
          <div className="mt-10 text-center">
            <button
              onClick={onViewAllProducts}
              className="px-8 py-3.5 bg-[#1b3d2b] hover:bg-emerald-900 text-amber-300 font-extrabold text-sm rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer inline-flex items-center gap-2 border border-amber-400/30"
            >
              <span>View All Products Page ({products.length} Items Available)</span>
              <ArrowRight className="w-4.5 h-4.5 text-amber-400" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
