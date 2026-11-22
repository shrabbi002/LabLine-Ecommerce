import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import { resolveImage } from './ItemCard';

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Signed distance from the active slide, wrapped so the carousel loops. */
const wrapOffset = (i, active, n) => {
  let o = (((i - active) % n) + n) % n;
  if (o > n / 2) o -= n;
  return o;
};

/**
 * 3D coverflow product slider.
 * Autoplays (pauses on hover/focus), supports swipe/drag, arrow keys, dots and thumbnails.
 */
const ProductSlider = ({ items = [], interval = 5000 }) => {
  const n = items.length;
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [drag, setDrag] = useState({ active: false, startX: 0, dx: 0 });
  const [spread, setSpread] = useState(62);
  const stageRef = useRef(null);
  const movedRef = useRef(false);
  const autoplay = n > 1 && !reducedMotion();

  const go = useCallback((idx) => setActive(((idx % n) + n) % n), [n]);
  const next = useCallback(() => go(active + 1), [go, active]);
  const prev = useCallback(() => go(active - 1), [go, active]);

  useEffect(() => {
    if (active >= n) setActive(0);
  }, [n, active]);

  // Horizontal spacing between slides scales with viewport
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setSpread(w < 640 ? 78 : w < 1024 ? 62 : 56);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  };

  // ── Drag / swipe ──
  const onPointerDown = (e) => {
    if (n < 2 || (e.pointerType === 'mouse' && e.button !== 0)) return;
    movedRef.current = false;
    setDrag({ active: true, startX: e.clientX, dx: 0 });
  };
  const onPointerMove = (e) => {
    if (!drag.active) return;
    const dx = e.clientX - drag.startX;
    if (Math.abs(dx) > 6 && !movedRef.current) {
      movedRef.current = true;
      stageRef.current?.setPointerCapture?.(e.pointerId);
    }
    setDrag((d) => ({ ...d, dx }));
  };
  const endDrag = () => {
    if (!drag.active) return;
    const width = stageRef.current?.offsetWidth || 1;
    const threshold = Math.min(80, width * 0.12);
    if (drag.dx < -threshold) next();
    else if (drag.dx > threshold) prev();
    setDrag({ active: false, startX: 0, dx: 0 });
    // Let the click that follows a drag be swallowed, then re-enable clicks.
    setTimeout(() => { movedRef.current = false; }, 60);
  };

  if (n === 0) return null;

  const slideWidthPx = (stageRef.current?.offsetWidth || 1000) * (spread / 100);
  const dragFrac = drag.active ? drag.dx / slideWidthPx : 0;
  const current = items[active] || items[0];
  const isRunning = autoplay && !paused && !userPaused && !drag.active;

  return (
    <div
      className="relative isolate select-none"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setPaused(false)}
      onFocus={(e) => e.target.matches?.(':focus-visible') && setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Ambient glow that follows the active product */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none" aria-hidden="true">
        {items.map((item, i) => (
          <div
            key={item._id}
            className="absolute w-[70%] h-[70%] rounded-full blur-[110px] transition-opacity duration-1000"
            style={{
              opacity: i === active ? 0.35 : 0,
              backgroundImage: `url(${resolveImage(item.images?.[0])})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}
      </div>

      {/* Stage */}
      <div
        ref={stageRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured products"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        className={`relative grid place-items-center py-6 [perspective:1600px] touch-pan-y outline-none ${
          drag.active && movedRef.current ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {items.map((item, i) => {
          const o = wrapOffset(i, active, n) + dragFrac;
          const abs = Math.abs(o);
          const hidden = abs > 2.6;
          const isActive = i === active;
          return (
            <div
              key={item._id}
              aria-hidden={!isActive}
              className={`[grid-area:1/1] w-[80%] sm:w-[58%] lg:w-[46%] max-w-[560px] ${
                drag.active ? '' : 'transition-[transform,opacity,filter] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]'
              }`}
              style={{
                transform: `translateX(${o * spread}%) translateZ(${-abs * 160}px) rotateY(${-o * 28}deg) scale(${1 - Math.min(abs, 2) * 0.12})`,
                opacity: hidden ? 0 : 1 - Math.min(abs, 2) * 0.35,
                filter: `blur(${Math.min(abs, 2) * 1.5}px) brightness(${1 - Math.min(abs, 2) * 0.3})`,
                zIndex: 100 - Math.round(abs * 10),
                pointerEvents: hidden ? 'none' : 'auto',
              }}
              onClickCapture={(e) => {
                // A drag should never trigger a click; a click on a side slide brings it to the front.
                if (movedRef.current) { e.preventDefault(); e.stopPropagation(); return; }
                if (!isActive) { e.preventDefault(); e.stopPropagation(); go(i); }
              }}
            >
              <Slide item={item} active={isActive} onOpen={() => navigate(`/items/${item._id}`)} />
            </div>
          );
        })}

        {n > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-[200] w-12 h-12 rounded-full glass bg-[#0b0d1a]/60 text-white flex items-center justify-center hover:scale-110 hover:border-primary-400/50 active:scale-95 transition-all duration-300"
              aria-label="Previous product"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-[200] w-12 h-12 rounded-full glass bg-[#0b0d1a]/60 text-white flex items-center justify-center hover:scale-110 hover:border-primary-400/50 active:scale-95 transition-all duration-300"
              aria-label="Next product"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Controls */}
      {n > 1 && (
        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="flex items-center gap-5">
            <span className="font-display text-sm tabular-nums text-slate-500 w-14 text-right">
              <span key={active} className="inline-block text-white text-lg animate-slide-down">
                {String(active + 1).padStart(2, '0')}
              </span>{' '}
              / {String(n).padStart(2, '0')}
            </span>

            <div className="flex items-center gap-2">
              {items.map((item, i) => (
                <button
                  key={item._id}
                  onClick={() => go(i)}
                  aria-label={`Go to ${item.title}`}
                  aria-current={i === active}
                  className={`relative h-2 rounded-full overflow-hidden transition-all duration-500 ${
                    i === active ? 'w-12 bg-white/15' : 'w-2 bg-white/25 hover:bg-white/50'
                  }`}
                >
                  {i === active && (
                    <span
                      key={active}
                      className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-gradient-to-r from-primary-400 to-cyan-400"
                      style={
                        autoplay
                          ? {
                              animation: `sliderProgress ${interval}ms linear forwards`,
                              animationPlayState: isRunning ? 'running' : 'paused',
                            }
                          : undefined
                      }
                      onAnimationEnd={next}
                    />
                  )}
                </button>
              ))}
            </div>

            {autoplay && (
              <button
                onClick={() => setUserPaused((p) => !p)}
                className="w-9 h-9 rounded-full glass flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}
              >
                {userPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Thumbnails */}
          <div className="hidden md:flex items-center gap-3">
            {items.map((item, i) => (
              <button
                key={item._id}
                onClick={() => go(i)}
                className={`relative w-16 h-12 rounded-xl overflow-hidden transition-all duration-500 ${
                  i === active
                    ? 'ring-2 ring-primary-400 ring-offset-2 ring-offset-[#05060f] scale-110'
                    : 'opacity-40 grayscale hover:opacity-90 hover:grayscale-0'
                }`}
                aria-label={item.title}
              >
                <img src={resolveImage(item.images?.[0])} alt="" className="w-full h-full object-cover" draggable={false} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live region for screen readers */}
      <p className="sr-only" aria-live="polite">
        {current?.title}
      </p>
    </div>
  );
};

const Slide = ({ item, active, onOpen }) => {
  const { title, shortDescription, category, price, images, tags } = item;
  return (
    <article
      onClick={active ? onOpen : undefined}
      className={`group relative rounded-[2rem] p-px transition-shadow duration-700 ${active ? 'cursor-pointer ' : ''}${
        active
          ? 'bg-gradient-to-br from-primary-400/70 via-white/10 to-cyan-400/50 shadow-[0_40px_80px_-30px_rgba(124,58,237,0.7)]'
          : 'bg-white/10'
      }`}
    >
      <div className="relative rounded-[calc(2rem-1px)] overflow-hidden bg-[#0a0c18]">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={resolveImage(images?.[0])}
            alt={title}
            draggable={false}
            className={`w-full h-full object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              active ? 'scale-100 group-hover:scale-110' : 'scale-125'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c18] via-[#0a0c18]/30 to-transparent" />

          {/* Shine sweep when a slide becomes active */}
          {active && (
            <div
              key={item._id}
              className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{ animation: 'slideShine 1.4s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}
            />
          )}

          {category && (
            <span className="absolute top-4 left-4 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] rounded-full glass text-primary-100">
              {category}
            </span>
          )}
          {price !== null && price !== undefined && (
            <span
              className={`absolute top-4 right-4 px-3.5 py-1.5 rounded-full bg-white text-slate-900 font-display font-bold text-sm shadow-xl transition-all duration-700 ${
                active ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
              }`}
            >
              ${Number(price).toLocaleString()}
            </span>
          )}
        </div>

        {/* Text content reveals with a stagger when the slide becomes active */}
        <div className="relative px-6 sm:px-8 pb-7 -mt-14 space-y-3">
          <h3
            className={`font-display text-2xl sm:text-3xl font-bold text-white leading-tight line-clamp-1 transition-all duration-700 ${
              active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: active ? '150ms' : '0ms' }}
          >
            {title}
          </h3>
          <p
            className={`text-sm text-slate-400 line-clamp-2 leading-relaxed transition-all duration-700 ${
              active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: active ? '250ms' : '0ms' }}
          >
            {shortDescription}
          </p>
          <div
            className={`flex items-center justify-between gap-3 pt-2 transition-all duration-700 ${
              active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: active ? '350ms' : '0ms' }}
          >
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {tags?.slice(0, 2).map((tag) => (
                <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 truncate">
                  #{tag}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpen(); }}
              tabIndex={active ? 0 : -1}
              className="btn-primary px-5 py-2.5 text-sm flex-shrink-0 group/btn"
            >
              View
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export const ProductSliderSkeleton = () => (
  <div className="relative grid place-items-center py-6">
    <div className="[grid-area:1/1] w-[80%] sm:w-[58%] lg:w-[46%] max-w-[560px] -translate-x-[55%] scale-75 opacity-30 hidden sm:block">
      <div className="aspect-[4/3] rounded-[2rem] skeleton" />
    </div>
    <div className="[grid-area:1/1] w-[80%] sm:w-[58%] lg:w-[46%] max-w-[560px] translate-x-[55%] scale-75 opacity-30 hidden sm:block">
      <div className="aspect-[4/3] rounded-[2rem] skeleton" />
    </div>
    <div className="[grid-area:1/1] w-[80%] sm:w-[58%] lg:w-[46%] max-w-[560px] relative z-10 rounded-[2rem] border border-white/10 bg-[#0a0c18] overflow-hidden">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-7 space-y-3">
        <div className="h-7 w-2/3 rounded-lg skeleton" />
        <div className="h-4 w-full rounded skeleton" />
      </div>
    </div>
  </div>
);

export default ProductSlider;
