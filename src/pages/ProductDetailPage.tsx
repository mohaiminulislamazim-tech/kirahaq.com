import React, { useState, useEffect, useRef } from 'react';
import { 
  Star, Heart, ShoppingBag, ArrowLeft, ShieldCheck, Truck, 
  RotateCcw, Sparkles, CheckCircle2, ChevronRight, Share2, Info, 
  Tag, Percent, Clock, Lock, Award, Check, AlertCircle, Copy
} from 'lucide-react';
import { 
  Product, Currency, formatProductPrice, formatSubtotal, getProductPriceInfo, 
  ProductPriceInfo, Review 
} from '../types';
import { ProductImageGallery } from '../components/product/ProductImageGallery';
import { 
  ProductVariantSelector, ProductSizeVariant 
} from '../components/product/ProductVariantSelector';
import { ProductTabsAccordion } from '../components/product/ProductTabsAccordion';
import { ProductReviewsSection } from '../components/product/ProductReviewsSection';
import { StickyAddToCartBar } from '../components/product/StickyAddToCartBar';
import { SizeGuideModal } from '../components/product/SizeGuideModal';
import { KiraHaqLogo } from '../components/KiraHaqLogo';
import { testimonials } from '../data/testimonials';
import { SiteSettings } from '../types';

interface ProductDetailPageProps {
  product: Product | null;
  allProducts: Product[];
  currency: Currency;
  wishlistIds: string[];
  siteSettings?: SiteSettings;
  customLogoUrl?: string;
  onAddToCart: (p: Product, qty: number) => void;
  onToggleWishlist: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onGoBack: () => void;
  onBuyNow: (p: Product, qty: number) => void;
  onGoHome?: () => void;
}

export function ProductDetailPage({
  product,
  allProducts,
  currency,
  wishlistIds,
  siteSettings,
  customLogoUrl,
  onAddToCart,
  onToggleWishlist,
  onSelectProduct,
  onGoBack,
  onBuyNow,
  onGoHome,
}: ProductDetailPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const purchaseSectionRef = useRef<HTMLDivElement>(null);

  // Variant definitions for package volume/weight or apparel sizes
  const isClothing = product?.category?.toLowerCase().includes('fashion') || product?.category?.toLowerCase().includes('apparel') || product?.category?.toLowerCase().includes('clothing');

  const defaultSizes: ProductSizeVariant[] = React.useMemo(() => {
    if (!product) return [];

    if (product.weightVariants && product.weightVariants.length > 0) {
      return product.weightVariants.map((v) => {
        const vPriceInfo = getProductPriceInfo({ ...product, selectedWeightVariant: v }, currency);
        const variantBadge = v.badge || v.dealText || (vPriceInfo.hasDiscount ? vPriceInfo.discountLabel : undefined);
        return {
          id: v.id,
          name: v.weight,
          label: vPriceInfo.currentPriceFormatted,
          formattedPrice: vPriceInfo.currentPriceFormatted,
          inStock: v.inStock !== false && product.inStock,
          badge: variantBadge,
          variantData: v,
        };
      });
    }

    if (isClothing) {
      return [
        { id: 's1', name: 'S', label: 'Chest 36-38"', inStock: true },
        { id: 's2', name: 'M', label: 'Chest 38-40"', inStock: true, badge: 'POPULAR' },
        { id: 's3', name: 'L', label: 'Chest 40-42"', inStock: true },
        { id: 's4', name: 'XL', label: 'Chest 42-44"', inStock: false },
      ];
    }

    return [
      { id: 's1', name: product.weight || '500g Jar', label: formatProductPrice(product, currency), formattedPrice: formatProductPrice(product, currency), inStock: product.inStock, badge: 'STANDARD' },
    ];
  }, [product, currency, isClothing]);

  const [selectedSize, setSelectedSize] = useState<ProductSizeVariant | null>(defaultSizes[0] || null);

  // Scroll observer to trigger Sticky Purchase Bar
  useEffect(() => {
    const handleScroll = () => {
      if (!purchaseSectionRef.current) return;
      const rect = purchaseSectionRef.current.getBoundingClientRect();
      // Show sticky bar when the main purchase actions pass the top of the viewport
      if (rect.bottom < 100) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset variant defaults on product change
  useEffect(() => {
    if (product) {
      setSelectedSize(defaultSizes[0] || null);
      setQuantity(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product?.id, defaultSizes]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-800">No Product Selected</h2>
        <p className="text-xs text-stone-500 max-w-sm">Please return to the product catalogue to select a natural product.</p>
        <button
          onClick={onGoBack}
          className="px-6 py-3 bg-[#1b3d2b] text-white text-xs font-bold rounded-2xl shadow-sm hover:bg-emerald-950 transition-colors cursor-pointer"
        >
          Return to Catalogue
        </button>
      </div>
    );
  }

  const activeVariant = selectedSize?.variantData || null;

  const effectiveProduct: Product = React.useMemo(() => {
    if (!activeVariant) {
      return {
        ...product,
        weight: selectedSize?.name || product.weight,
      };
    }
    return {
      ...product,
      weight: activeVariant.weight,
      priceBdt: activeVariant.priceBdt,
      priceUsd: activeVariant.priceUsd,
      priceMyr: activeVariant.priceMyr,
      originalPriceBdt: activeVariant.originalPriceBdt,
      originalPriceUsd: activeVariant.originalPriceUsd,
      originalPriceMyr: activeVariant.originalPriceMyr,
      discountType: activeVariant.discountType || product.discountType,
      discountPercentage: typeof activeVariant.discountPercentage === 'number' ? activeVariant.discountPercentage : product.discountPercentage,
      discountAmountBdt: typeof activeVariant.discountAmountBdt === 'number' ? activeVariant.discountAmountBdt : product.discountAmountBdt,
      discountAmountUsd: typeof activeVariant.discountAmountUsd === 'number' ? activeVariant.discountAmountUsd : product.discountAmountUsd,
      discountAmountMyr: typeof activeVariant.discountAmountMyr === 'number' ? activeVariant.discountAmountMyr : product.discountAmountMyr,
      isDiscountActive: activeVariant.isDiscountActive !== undefined ? activeVariant.isDiscountActive : product.isDiscountActive,
      badge: activeVariant.badge || activeVariant.dealText || product.badge,
      stock: typeof activeVariant.stock === 'number' ? activeVariant.stock : product.stock,
      inStock: activeVariant.inStock !== false && product.inStock,
      selectedWeightVariant: activeVariant,
    };
  }, [product, activeVariant, selectedSize?.name]);

  const isWishlisted = wishlistIds.includes(product.id);
  const priceInfo = getProductPriceInfo(effectiveProduct, currency);

  // Dynamic stock calculations
  const effectiveStock = effectiveProduct.stock || 15;
  const isLowStock = effectiveProduct.inStock && effectiveStock > 0 && effectiveStock <= 5;

  const handleAdd = () => {
    if (!effectiveProduct.inStock) return;
    onAddToCart(effectiveProduct, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2200);
  };

  const handleBuy = () => {
    if (!effectiveProduct.inStock) return;
    onBuyNow(effectiveProduct, quantity);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Kira Haq Natural Organics!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  // Fallback related products if none in same category
  const displayRelated = relatedProducts.length > 0
    ? relatedProducts
    : allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  // Delivery estimation calculations
  const today = new Date();
  const deliveryStart = new Date(today);
  deliveryStart.setDate(today.getDate() + 1);
  const deliveryEnd = new Date(today);
  deliveryEnd.setDate(today.getDate() + 3);

  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  const deliveryRange = `${deliveryStart.toLocaleDateString('en-US', dateOptions)} – ${deliveryEnd.toLocaleDateString('en-US', dateOptions)}`;

  return (
    <div className="min-h-screen bg-stone-50/50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Navigation & Utility Bar */}
        {/* Mobile View: Centered Logo Only */}
        <div className="sm:hidden flex items-center justify-center py-1">
          <div 
            className="cursor-pointer flex items-center justify-center"
            onClick={onGoHome || onGoBack}
          >
            <KiraHaqLogo 
              size="md" 
              showSubtitle={true} 
              customLogoUrl={customLogoUrl} 
              siteSettings={siteSettings} 
            />
          </div>
        </div>

        {/* Desktop View: Full Breadcrumbs Trail & Utility Bar */}
        <div className="hidden sm:flex items-center justify-between gap-3 text-xs text-stone-500 font-medium">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button 
              onClick={onGoBack} 
              className="hover:text-[#1b3d2b] flex items-center gap-1 font-bold text-stone-700 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Products</span>
            </button>
            <ChevronRight className="w-3 h-3 text-stone-300" />
            <span className="text-stone-600 font-semibold">{product.category}</span>
            <ChevronRight className="w-3 h-3 text-stone-300" />
            <span className="text-stone-900 font-bold truncate max-w-[180px] sm:max-w-xs">{product.name}</span>
          </div>

          {/* Share Action */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-stone-700 hover:text-stone-900 hover:border-stone-300 shadow-2xs transition-colors cursor-pointer shrink-0"
            title="Share this product"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-800 font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>
        </div>

        {/* Master Product Details Bento Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-stone-200/80 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column (5/12 or 6/12): Product Image Slider, Gallery & Lens */}
          <div className="lg:col-span-6 space-y-6">
            <ProductImageGallery
              product={product}
              priceInfo={priceInfo}
              isWishlisted={isWishlisted}
              onToggleWishlist={() => onToggleWishlist(product)}
            />

            {/* Quick Guarantees Bar */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100/90 flex flex-col items-center text-center">
                <ShieldCheck className="w-5 h-5 text-emerald-800 mb-1" />
                <span className="text-[11px] font-bold text-emerald-950">100% Authentic</span>
                <span className="text-[9px] text-emerald-700/80">Certified Pure</span>
              </div>
              <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-100/90 flex flex-col items-center text-center">
                <Truck className="w-5 h-5 text-amber-800 mb-1" />
                <span className="text-[11px] font-bold text-amber-950">Express Delivery</span>
                <span className="text-[9px] text-amber-700/80">Dispatched in 24h</span>
              </div>
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 flex flex-col items-center text-center">
                <RotateCcw className="w-5 h-5 text-stone-700 mb-1" />
                <span className="text-[11px] font-bold text-stone-800">7-Day Returns</span>
                <span className="text-[9px] text-stone-500">Hassle-Free</span>
              </div>
            </div>
          </div>

          {/* Right Column (6/12 or 7/12): Product Information & Interactive Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Category, SKU & Ratings */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                    {product.category}
                  </span>
                  <span className="text-[11px] font-mono text-stone-400 font-medium">
                    SKU: KH-{product.id.toUpperCase()}
                  </span>
                </div>

                {/* Rating score badge */}
                <div className="flex items-center gap-1.5 bg-amber-50/90 px-3 py-1 rounded-full border border-amber-200 text-xs font-bold text-amber-900">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(product.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-stone-400 font-normal">({product.reviewCount})</span>
                </div>
              </div>

              {/* Product Title & Subtitle */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 leading-tight">
                  {product.name}
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
                  {product.weight ? `${product.weight} • Pure Sunnah Wellness Grade` : 'Pure Organics & Healing Heritage Formulation'}
                </p>
              </div>

              {/* Pricing Bento Section */}
              <div className="bg-stone-50/90 p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    {/* Current and Regular Price */}
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-[14px] font-extrabold text-stone-900">
                        {priceInfo.currentPriceFormatted}
                      </span>
                      {priceInfo.hasDiscount && (
                        <>
                          <span className="text-[12px] text-stone-400 line-through font-semibold">
                            {priceInfo.regularPriceFormatted}
                          </span>
                          <span className="text-[16px] font-extrabold text-red-700 bg-red-100/90 px-3 py-0.5 rounded-full border border-red-200 uppercase tracking-wide">
                            {priceInfo.discountLabel}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Discount Deal line */}
                    {priceInfo.hasDiscount && (
                      <div className="mt-2 flex items-center gap-1.5 text-[16px] text-red-700 font-extrabold">
                        <Tag className="w-4 h-4 text-red-700 shrink-0" />
                        <span>Discount Deal! You save {priceInfo.savingsFormatted} ({priceInfo.discountLabel})</span>
                      </div>
                    )}
                  </div>

                  {/* Stock Availability Badge */}
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                      !product.inStock 
                        ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                        : isLowStock 
                        ? 'bg-amber-100 text-amber-900 border border-amber-200 animate-pulse' 
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {!product.inStock ? (
                        '✕ Out of Stock'
                      ) : isLowStock ? (
                        `⚡ Only ${effectiveStock} Left in Stock!`
                      ) : (
                        '✓ In Stock — Ready to Ship'
                      )}
                    </span>
                  </div>
                </div>

                {/* Tax and Installment Note */}
                <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between gap-2 text-[11px] text-stone-500">
                  <span>Prices inclusive of all applicable VAT & Taxes.</span>
                  <span className="text-emerald-800 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-700" /> 0% Interest Installments Available
                  </span>
                </div>
              </div>

              {/* Overview Description Snippet */}
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                {product.description}
              </p>

              {/* Dynamic Product Variant Selector */}
              <ProductVariantSelector
                sizes={defaultSizes}
                selectedSize={selectedSize}
                onSelectSize={setSelectedSize}
                onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
                category={product.category}
              />

              {/* Interactive Purchase Controls Section */}
              <div ref={purchaseSectionRef} className="space-y-4 pt-2 border-t border-stone-200">
                {/* Quantity Selector & Stock Alert */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-stone-800">Quantity:</span>
                    <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-stone-50 h-10 shadow-2xs">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1 || !effectiveProduct.inStock}
                        className="w-10 h-full flex items-center justify-center text-sm font-bold text-stone-700 hover:bg-stone-200 disabled:opacity-30 cursor-pointer transition-colors"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-10 text-center text-xs font-bold text-stone-900">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(effectiveStock, quantity + 1))}
                        disabled={!effectiveProduct.inStock || quantity >= effectiveStock}
                        className="w-10 h-full flex items-center justify-center text-sm font-bold text-stone-700 hover:bg-stone-200 disabled:opacity-30 cursor-pointer transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {effectiveProduct.inStock && (
                    <span className="text-xs text-stone-500 font-medium">
                      Subtotal: <strong className="text-stone-900">{formatSubtotal(effectiveProduct, quantity, currency)}</strong>
                    </span>
                  )}
                </div>

                {/* Primary Conversion Actions (Add to Cart + Buy Now) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={handleAdd}
                    disabled={!product.inStock}
                    className={`py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                      !product.inStock
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : addedNotice
                        ? 'bg-emerald-700 text-white'
                        : 'bg-[#1b3d2b] hover:bg-emerald-950 text-white hover:shadow-lg'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>{addedNotice ? '✓ Added to Cart!' : 'Add to Shopping Cart'}</span>
                  </button>

                  <button
                    onClick={handleBuy}
                    disabled={!product.inStock}
                    className={`py-3.5 px-6 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                      !product.inStock
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : 'bg-amber-400 hover:bg-amber-300 text-stone-950 hover:shadow-lg'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-stone-900" />
                    <span>Buy Now & Checkout</span>
                  </button>
                </div>

                {/* Wishlist Toggle Button */}
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`w-full py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isWishlisted 
                      ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold' 
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100 hover:border-stone-300'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-stone-500'}`} />
                  <span>{isWishlisted ? 'Saved in Your Wishlist' : 'Add to Wishlist'}</span>
                </button>
              </div>

              {/* Delivery & Trust Information Box */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2.5 text-xs text-stone-700">
                <div className="flex items-center gap-2.5 text-stone-900 font-bold">
                  <Truck className="w-4 h-4 text-[#1b3d2b]" />
                  <span>Estimated Delivery: <strong className="text-[#1b3d2b]">{deliveryRange}</strong></span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Free Shipping on eligible orders</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cash on Delivery (COD) available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Encrypted & Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Authenticity guaranteed or 2x refund</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Product Description, Features & Specifications Tabs/Accordions */}
        <ProductTabsAccordion product={product} />

        {/* Customer Reviews and Ratings Section */}
        <ProductReviewsSection product={product} reviews={testimonials} />

        {/* Related Products / "You May Also Like" Section */}
        {displayRelated.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">You May Also Like</h3>
                <p className="text-xs text-stone-500">Handpicked natural pairs and prophetic wellness essentials</p>
              </div>
              <button
                onClick={onGoBack}
                className="text-xs font-bold text-[#1b3d2b] hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Shop</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayRelated.map((p) => {
                const pPrice = getProductPriceInfo(p, currency);
                const isItemWishlisted = wishlistIds.includes(p.id);

                return (
                  <div
                    key={p.id}
                    className="group bg-white rounded-3xl p-4 border border-stone-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div 
                      onClick={() => onSelectProduct(p)}
                      className="cursor-pointer space-y-3"
                    >
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {pPrice.hasDiscount && (
                          <span className="absolute top-2.5 left-2.5 bg-red-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-lg shadow-sm">
                            {pPrice.discountLabel}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist(p);
                          }}
                          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-xs transition-colors cursor-pointer ${
                            isItemWishlisted 
                              ? 'bg-rose-500 text-white' 
                              : 'bg-white/80 text-stone-700 hover:bg-white hover:text-rose-600'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isItemWishlisted ? 'fill-white' : ''}`} />
                        </button>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                          {p.category}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-[#1b3d2b] transition-colors line-clamp-1">
                          {p.name}
                        </h4>
                        
                        <div className="flex items-center gap-1 text-amber-500 text-xs mt-1">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span className="font-bold text-stone-800 text-[11px]">{p.rating.toFixed(1)}</span>
                          <span className="text-stone-400 text-[10px]">({p.reviewCount})</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Add button */}
                    <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-extrabold text-stone-900">
                          {pPrice.currentPriceFormatted}
                        </span>
                        {pPrice.hasDiscount && (
                          <span className="text-[10px] text-stone-400 line-through">
                            {pPrice.regularPriceFormatted}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => onAddToCart(p, 1)}
                        className="px-3 py-2 bg-[#1b3d2b] hover:bg-emerald-950 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                        title="Add to Cart"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">Add</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Sticky Bottom Add to Cart Bar on Scroll */}
      <StickyAddToCartBar
        product={effectiveProduct}
        priceInfo={priceInfo}
        quantity={quantity}
        onIncreaseQuantity={() => setQuantity((q) => Math.min(effectiveStock, q + 1))}
        onDecreaseQuantity={() => setQuantity((q) => Math.max(1, q - 1))}
        onAddToCart={handleAdd}
        onBuyNow={handleBuy}
        isWishlisted={isWishlisted}
        onToggleWishlist={() => onToggleWishlist(effectiveProduct)}
        selectedVariantLabel={selectedSize ? `${selectedSize.name}` : undefined}
        visible={showStickyBar}
        addedNotice={addedNotice}
      />

      {/* Sizing & Measurement Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        category={product.category}
      />
    </div>
  );
}
