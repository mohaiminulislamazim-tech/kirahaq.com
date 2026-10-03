/**
 * Video helper utility to handle direct video files (mp4, webm, blob, base64)
 * and embeddable platforms (YouTube, YouTube Shorts, Vimeo, etc.)
 */

export interface ParsedVideoInfo {
  isValid: boolean;
  type: 'direct' | 'youtube' | 'vimeo' | 'embed' | 'unknown';
  embedUrl: string;
  rawUrl: string;
  thumbnailUrl?: string;
}

export function parseVideoUrl(url?: string): ParsedVideoInfo {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return { isValid: false, type: 'unknown', embedUrl: '', rawUrl: '' };
  }

  const trimmed = url.trim();

  // Direct video file (mp4, webm, ogg, mov, m4v) or data URL or blob
  if (
    trimmed.startsWith('data:video/') ||
    trimmed.startsWith('blob:') ||
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(trimmed)
  ) {
    return {
      isValid: true,
      type: 'direct',
      embedUrl: trimmed,
      rawUrl: trimmed,
    };
  }

  // YouTube standard, youtu.be, shorts, or embed URLs
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      isValid: true,
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`,
      rawUrl: trimmed,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  // Vimeo URLs
  const vimeoMatch = trimmed.match(
    /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|))(\d+)/i
  );
  if (vimeoMatch && vimeoMatch[3]) {
    const vimeoId = vimeoMatch[3];
    return {
      isValid: true,
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
      rawUrl: trimmed,
    };
  }

  // Already an embed iframe URL
  if (trimmed.includes('embed') || trimmed.includes('player.')) {
    return {
      isValid: true,
      type: 'embed',
      embedUrl: trimmed,
      rawUrl: trimmed,
    };
  }

  // Generic fallback: treat as direct video stream
  return {
    isValid: true,
    type: 'direct',
    embedUrl: trimmed,
    rawUrl: trimmed,
  };
}

export const SAMPLE_PRODUCT_VIDEOS = [
  {
    label: '🍯 Raw Honey Harvest',
    url: 'https://www.youtube.com/watch?v=gA_4C_m6_u4',
    description: 'Natural hive extraction & pure filtration process',
  },
  {
    label: '🌿 Black Seed Cold Press',
    url: 'https://www.youtube.com/watch?v=0kY8S9Ff82E',
    description: 'Cold-pressed Nigella Sativa oil extraction',
  },
  {
    label: '🕊️ Organic Farm Tour',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: '100% natural, chemical-free sustainable harvesting',
  },
  {
    label: '📦 Product Unboxing & Quality',
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    description: 'Premium tamper-evident packaging & purity seal',
  },
];
