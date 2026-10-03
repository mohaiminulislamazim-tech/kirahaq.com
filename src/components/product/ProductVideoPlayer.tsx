import React from 'react';
import { Play, Film, Sparkles, ExternalLink } from 'lucide-react';
import { parseVideoUrl } from '../../utils/videoUtils';

interface ProductVideoPlayerProps {
  videoUrl?: string;
  productName: string;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const ProductVideoPlayer: React.FC<ProductVideoPlayerProps> = ({
  videoUrl,
  productName,
  className = '',
  title = 'Product Video Demonstration',
  subtitle = 'Watch authentic purity & product demonstration',
}) => {
  if (!videoUrl || !videoUrl.trim()) {
    return null;
  }

  const parsed = parseVideoUrl(videoUrl);
  if (!parsed.isValid) {
    return null;
  }

  return (
    <div className={`w-full bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-md text-white ${className}`}>
      {/* Header Bar */}
      <div className="px-4 py-3 bg-stone-950/80 border-b border-stone-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-stone-100 truncate flex items-center gap-1.5">
              <span>{title}</span>
              <span className="text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                HD
              </span>
            </h4>
            <p className="text-[10px] text-stone-400 truncate">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Video Type Badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded-lg flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>100% Genuine</span>
          </span>
        </div>
      </div>

      {/* Video Viewport Frame */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
        {parsed.type === 'direct' ? (
          <video
            src={parsed.rawUrl}
            controls
            playsInline
            preload="metadata"
            className="w-full h-full object-contain"
          >
            Your browser does not support HTML5 video tag.
          </video>
        ) : (
          <iframe
            src={parsed.embedUrl}
            title={`${productName} Video`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="px-4 py-2.5 bg-stone-950/60 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-800/40">
        <span className="flex items-center gap-1.5 truncate">
          <Film className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{productName} — Authentic Harvest & Packaging</span>
        </span>
        {parsed.rawUrl.startsWith('http') && (
          <a
            href={parsed.rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-amber-400/90 hover:text-amber-300 flex items-center gap-1 shrink-0 ml-2 hover:underline"
          >
            <span>Open</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>
    </div>
  );
};
