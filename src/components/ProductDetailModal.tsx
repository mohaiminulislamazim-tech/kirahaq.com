import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { X, Star, ShoppingBag, Heart, Check, Sparkles, Tag, Plus, Minus, Bell, Scale } from 'lucide-react';
import { Product, Currency, getProductPriceInfo, formatProductPrice, ProductWeightVariant } from '../types';
import { KiraHaqLogo } from './KiraHaqLogo';
import { ProductVideoPlayer } from './product/ProductVideoPlayer';

interface ProductDetailModalProps {
  product: Product | null;
  currency: Currency;
  onClose: () => void;
  onAddToCart: (p: Product, qty: number) => void;
  onToggleWishlist: (p: Product) => void;
  isWishlisted: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currency,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted
}) => {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductWeightVariant | null>(null);

  useEffect(() => {
    if (product && product.weightVariants && product.weightVariants.length > 0) {
      // Find the variant with highest savings (to match what was highlighted in the catalog preview)
      let bestVariant = product.weightVariants[0];
      let maxSavings = -1;
      for (const v of product.weightVariants) {
        const info = getProductPriceInfo({ ...product, selectedWeightVariant: v }, currency);
        const savings = currency === 'BDT' ? info.savingsBdt : (currency === 'MYR' ? info.savingsMyr : info.savingsUsd);
        if (savings > maxSavings) {
          maxSavings = savings;
          bestVariant = v;
        }
      }
      setSelectedVariant(bestVariant);
    } else {
      setSelectedVariant(null);
    }
    setQty(1);
  }, [product, currency]);

  if (!product) return null;

  const effectiveProduct: Product = selectedVariant
    ? {
        ...product,
        weight: selectedVariant.weight,
        priceBdt: selectedVariant.priceBdt,
        priceUsd: selectedVariant.priceUsd,
        priceMyr: selectedVariant.priceMyr ?? parseFloat((selectedVariant.priceUsd * 4.7).toFixed(2)),
        originalPriceBdt: selectedVariant.originalPriceBdt,
        originalPriceUsd: selectedVariant.originalPriceUsd,
        originalPriceMyr: selectedVariant.originalPriceMyr,
        discountType: selectedVariant.discountType,
        discountPercentage: selectedVariant.discountPercentage,
        discountAmountBdt: selectedVariant.discountAmountBdt,
        discountAmountMyr: selectedVariant.discountAmountMyr,
        discountAmountUsd: selectedVariant.discountAmountUsd,
        isDiscountActive: selectedVariant.isDiscountActive,
        badge: selectedVariant.dealText || selectedVariant.badge || product.badge,
        stock: selectedVariant.stock ?? product.stock,
        inStock: selectedVariant.inStock !== false && (selectedVariant.stock === undefined || selectedVariant.stock > 0),
        selectedWeightVariant: selectedVariant,
      }
    : product;

  const effectiveStock = effectiveProduct.stock !== undefined ? effectiveProduct.stock : 99;

  const handleAdd = () => {
    onAddToCart(effectiveProduct, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const imageSlides: string[] = [];
  if (product.images && product.images.length > 0) {
    product.images.forEach(img => {
      if (img && !imageSlides.includes(img)) imageSlides.push(img);
    });
  }
  if (product.image && !imageSlides.includes(product.image)) {
    imageSlides.unshift(product.image);
  }
  if (imageSlides.length === 0 && product.image) {
    imageSlides.push(product.image);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100 cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mobile Logo Centered */}
        <div className="md:hidden flex justify-center mb-4">
          <KiraHaqLogo size="sm" showSubtitle={false} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Image Slider & Video Below */}
          <div className="space-y-4">
            <div className="w-full h-[280px] sm:h-[320px] rounded-2xl overflow-hidden bg-amber-50 border border-amber-200 relative">
              <Swiper
                key={product.id}
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                observer={true}
                observeParents={true}
                onSwiper={(s) => {
                  setSwiperInstance(s);
                  setActiveIndex(s.activeIndex);
                }}
                onSlideChange={(s) => setActiveIndex(s.activeIndex)}
                navigation={true}
                pagination={{ clickable: true }}
                autoplay={{
                  delay: 3500,
                  disableOnInteraction: false,
                }}
                className="w-full h-full"
              >
                {imageSlides.map((imgUrl, index) => (
                  <SwiperSlide key={index} className="w-full h-full flex items-center justify-center">
                    <img
                      src={imgUrl}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            
            {/* Thumbnails */}
            {imageSlides.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {imageSlides.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => swiperInstance?.slideTo(index)}
                    className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      activeIndex === index ? 'border-[#1b3d2b] shadow-xs' : 'border-stone-200 hover:border-amber-500'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Video Section Directly Below Images */}
            {product.videoUrl && product.videoUrl.trim() && (
              <div className="pt-2">
                <ProductVideoPlayer
                  videoUrl={product.videoUrl}
                  productName={product.name}
                  title="Product Video"
                  subtitle="Demonstration & Purity"
                />
              </div>
            )}
          </div>


          {/* Details */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block">
                {product.category} {effectiveProduct.weight ? `• ${effectiveProduct.weight}` : ''}
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#1b3d2b] mt-1">
                {product.name}
              </h2>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-stone-700">
                  {product.rating.toFixed(1)} ({product.reviewCount} customer reviews)
                </span>
              </div>
            </div>

            {/* Price Box */}
            {(() => {
              const priceInfo = getProductPriceInfo(effectiveProduct, currency);
              return (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-[15px] font-extrabold text-stone-900">
                      {priceInfo.currentPriceFormatted}
                    </span>
                    {priceInfo.hasDiscount && (
                      <>
                        <span className="text-[12px] text-stone-400 line-through font-semibold">
                          {priceInfo.regularPriceFormatted}
                        </span>
                        <span className="text-[13px] font-extrabold text-red-700 bg-red-100/90 px-2.5 py-0.5 rounded-full border border-red-200 uppercase tracking-wide">
                          {priceInfo.discountLabel}
                        </span>
                      </>
                    )}
                  </div>
                  {priceInfo.hasDiscount && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-700 font-extrabold">
                      <Tag className="w-3.5 h-3.5 text-red-700 shrink-0" />
                      <span>Discount Deal! You save {priceInfo.savingsFormatted} ({priceInfo.discountLabel})</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Multiple Weight / Volume Variant Options */}
            {product.weightVariants && product.weightVariants.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Select Package Volume / Weight:</span>
                  </span>
                  <span className="text-emerald-800 text-[11px] font-extrabold">
                    {effectiveProduct.weight}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.weightVariants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id || (!selectedVariant && product.weightVariants?.[0].id === variant.id);
                    const varPriceInfo = getProductPriceInfo({
                      ...product,
                      selectedWeightVariant: variant,
                    }, currency);

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-800 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-800/20'
                            : 'border-stone-200 bg-white hover:border-stone-400 text-stone-800'
                        }`}
                      >
                        {(variant.badge || varPriceInfo.hasDiscount) && (
                          <span className={`absolute -top-2 right-2 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full shadow-2xs ${variant.badge ? 'bg-amber-400 text-stone-950 border border-amber-500' : 'bg-red-600 text-white'}`}>
                            {variant.badge || varPriceInfo.discountLabel}
                          </span>
                        )}
                        <span className="text-xs font-bold block">{variant.weight}</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-[11px] font-extrabold text-stone-900">{varPriceInfo.currentPriceFormatted}</span>
                          {varPriceInfo.hasDiscount && (
                            <span className="text-[9px] text-stone-400 line-through">{varPriceInfo.regularPriceFormatted}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-stone-600 text-xs leading-relaxed">
              {product.description}
            </p>

            {/* Sunnah Fact Callout */}
            {product.sunnahFact && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <span className="font-bold flex items-center gap-1 text-emerald-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Prophetic Sunnah Reference:
                </span>
                <p className="italic text-emerald-950/80 text-[11px] leading-snug">
                  {product.sunnahFact}
                </p>
              </div>
            )}

            {/* Key Benefits */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-stone-900 block">Health Benefits:</span>
              <ul className="grid grid-cols-1 gap-1 text-xs text-stone-700">
                {product.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity & Actions */}
            <div className="pt-3 border-t border-stone-200 flex items-center gap-3">
              <div className="flex items-center border border-stone-300 rounded-lg bg-white h-10">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1 || !effectiveProduct.inStock}
                  className="w-9 h-full flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-stone-900">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(effectiveStock, qty + 1))}
                  disabled={!effectiveProduct.inStock || qty >= effectiveStock}
                  className="w-9 h-full flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

                {effectiveProduct.inStock ? (
                  <button
                    onClick={handleAdd}
                    disabled={!effectiveProduct.inStock}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                      added ? 'bg-emerald-800 text-white' : 'bg-[#1b3d2b] hover:bg-[#132c1e] text-white'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>{added ? 'Added To Bag!' : 'Add To Shopping Bag'}</span>
                  </button>
                ) : (
                  !showNotifyForm ? (
                    <button
                      onClick={() => setShowNotifyForm(true)}
                      className="flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                    >
                      <Bell className="w-4 h-4" />
                      <span>Notify Me When Back</span>
                    </button>
                  ) : (
                    <div className="flex-1 flex gap-2">
                      {notifySubmitted ? (
                        <span className="flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-4 h-4" />
                          <span>Notified!</span>
                        </span>
                      ) : (
                        <>
                          <input
                            type="email"
                            placeholder="Enter your email"
                            value={notifyEmail}
                            onChange={(e) => setNotifyEmail(e.target.value)}
                            className="flex-1 px-4 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#1b3d2b] outline-none"
                          />
                          <button
                            onClick={() => setNotifySubmitted(true)}
                            className="px-4 py-2 bg-[#1b3d2b] text-white rounded-xl font-bold text-xs hover:bg-[#132c1e] cursor-pointer"
                          >
                            Submit
                          </button>
                        </>
                      )}
                    </div>
                  )
                )}

                <button
                  onClick={() => onToggleWishlist(effectiveProduct)}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                    isWishlisted ? 'bg-red-50 border-red-200 text-red-600' : 'border-stone-200 text-stone-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
                </button>
              </div>

          </div>

        </div>

      </div>
    </div>
  );
};
