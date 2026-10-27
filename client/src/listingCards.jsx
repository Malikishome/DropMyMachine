import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

const VT_NAME = 'expanding-photo';

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function supportsViewTransitions() {
  return typeof document !== 'undefined' && typeof document.startViewTransition === 'function';
}

const MACHINE_TYPE_LABELS = {
  vending: 'Vending',
  atm: 'ATM',
  arcade: 'Arcade',
  ice: 'Ice / Water',
};

const FOOT_TRAFFIC_LABELS = {
  high: 'High traffic',
  medium: 'Medium traffic',
  low: 'Low traffic',
};

const FOOT_TRAFFIC_DOT_CLASS = {
  high: 'bg-success',
  medium: 'bg-pending',
  low: 'bg-faint',
};

function PhotoPlaceholder({ className = '' }) {
  return (
    <div className={`w-full h-full bg-surface-raised flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-8 h-8 text-faint"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="11" r="2" />
        <path d="m5 17 4.5-4.5a2 2 0 0 1 2.8 0L17 17" />
      </svg>
    </div>
  );
}

function formatPostedDate(createdAt) {
  if (!createdAt) return null;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;

  const diffDays = Math.floor((Date.now() - created.getTime()) / 86400000);
  if (diffDays <= 0) return 'Posted today';
  if (diffDays === 1) return 'Posted 1d ago';
  if (diffDays < 7) return `Posted ${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  return diffWeeks === 1 ? 'Posted 1 week ago' : `Posted ${diffWeeks} weeks ago`;
}

function ListingCards({
  machine_type,
  city,
  state,
  description,
  foot_traffic,
  revenue_split,
  photo_url,
  status,
  created_at,
  isPriority = false,
}) {
  const locationBlur = [city, state].filter(Boolean).join(', ');
  const postedLabel = formatPostedDate(created_at);
  const isActive = status === 'active';

  const [lightboxHidden, setLightboxHidden] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const photoRef = useRef(null);
  const lightboxRef = useRef(null);
  const lightboxPhotoRef = useRef(null);

  const openLightbox = () => {
    const useVT = supportsViewTransitions() && !prefersReducedMotion();

    const reveal = () => {
      setLightboxHidden(false);
      setLightboxOpen(true);
    };

    if (useVT && photoRef.current) {
      photoRef.current.style.viewTransitionName = VT_NAME;
      const transition = document.startViewTransition(() => {
        flushSync(reveal);
        // Hand the name off to the new element before the browser captures
        // the "after" snapshot - both elements briefly existing with the
        // same name at once throws "duplicate view-transition-name".
        if (photoRef.current) photoRef.current.style.viewTransitionName = '';
        if (lightboxPhotoRef.current) {
          lightboxPhotoRef.current.style.viewTransitionName = VT_NAME;
        }
      });
      transition.finished.finally(() => {
        if (photoRef.current) photoRef.current.style.viewTransitionName = '';
        if (lightboxPhotoRef.current) lightboxPhotoRef.current.style.viewTransitionName = '';
      });
    } else {
      setLightboxHidden(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setLightboxOpen(true)));
    }
  };

  const closeLightbox = () => {
    const useVT = supportsViewTransitions() && !prefersReducedMotion();

    if (useVT && lightboxPhotoRef.current) {
      lightboxPhotoRef.current.style.viewTransitionName = VT_NAME;
      const transition = document.startViewTransition(() => {
        flushSync(() => setLightboxOpen(false));
        if (lightboxPhotoRef.current) lightboxPhotoRef.current.style.viewTransitionName = '';
        if (photoRef.current) photoRef.current.style.viewTransitionName = VT_NAME;
      });
      transition.finished.finally(() => {
        if (photoRef.current) photoRef.current.style.viewTransitionName = '';
        if (lightboxPhotoRef.current) lightboxPhotoRef.current.style.viewTransitionName = '';
      });
    } else {
      setLightboxOpen(false);
    }
  };

  const handleLightboxTransitionEnd = (e) => {
    if (e.target === lightboxRef.current && !lightboxOpen) {
      setLightboxHidden(true);
    }
  };

  useEffect(() => {
    if (lightboxHidden) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxHidden]);

  return (
    <div className="bg-surface border border-border rounded-card shadow-card overflow-hidden flex flex-col">
      <button
        type="button"
        ref={photoRef}
        onClick={openLightbox}
        aria-label={`Expand photo for ${locationBlur || 'this listing'}`}
        className="relative h-[120px] w-full block border-none p-0 cursor-zoom-in"
      >
        {photo_url ? (
          <img src={photo_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <PhotoPlaceholder />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg/50 to-transparent" />
        {isPriority && (
          <span className="absolute top-2.5 left-2.5 text-[10.5px] font-bold uppercase tracking-wide bg-accent text-accent-ink px-2 py-0.5 rounded-full">
            Pro listing
          </span>
        )}
      </button>

      <div className="p-3.5 flex flex-col gap-2.5 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wide text-accent">
              {MACHINE_TYPE_LABELS[machine_type] ?? machine_type}
            </div>
            <div className="text-sm font-semibold text-text mt-0.5">{locationBlur}</div>
          </div>
          {postedLabel && (
            <div className="text-[11px] text-faint whitespace-nowrap">{postedLabel}</div>
          )}
        </div>

        <p className="text-[12.5px] text-muted leading-relaxed line-clamp-2">{description}</p>

        <div className="flex gap-3.5 text-xs text-muted mt-auto">
          {foot_traffic && (
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${FOOT_TRAFFIC_DOT_CLASS[foot_traffic]}`} />
              {FOOT_TRAFFIC_LABELS[foot_traffic]}
            </div>
          )}
          {revenue_split != null && (
            <div className="font-bold text-text">{revenue_split}% split</div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-border">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            isActive ? 'bg-success/10 text-success' : 'bg-surface-raised text-faint'
          }`}
        >
          {isActive ? 'Active' : 'Filled'}
        </span>
        <button
          type="button"
          disabled={!isActive}
          className="text-xs font-semibold px-3 py-1.5 rounded-control bg-accent text-accent-ink disabled:opacity-55 disabled:cursor-not-allowed"
        >
          Send Request
        </button>
      </div>

      <div
        ref={lightboxRef}
        hidden={lightboxHidden}
        onTransitionEnd={handleLightboxTransitionEnd}
        onClick={(e) => {
          if (e.target === lightboxRef.current) closeLightbox();
        }}
        className={`fixed inset-0 z-50 flex items-center justify-center p-6 bg-bg/85 transition-opacity duration-[380ms] ease-out ${
          lightboxOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          type="button"
          onClick={closeLightbox}
          aria-label="Close photo"
          className="fixed top-5 right-5 w-9 h-9 rounded-full bg-surface border border-border text-text text-base"
        >
          &times;
        </button>
        {photo_url ? (
          <img
            ref={lightboxPhotoRef}
            src={photo_url}
            alt=""
            className="w-full max-w-xl aspect-[16/10] object-cover rounded-card shadow-card border border-border"
          />
        ) : (
          <div
            ref={lightboxPhotoRef}
            className="w-full max-w-xl aspect-[16/10] rounded-card shadow-card border border-border overflow-hidden"
          >
            <PhotoPlaceholder />
          </div>
        )}
      </div>
    </div>
  );
}

export default ListingCards;
