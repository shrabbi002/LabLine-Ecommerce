import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { ASSET_BASE_URL } from '../api';
import { useTilt } from './motion';

export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';

export const resolveImage = (img) => (img ? (img.startsWith('http') ? img : `${ASSET_BASE_URL}${img}`) : FALLBACK_IMAGE);

const ItemCard = ({ item }) => {
  const { _id, title, shortDescription, category, price, images, tags } = item;
  const tilt = useTilt(5);
  const imageUrl = resolveImage(images?.[0]);

  return (
    <Link
      to={`/items/${_id}`}
      {...tilt}
      className="spotlight group block h-full rounded-3xl p-px bg-gradient-to-b from-white/[0.12] to-white/[0.02] hover:from-primary-500/60 hover:to-cyan-400/20 transition-[background,transform,box-shadow] duration-500 ease-out will-change-transform hover:shadow-[0_30px_60px_-25px_rgba(124,58,237,0.55)]"
    >
      <div className="relative z-10 h-full flex flex-col rounded-[calc(1.5rem-1px)] bg-[#0a0c18]/95 overflow-hidden">
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] w-full overflow-hidden m-0">
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="object-cover w-full h-full scale-105 group-hover:scale-115 transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c18] via-[#0a0c18]/20 to-transparent" />

          {category && (
            <span className="absolute top-3 left-3 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] rounded-full glass text-primary-200">
              {category}
            </span>
          )}

          <span className="absolute top-3 right-3 w-10 h-10 rounded-full glass flex items-center justify-center text-white opacity-0 -translate-y-2 scale-75 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-500">
            <ArrowUpRight className="w-4 h-4" />
          </span>

          {price !== null && price !== undefined && (
            <span className="absolute bottom-3 left-4 font-display text-2xl font-bold text-white drop-shadow-lg">
              ${Number(price).toLocaleString()}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-display text-lg font-semibold text-white line-clamp-1 mb-1.5 transition-colors duration-300 group-hover:text-primary-200">
            {title}
          </h3>
          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed flex-grow">{shortDescription}</p>

          {tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] text-slate-300"
                >
                  #{tag}
                </span>
              ))}
              {tags.length > 3 && <span className="text-[11px] text-slate-500 self-center">+{tags.length - 3}</span>}
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-sm font-medium">
            <span className="text-slate-400 group-hover:text-white transition-colors duration-300">View details</span>
            <span className="relative h-px flex-1 mx-3 bg-white/10 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-primary-400 to-cyan-400 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
            </span>
            <ArrowUpRight className="w-4 h-4 text-primary-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export const ItemCardSkeleton = () => (
  <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
    <div className="aspect-[4/3] skeleton" />
    <div className="p-5 space-y-3">
      <div className="h-5 w-2/3 rounded-lg skeleton" />
      <div className="h-3.5 w-full rounded skeleton" />
      <div className="h-3.5 w-4/5 rounded skeleton" />
      <div className="h-8 w-full rounded-xl skeleton mt-4" />
    </div>
  </div>
);

export default ItemCard;
