import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = '#FF6A21',
  description,
  href,
}) => {
  const content = (
    <div className="admin-card admin-card-hover rounded-2xl p-5 relative overflow-hidden group cursor-pointer transition-all duration-300">
      {/* Subtle top accent line */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity" 
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} 
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate group-hover:text-slate-200 transition-colors">
              {title}
            </p>
            {href && (
              <ChevronRight
                size={12}
                className="text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
              />
            )}
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 tracking-tight font-display">
            {value}
          </h3>
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110 flex-shrink-0"
          style={{
            background: `${color}18`,
            borderColor: `${color}35`,
            color: color,
          }}
        >
          {Icon && <Icon size={20} />}
        </div>
      </div>

      {(trend !== undefined || description) && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
          {description && (
            <span className="text-slate-400 font-medium truncate text-[11px] group-hover:text-slate-300 transition-colors">
              {description}
            </span>
          )}
          {trend !== undefined && (
            <div
              className={clsx(
                'inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full border',
                trend >= 0 
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                  : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
              )}
            >
              {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              <span>{trend > 0 ? `+${trend}` : trend}%</span>
              {trendLabel && <span className="text-slate-400 font-normal ml-0.5">{trendLabel}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};

