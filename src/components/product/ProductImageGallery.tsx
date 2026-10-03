import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut, 
  X, Tag, Sparkles, Heart, Image as ImageIcon
} from 'lucide-react';
import { Product, ProductPriceInfo } from '../../types';
import { ProductVideoPlayer } from './ProductVideoPlayer';

interface ProductImageGalleryProps {
  product: Product;
  priceInfo: ProductPriceInfo;
  selectedColorImage?: string;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  showVideoBelow?: boolean;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  product,
  priceInfo,
  selectedColorImage,
  isWishlisted,
  onToggleWishlist,
  showVideoBelow = true,
}) => {
  // Consolidate gallery images
  const images = React.useMemo<string[]>(() => {
    const list: string[] = [];

    if (selectedColorImage) {
      list.push(selectedColorImage);
    }
    if (product.image && !list.includes(product.image)) {
      list.push(product.image);
    }
    if (Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((img) => {
        if (img && !list.includes(img)) {
          list.push(img);
        }
      });
    }

    // If only 1 image exists, add complementary natural lifestyle angles
    if (list.length === 1) {
      if (product.category?.toLowerCase().includes('honey')) {
        list.push(
          'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=1000'
        );
      } else if (product.category?.toLowerCase().includes('sunnah') || product.name.toLowerCase().includes('seed')) {
        list.push(
          'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=1000'
        );
      } else {
        list.push(
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=1000'
        );
      }
    }

    return list;
  }, [product, selectedColorImage]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [isHoverZooming, setIsHoverZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Sync active index when color image changes
  useEffect(() => {
    if (selectedColorImage) {
      const idx = images.indexOf(selectedColorImage);
      if (idx !== -1) setActiveIndex(idx);
    }
  }, [selectedColorImage, images]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Touch swipe events
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) handleNext();
    if (diff < -50) handlePrev();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Hover zoom lens calculations on desktop for images
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handleNext, handlePrev]);

  const currentImage = images[activeIndex] || product.image || '';
  const hasVideo = Boolean(product.videoUrl && product.videoUrl.trim());

  return (
    <div className="flex flex-col gap-6 select-none">
      
      {/* Top Product Image Stage */}
      <div className="space-y-4">
        <div 
          className="relative aspect-square sm:aspect-4/3 lg:aspect-square w-full rounded-3xl overflow-hidden bg-stone-100/90 border border-stone-200/90 shadow-sm group"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsHoverZooming(true)}
          onMouseLeave={() => setIsHoverZooming(false)}
          onMouseMove={handleMouseMove}
        >
          {/* Main Photo */}
          <img
            src={currentImage}
            alt={`${product.name} - View ${activeIndex + 1}`}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isHoverZooming ? 'scale-150 cursor-crosshair' : 'scale-100 cursor-zoom-in'
            }`}
            style={
              isHoverZooming
                ? {
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }
                : undefined
            }
            onClick={() => setIsLightboxOpen(true)}
            loading="eager"
          />

          {/* Floating Top Badges */}
          <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-20 pointer-events-none">
            {product.badge && (
              <span className="bg-amber-400 text-stone-950 font-extrabold text-[11px] px-3 py-1 rounded-lg uppercase shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {product.badge}
              </span>
            )}
            {priceInfo.hasDiscount && (
              <span className="bg-red-600 text-white font-extrabold text-[11px] px-3 py-1 rounded-lg uppercase shadow-md flex items-center gap-1 tracking-wide">
                <Tag className="w-3 h-3" />
                {priceInfo.badgeLabel}
              </span>
            )}
            {product.weight && (
              <span className="bg-stone-900/80 backdrop-blur-xs text-white font-bold text-[10px] px-2.5 py-0.5 rounded-md self-start">
                {product.weight}
              </span>
            )}
          </div>

          {/* Floating Top Right Action Controls */}
          <div className="absolute top-3.5 right-3.5 flex items-center gap-2 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist();
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md shadow-md transition-all cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/85 text-stone-700 hover:bg-white hover:text-rose-600'
              }`}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-label="Wishlist toggle"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              className="w-10 h-10 rounded-full bg-white/85 hover:bg-white text-stone-700 backdrop-blur-md shadow-md flex items-center justify-center transition-all cursor-pointer"
              title="Fullscreen view"
              aria-label="Open Fullscreen Gallery"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Prev / Next Slider Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 sm:opacity-90 cursor-pointer z-20"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 sm:opacity-90 cursor-pointer z-20"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Media Counter & Zoom Hint */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20">
            <span className="hidden sm:inline-flex items-center gap-1 bg-stone-900/70 backdrop-blur-xs text-stone-200 text-[10px] font-medium px-2.5 py-1 rounded-full">
              <ZoomIn className="w-3 h-3" /> Hover to zoom
            </span>
            <span className="bg-stone-900/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
              {activeIndex + 1} / {images.length}
            </span>
          </div>
        </div>

        {/* Image Thumbnails Row */}
        {images.length > 1 && (
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-stone-300">
            {images.map((url, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-stone-100 ${
                    isActive
                      ? 'border-[#1b3d2b] ring-2 ring-[#1b3d2b]/20 scale-105 shadow-md'
                      : 'border-stone-200 opacity-70 hover:opacity-100 hover:border-stone-300'
                  }`}
                  aria-label={`Select product image ${idx + 1}`}
                >
                  <img
                    src={url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-0 h-1 bg-[#1b3d2b]" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Dedicated Video Section Directly Below Images */}
      {showVideoBelow && hasVideo && (
        <div className="pt-2">
          <ProductVideoPlayer
            videoUrl={product.videoUrl}
            productName={product.name}
            title="Product Video & Purity Showcase"
            subtitle="Watch authentic harvesting & unboxing demonstration"
          />
        </div>
      )}

      {/* Fullscreen Lightbox Modal for Images */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-60 bg-stone-950/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div 
            className="w-full max-w-6xl flex items-center justify-between text-white z-30 pb-3 border-b border-stone-800/80"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm text-stone-200">{product.name}</span>
              <span className="text-xs text-stone-400 bg-stone-800/90 px-2.5 py-0.5 rounded-full font-mono">
                {activeIndex + 1} of {images.length}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLightboxZoom((prev) => Math.min(prev + 0.5, 3))}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLightboxZoom((prev) => Math.max(prev - 0.5, 1))}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-red-600 text-stone-200 hover:text-white transition-colors cursor-pointer ml-2"
                title="Close Lightbox (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Stage */}
          <div 
            className="relative flex-1 flex items-center justify-center w-full max-w-5xl overflow-hidden my-4"
            onClick={(e) => e.stopPropagation()}
          >
            {images.length > 1 && (
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 z-20 w-12 h-12 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white flex items-center justify-center shadow-xl border border-stone-700 transition-transform hover:scale-110 cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div className="relative max-h-[75vh] w-full h-full flex items-center justify-center overflow-auto p-2">
              <img
                src={currentImage}
                alt={`${product.name} large view`}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl transition-transform duration-300"
                style={{ transform: `scale(${lightboxZoom})` }}
              />
            </div>

            {images.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-4 z-20 w-12 h-12 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white flex items-center justify-center shadow-xl border border-stone-700 transition-transform hover:scale-110 cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails */}
          {images.length > 1 && (
            <div 
              className="flex items-center gap-2 max-w-full overflow-x-auto py-2 z-30"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveIndex(idx);
                    setLightboxZoom(1);
                  }}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex items-center justify-center ${
                    idx === activeIndex
                      ? 'border-amber-400 scale-105 opacity-100 ring-2 ring-amber-400/30'
                      : 'border-stone-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
