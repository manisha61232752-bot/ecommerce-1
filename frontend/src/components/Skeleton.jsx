import React from 'react';

// Product card grid skeletal loader
export const ProductGridSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[...Array(count)].map((_, idx) => (
        <div key={idx} className="bg-white border border-slate-100 rounded-2xl overflow-hidden p-4 space-y-4 flex flex-col h-full">
          {/* Image */}
          <div className="aspect-square w-full rounded-xl skeleton-pulse" />
          {/* Brand & Title */}
          <div className="space-y-2 flex-1">
            <div className="h-2 w-12 rounded-sm skeleton-pulse" />
            <div className="h-4 w-5/6 rounded-sm skeleton-pulse" />
            <div className="h-3 w-2/3 rounded-sm skeleton-pulse" />
          </div>
          {/* Price & Action button */}
          <div className="flex justify-between items-center pt-2">
            <div className="h-5 w-16 rounded-sm skeleton-pulse" />
            <div className="h-8 w-8 rounded-lg skeleton-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Admin panel dashboard statistics metrics loader
export const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, idx) => (
        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-4 w-24 rounded-sm skeleton-pulse" />
            <div className="h-8 w-8 rounded-full skeleton-pulse" />
          </div>
          <div className="h-7 w-20 rounded-sm skeleton-pulse" />
        </div>
      ))}
    </div>
  );
};

// General single detail page loader
export const PageSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      <div className="h-6 w-48 rounded-sm skeleton-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square w-full rounded-2xl skeleton-pulse" />
        <div className="space-y-6">
          <div className="h-8 w-3/4 rounded-sm skeleton-pulse" />
          <div className="h-5 w-1/4 rounded-sm skeleton-pulse" />
          <div className="h-6 w-1/3 rounded-sm skeleton-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded-sm skeleton-pulse" />
            <div className="h-4 w-full rounded-sm skeleton-pulse" />
            <div className="h-4 w-5/6 rounded-sm skeleton-pulse" />
          </div>
          <div className="h-10 w-48 rounded-lg skeleton-pulse" />
        </div>
      </div>
    </div>
  );
};
