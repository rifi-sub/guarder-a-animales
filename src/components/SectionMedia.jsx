import { useState, useEffect } from 'react';
import { API_BASE } from '../config';

/**
 * Hook that fetches media items and the display mode for a given section.
 * Returns { items, mode, loading }
 * mode: 'single' | 'carousel' | 'gallery'
 */
export function useSectionMedia(sectionKey) {
  const [items, setItems]   = useState([]);
  const [mode, setMode]     = useState('single');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [mediaRes, settingsRes] = await Promise.all([
          fetch(`${API_BASE}/api/media/${sectionKey}`),
          fetch(`${API_BASE}/api/settings`),
        ]);
        if (cancelled) return;
        if (mediaRes.ok)    setItems(await mediaRes.json());
        if (settingsRes.ok) {
          const s = await settingsRes.json();
          const savedMode = s[`section_mode_${sectionKey}`];
          if (savedMode) setMode(savedMode);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [sectionKey]);

  return { items, mode, loading };
}

/** URL for a MediaItem file */
export function mediaUrl(item) {
  return `${API_BASE}/api/media/file/${item.filename}`;
}

/** Fallback image URL when no items are in the media library */
export function legacyImageUrl(key) {
  return `${API_BASE}/api/images/${key}`;
}

/** Lightbox overlay */
export function Lightbox({ item, items, currentIndex, onClose, onNav }) {
  const url = mediaUrl(item);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft'  && hasPrev) onNav(currentIndex - 1);
      if (e.key === 'ArrowRight' && hasNext) onNav(currentIndex + 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, hasPrev, hasNext]);

  return (
    <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10">
        <span className="material-symbols-outlined">close</span>
      </button>
      {hasPrev && (
        <button onClick={e => { e.stopPropagation(); onNav(currentIndex - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
      )}
      {hasNext && (
        <button onClick={e => { e.stopPropagation(); onNav(currentIndex + 1); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      )}
      <div className="max-w-5xl max-h-[88vh] w-full h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
        {item.type === 'video' ? (
          <video key={url} src={url} controls autoPlay className="max-w-full max-h-full rounded-2xl shadow-2xl" />
        ) : (
          <img key={url} src={url} alt={item.caption || ''} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
        )}
      </div>
      {item.caption && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-sm px-5 py-2 rounded-xl font-medium max-w-md text-center">
          {item.caption}
        </div>
      )}
    </div>
  );
}

/** Renders a single photo or video */
export function SingleMedia({ item, fallbackSrc, alt, className }) {
  if (!item) return <img src={fallbackSrc} alt={alt} className={className} onError={e => e.target.style.opacity = '0'} />;
  const url = mediaUrl(item);
  return item.type === 'video'
    ? <video key={url} src={url} autoPlay muted loop playsInline className={className} />
    : <img key={url} src={url} alt={item.caption || alt} className={className} />;
}

/** Carousel with prev/next arrows and dot indicators */
export function Carousel({ items, fallbackSrc, alt, className, containerClassName }) {
  const [current, setCurrent]   = useState(0);
  const [fading, setFading]     = useState(false);

  if (!items.length) return <img src={fallbackSrc} alt={alt} className={className} />;

  const go = (idx) => {
    if (idx === current) return;
    setFading(true);
    setTimeout(() => { setCurrent(idx); setFading(false); }, 180);
  };

  const item = items[current];
  const url  = mediaUrl(item);

  return (
    <div className={`relative ${containerClassName || ''}`}>
      <div className={`w-full h-full transition-opacity duration-200 ${fading ? 'opacity-0' : 'opacity-100'}`}>
        {item.type === 'video'
          ? <video key={url} src={url} autoPlay muted loop playsInline className={className} />
          : <img key={url} src={url} alt={item.caption || alt} className={className} />
        }
      </div>

      {items.length > 1 && (
        <>
          <button onClick={() => go((current - 1 + items.length) % items.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-sm text-white flex items-center justify-center transition-colors z-10 shadow-lg">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button onClick={() => go((current + 1) % items.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-sm text-white flex items-center justify-center transition-colors z-10 shadow-lg">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {items.map((_, i) => (
              <button key={i} onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all duration-200 ${i === current ? 'bg-white w-5' : 'bg-white/50 w-1.5'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Mosaic gallery grid — click to open lightbox */
export function Gallery({ items, fallbackSrc, alt, gridClassName }) {
  const [lightboxIdx, setLightboxIdx] = useState(null);

  if (!items.length) return <img src={fallbackSrc} alt={alt} className="w-full h-full object-cover" />;
  if (items.length === 1) return <SingleMedia item={items[0]} fallbackSrc={fallbackSrc} alt={alt} className="w-full h-full object-cover" />;

  return (
    <>
      {lightboxIdx !== null && (
        <Lightbox
          item={items[lightboxIdx]}
          items={items}
          currentIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onNav={setLightboxIdx}
        />
      )}
      <div className={gridClassName || 'grid grid-cols-2 gap-2 h-full'}>
        {/* First item larger */}
        <GalleryThumb item={items[0]} index={0} total={items.length} onClick={() => setLightboxIdx(0)} large />
        {/* Rest */}
        <div className="grid grid-rows-2 gap-2">
          {items.slice(1, 3).map((item, i) => (
            <GalleryThumb key={item.id} item={item} index={i + 1} total={items.length} onClick={() => setLightboxIdx(i + 1)}
              showMore={i === 1 && items.length > 3} remaining={items.length - 3} />
          ))}
        </div>
      </div>
    </>
  );
}

function GalleryThumb({ item, index, total, onClick, large, showMore, remaining }) {
  const url = mediaUrl(item);
  return (
    <div onClick={onClick} className="relative rounded-2xl overflow-hidden cursor-zoom-in group" style={large ? { minHeight: 240 } : {}}>
      {item.type === 'video'
        ? <video src={url} muted playsInline autoPlay loop className="w-full h-full object-cover" />
        : <img src={url} alt={item.caption || ''} className="w-full h-full object-cover" loading="lazy" />
      }
      <div className={`absolute inset-0 flex items-center justify-center transition-colors ${showMore ? 'bg-black/65' : 'bg-black/0 group-hover:bg-black/25'}`}>
        {showMore ? (
          <span className="text-white font-black text-2xl drop-shadow-lg">+{remaining + 1}</span>
        ) : (
          <span className="material-symbols-outlined text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">
            {item.type === 'video' ? 'play_circle' : 'zoom_in'}
          </span>
        )}
      </div>
      {item.type === 'video' && !showMore && (
        <div className="absolute top-2 left-2 bg-black/50 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 backdrop-blur-sm">
          <span className="material-symbols-outlined text-[11px]">videocam</span>
        </div>
      )}
    </div>
  );
}

/**
 * SectionMedia: renders the right component based on mode.
 * Use this in public components.
 */
export function SectionMedia({ sectionKey, alt, className, containerClassName, gridClassName }) {
  const { items, mode, loading } = useSectionMedia(sectionKey);
  const fallback = legacyImageUrl(sectionKey);

  if (loading) return <div className={`${className || 'w-full h-full'} bg-surface-container animate-pulse rounded-2xl`} />;

  if (mode === 'gallery') {
    return <Gallery items={items} fallbackSrc={fallback} alt={alt} gridClassName={gridClassName} />;
  }
  if (mode === 'carousel') {
    return <Carousel items={items} fallbackSrc={fallback} alt={alt} className={className} containerClassName={containerClassName || 'w-full h-full'} />;
  }
  // default: single
  return <SingleMedia item={items[0] || null} fallbackSrc={fallback} alt={alt} className={className} />;
}
