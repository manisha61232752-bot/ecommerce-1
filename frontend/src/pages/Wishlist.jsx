import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Heart } from 'lucide-react';

const Wishlist = () => {
  const { wishlistItems, loading } = useWishlist();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6 fade-in-up">
        <div className="inline-flex p-4 bg-rose-50 text-rose-500 rounded-full">
          <Heart className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Your Wishlist is Empty</h2>
        <p className="text-slate-500 text-xs max-w-xs mx-auto">
          You haven't saved any items yet. Browse through our products and click the heart icon on any product to save it to your wishlist.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-6 py-3 rounded-full shadow-md shadow-indigo-900/10 transition-transform hover:scale-102"
        >
          Go Shop Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">My Wishlist</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your saved products and add them directly to your cart</p>
      </div>

      {/* Grid of Wishlist Items */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {wishlistItems.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

    </div>
  );
};

export default Wishlist;
