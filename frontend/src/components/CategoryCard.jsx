import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/shop?category=${encodeURIComponent(category.slug)}`}
      className="group relative h-48 rounded-2xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 block"
    >
      {/* Background Image */}
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />

      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent transition-opacity duration-300 group-hover:from-indigo-950/90" />

      {/* Content */}
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-lg font-bold text-white tracking-wide">
          {category.name}
        </h3>
        <p className="text-xs text-slate-200 mt-1 line-clamp-2">
          {category.description}
        </p>
      </div>
    </Link>
  );
};

export default CategoryCard;
