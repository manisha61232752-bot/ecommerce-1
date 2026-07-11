import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-hot-toast';

const ProductCard = ({ product, isCompared, onCompare }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock > 0) {
      addToCart(product, 1);
      toast.success(`${product.title} added to cart!`);
    } else {
      toast.error('Product is out of stock');
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  // Safe image path checker
  const imageUrl = product.images && product.images[0]
    ? product.images[0]
    : '/uploads/sample-placeholder.jpg';

  const wishlisted = isWishlisted(product._id);

  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md dark:hover:shadow-indigo-950/20 hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 flex flex-col h-full fade-in-up">
      
      {/* Image Gallery Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <Link to={`/product/${product._id}`}>
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Discount Badge */}
        {product.discountPercentage > 0 && (
          <span className="absolute top-3 left-3 bg-rose-500 text-white font-bold text-[9px] px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md z-10">
            -{product.discountPercentage}% OFF
          </span>
        )}

        {/* Wishlist Toggle Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs rounded-full shadow-xs hover:bg-white text-slate-400 hover:text-rose-500 transition-colors"
          aria-label="Toggle wishlist"
        >
          <Heart className={`h-5 w-5 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Compare Toggle Button */}
        {onCompare && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onCompare(product);
            }}
            className={`absolute top-14 right-3 p-2 bg-white/95 backdrop-blur-xs rounded-full shadow-xs hover:bg-indigo-600 hover:text-white transition-all text-sm z-10 flex items-center justify-center ${
              isCompared ? 'bg-indigo-600 text-white scale-105 ring-2 ring-indigo-100' : 'bg-white text-slate-400'
            }`}
            title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
          >
            ⚖️
          </button>
        )}

        {/* Out of Stock Label */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Brand */}
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
            {product.brand}
          </span>

          {/* Title */}
          <Link to={`/product/${product._id}`}>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 transition-colors mb-2">
              {product.title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200 dark:text-slate-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-450">
              ({product.numReviews || 0})
            </span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800 mt-auto">
          <div className="flex flex-col">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-base font-extrabold text-slate-950 dark:text-slate-50">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[10px] text-slate-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {product.stock > 0 ? (
            <button
              onClick={handleAddToCart}
              className="flex items-center space-x-1 bg-slate-900 dark:bg-slate-800 hover:bg-indigo-600 dark:hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors group-hover:bg-indigo-600 cursor-pointer"
              aria-label="Add to cart"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
            </button>
          ) : (
            <span className="text-xs text-rose-500 font-semibold uppercase tracking-wider">
              Sold Out
            </span>
          )}
        </div>

      </div>

    </div>
  );
};

export default ProductCard;
