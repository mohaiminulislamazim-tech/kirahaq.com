import React, { useState, useMemo, useEffect } from 'react';
import { 
  Star, Heart, ShoppingBag, Eye, Search, SlidersHorizontal, 
  ArrowLeft, Check, Sparkles, Filter, ChevronRight, PackageCheck, Tag, Percent, X, Flame
} from 'lucide-react';
import { Product, Currency, Category, formatProductPrice, getProductPriceInfo, DiscountOfferFilter, isProductEligibleForDiscountFilter } from '../types';

interface ProductsPageProps {
  products: Product[];
  currency: Currency;
  wishlistIds: string[];
  activeCategory: Category;
  onSelectCategory: (cat: Category) => void;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onGoHome: () => void;
  onOpenAdminPanel: () => void;
  initialDiscountFilter?: boolean;
  activeOfferFilter?: DiscountOfferFilter | null;
  onClearOfferFilter?: () => void;
}

export function ProductsPage({
  products,
  currency,
  wishlistIds,
  activeCategory,
  onSelectCategory,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  onGoHome,
  onOpenAdminPanel,
  initialDiscountFilter = false,
  activeOfferFilter = null,
  onClearOfferFilter,
}: ProductsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'discount' | 'newest'>('featured');
  const [onlyDiscounted, setOnlyDiscounted] = useState(initialDiscountFilter || Boolean(activeOfferFilter));
  const [currentOfferFilter, setCurrentOfferFilter] = useState<DiscountOfferFilter | null>(activeOfferFilter);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  useEffect(() => {
    if (activeOfferFilter) {
      setCurrentOfferFilter(activeOfferFilter);
      setOnlyDiscounted(true);
    }
  }, [activeOfferFilter]);

  const categories: Category[] = [
    'All',
    'Pure Honey',
    'Natural Foods',
    'Sunnah Products',
    'Gift Packs',
    'Health Consultation'
  ];

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (activeCategory !== 'All') {
      result = result.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // Specific Offer range filter (e.g. 25% - 75% OFF, or Fix / Flat Deals)
    if (currentOfferFilter) {
      const min = currentOfferFilter.min ?? 1;
      const max = currentOfferFilter.max ?? 100;
      const discType = currentOfferFilter.discountType || 'percentage';
      const minFlat = currentOfferFilter.minFlat;
      const maxFlat = currentOfferFilter.maxFlat;
      result = result.filter((p) => isProductEligibleForDiscountFilter(p, currency, min, max, discType, minFlat, maxFlat));
    } else if (onlyDiscounted) {
      // General discounted filter
      result = result.filter((p) => isProductEligibleForDiscountFilter(p, currency, 1, 100, 'all'));
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.benefits.some((b) => b.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => getProductPriceInfo(a, currency).currentPriceUsd - getProductPriceInfo(b, currency).currentPriceUsd);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => getProductPriceInfo(b, currency).currentPriceUsd - getProductPriceInfo(a, currency).currentPriceUsd);
    } else if (sortBy === 'discount') {
      result.sort((a, b) => (getProductPriceInfo(b, currency).discountPercentage || 0) - (getProductPriceInfo(a, currency).discountPercentage || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      result.reverse();
    }

    return result;
  }, [products, activeCategory, searchQuery, sortBy, onlyDiscounted, currentOfferFilter, currency]);

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
    <div className="min-h-screen bg-stone-50/60 pb-16 pt-4">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <button
            onClick={onGoHome}
            className="hover:text-[#1b3d2b] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-bold">All Products Catalogue</span>
        </div>
      </div>

      {/* Page Header Banner */}
      <div className="bg-[#1b3d2b] text-white py-10 px-4 mb-8 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Full Store Collection • {products.length} Items Live</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              All Pure & Sunnah Products
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 max-w-xl">
              Explore 100% authentic honey, organic seeds, prophetic medicine, and natural wellness essentials.
            </p>
          </div>

          <div className="flex items-center gap-3">
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Active Discount Offer / Campaign Banner */}
        {currentOfferFilter && (
          <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-stone-900 text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-purple-700/50 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-extrabold text-xl shrink-0 shadow-md">
                <Flame className="w-6 h-6 fill-stone-950 text-stone-950" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/25 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider border border-amber-400/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Special Discount Filter</span>
                  </span>
                  <span className="text-xs font-bold text-amber-200">
                    {currentOfferFilter.discountType === 'flat' 
                      ? 'Fix / Flat Discount Deals' 
                      : currentOfferFilter.discountType === 'all'
                      ? 'All Exclusive Discount Deals'
                      : `${currentOfferFilter.min}% - ${currentOfferFilter.max}% Discount Deals`}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {currentOfferFilter.title} {currentOfferFilter.subtitle ? `• ${currentOfferFilter.subtitle}` : ''}
                </h3>
                <p className="text-xs text-purple-200 mt-1">
                  Showing <strong>{filteredProducts.length}</strong> product(s) eligible for {currentOfferFilter.discountType === 'flat' ? 'flat discount' : `${currentOfferFilter.min}% - ${currentOfferFilter.max}% discount`}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setCurrentOfferFilter(null);
                  if (onClearOfferFilter) onClearOfferFilter();
                }}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 hover:border-white/40 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Offer Filter</span>
              </button>
            </div>
          </div>
        )}

        {/* Controls Bar: Search, Category Tabs, Sorting */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-stone-200/80 mb-8 space-y-4">
          
          {/* Top row: Search input & Sorting */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by title, ingredient or benefits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] focus:border-transparent outline-none transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-700 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort & Count */}
            <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
              <span className="text-xs text-stone-500 font-semibold">
                Showing <strong className="text-stone-900">{filteredProducts.length}</strong> of {products.length} products
              </span>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#1b3d2b] outline-none font-bold text-stone-800 cursor-pointer"
                >
                  <option value="featured">Featured / Default</option>
                  <option value="discount">⚡ Highest Discount %</option>
                  <option value="newest">Newest Uploaded</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom row: Category Filter Pills & Discount Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 no-scrollbar border-t border-stone-100">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>

            {/* Discount Deals Filter Pill */}
            <button
              onClick={() => {
                if (currentOfferFilter) {
                  setCurrentOfferFilter(null);
                  if (onClearOfferFilter) onClearOfferFilter();
                }
                setOnlyDiscounted(!onlyDiscounted);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                onlyDiscounted || currentOfferFilter
                  ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
              }`}
            >
              <Percent className="w-3 h-3" />
              <span>{currentOfferFilter ? `${currentOfferFilter.min}%-${currentOfferFilter.max}% OFF Active` : 'Special Offers / On Sale'}</span>
              {(onlyDiscounted || currentOfferFilter) && <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">Active</span>}
            </button>

            <span className="text-stone-300">|</span>

            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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

        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => {
              const isWishlisted = wishlistIds.includes(product.id);
              const isAdded = addedToast === product.id;
              const priceInfo = getProductPriceInfo(product, currency);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group overflow-hidden justify-between"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-stone-100 cursor-pointer" onClick={() => onQuickView(product)}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badges */}
                    <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
                      {product.badge && (
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-extrabold uppercase bg-amber-500 text-stone-950 shadow-xs">
                          {product.badge}
                        </span>
                      )}
                      {priceInfo.hasDiscount && (
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-md text-[9px] sm:text-[10px] font-extrabold uppercase bg-rose-600 text-white shadow-md flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />
                          {priceInfo.badgeLabel}
                        </span>
                      )}
                      {product.weight && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-stone-900/80 text-white backdrop-blur-xs">
                          {product.weight}
                        </span>
                      )}
                    </div>

                    {/* Quick Action Overlay */}
                    <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickView(product);
                        }}
                        className="px-3 py-2 bg-white text-stone-900 rounded-xl text-xs font-bold hover:bg-amber-400 shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Quick View</span>
                      </button>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
                    <div>
                      {/* Rating & Sunnah Tag */}
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                          <span>{product.rating.toFixed(1)}</span>
                          <span className="text-stone-400 font-normal text-[10px]">({product.reviewCount})</span>
                        </div>

                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {product.category}
                        </span>
                      </div>

                      {/* Product Name */}
                      <h3
                        onClick={() => onQuickView(product)}
                        className="font-bold text-stone-900 text-sm sm:text-base leading-snug line-clamp-2 hover:text-[#1b3d2b] transition-colors cursor-pointer mb-1.5"
                      >
                        {product.name}
                      </h3>

                      {/* Description */}
                      <p className="text-stone-600 text-xs line-clamp-2 mb-2">
                        {product.description}
                      </p>
                    </div>

                    {/* Price and Cart Row */}
                    <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap mt-auto">
                      {formatPrice(product)}

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Wishlist */}
                        <button
                          onClick={() => onToggleWishlist(product)}
                          className={`p-2 rounded-xl border transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
                            isWishlisted
                              ? 'bg-red-50 border-red-200 text-red-600'
                              : 'border-stone-200 text-stone-500 hover:text-red-500 hover:bg-stone-50'
                          }`}
                          title="Wishlist"
                          aria-label="Add to wishlist"
                        >
                          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
                        </button>

                        {/* Add to Cart */}
                        <button
                          onClick={() => handleAddToCart(product)}
                          className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer min-h-[36px] whitespace-nowrap ${
                            isAdded
                              ? 'bg-emerald-700 text-white'
                              : 'bg-[#1b3d2b] hover:bg-[#132c1e] text-white'
                          }`}
                        >
                          {isAdded ? (
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
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 my-8">
            <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-1">No products found</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mb-6">
              We couldn't find any products matching your search query or category filter. Try clearing your filters or searching for something else.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                onSelectCategory('All');
              }}
              className="px-5 py-2.5 bg-[#1b3d2b] text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              Reset Filters & Show All Products
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
