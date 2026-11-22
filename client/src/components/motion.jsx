import React, { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Returns [ref, visible]; visible flips to true once the element scrolls into view. */
export const useInView = (options = {}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px', ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
};

/** Fades + lifts its children in when scrolled into view. */
export const Reveal = ({ as: Tag = 'div', delay = 0, className = '', style, children, ...rest }) => {
  const [ref, visible] = useInView();
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

/** Animates a number from 0 to `end` once `start` is true. */
export const useCountUp = (end, start, duration = 1600) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (prefersReducedMotion()) {
      setValue(end);
      return;
    }
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setValue(end * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, start, duration]);
  return value;
};

/**
 * Displays a stat like "240+", "99.9%" or "4.9" with a count-up animation.
 * Non-numeric values are shown as-is.
 */
export const CountUp = ({ value, className = '' }) => {
  const str = String(value ?? '');
  const match = str.match(/^([^\d]*)([\d.,]+)(.*)$/);
  const [ref, visible] = useInView();
  const numeric = match ? parseFloat(match[2].replace(/,/g, '')) : 0;
  const current = useCountUp(numeric, visible && !!match);

  if (!match) return <span className={className}>{str}</span>;
  const decimals = (match[2].split('.')[1] || '').length;
  const formatted = current.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <span ref={ref} className={className}>
      {match[1]}
      {formatted}
      {match[3]}
    </span>
  );
};

/** Mouse handler that feeds --mx / --my to a `.spotlight` element. */
export const spotlightHandler = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
};

/** Subtle 3D tilt toward the cursor. Spread the returned props onto the element. */
export const useTilt = (max = 6) => {
  const ref = useRef(null);
  const onMouseMove = (e) => {
    spotlightHandler(e);
    const el = ref.current;
    if (!el || prefersReducedMotion() || window.matchMedia('(hover: none)').matches) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateY(-6px)`;
  };
  const onMouseLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };
  return { ref, onMouseMove, onMouseLeave };
};

/** Soft animated colour blobs for section backgrounds. */
export const Aurora = ({ className = '' }) => (
  <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
    <div className="absolute -top-[20%] -left-[10%] w-[55%] aspect-square rounded-full bg-primary-600/25 blur-[120px] animate-aurora" />
    <div
      className="absolute top-[10%] -right-[15%] w-[50%] aspect-square rounded-full bg-cyan-500/15 blur-[120px] animate-aurora"
      style={{ animationDelay: '-6s' }}
    />
    <div
      className="absolute -bottom-[25%] left-[25%] w-[45%] aspect-square rounded-full bg-fuchsia-600/15 blur-[120px] animate-aurora"
      style={{ animationDelay: '-12s' }}
    />
  </div>
);

/** Full-page loader used while a page fetches its content. */
export const PageLoader = ({ label = 'Loading...' }) => (
  <div className="min-h-[70vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-5 animate-fade-in">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-white/5" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-400 border-r-cyan-400 animate-spin" />
        <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-primary-600 to-cyan-500 blur-md opacity-60 animate-pulse" />
      </div>
      <p className="text-slate-400 text-sm tracking-wide">{label}</p>
    </div>
  </div>
);
