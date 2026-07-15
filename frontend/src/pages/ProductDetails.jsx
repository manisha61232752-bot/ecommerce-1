import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { PageSkeleton } from '../components/Skeleton';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Star, Heart, ShoppingCart, Tag, Send, AlertTriangle, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  // Load States
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  
  // Interface States
  const [activeImage, setActiveImage] = useState( "");
  useEffect(() => {
  if (product?.images?.length > 0) {
    setActiveImage(product.images[0]);
  }
}, [product]);
  const [quantity, setQuantity] = useState(1);

  // Manage Recently Viewed items in LocalStorage
  useEffect(() => {
    if (product) {
      const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const filtered = stored.filter(p => p._id !== product._id);
      const updated = [product, ...filtered].slice(0, 5); // Keep up to 5 items
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      setRecentlyViewed(updated.filter(p => p._id !== product._id).slice(0, 4));
    }
  }, [product]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Product link copied to clipboard!');
  };
  
  // Review submission States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/products/${id}`);
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts);
        setActiveImage(data.product.images[0] || '/uploads/sample-placeholder.jpg');
        setQuantity(1); // reset quantity stepper
      } catch (err) {
        console.error('Failed to load product details:', err);
        toast.error('Product details not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (product.stock >= quantity) {
      addToCart(product, quantity);
      toast.success(`${product.title} (${quantity}) added to cart!`);
    } else {
      toast.error('Not enough stock available');
    }
  };

  const handleBuyNow = () => {
    if (product.stock >= quantity) {
      addToCart(product, quantity);
      navigate('/checkout');
    } else {
      toast.error('Not enough stock available');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      return toast.error('Please enter a review comment');
    }

    try {
      setSubmittingReview(true);
      await api.post(`/api/products/${id}/reviews`, { rating, comment });
      toast.success('Review submitted successfully!');
      
      // Reload product details to show review
      const { data } = await api.get(`/api/products/${id}`);
      setProduct(data.product);
      setComment('');
      setRating(5);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Product Not Found</h2>
        <p className="text-slate-500 text-xs">The product you are trying to view does not exist or has been removed.</p>
        <Link to="/shop" className="inline-block bg-indigo-600 text-white text-xs font-semibold px-4 py-2.5 rounded-full">
          Back to Shop Catalog
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product._id);

  return (
    <div className="space-y-16 py-4">
  {/* Breadcrumbs */}
      <div className="text-xs text-slate-400 font-medium flex items-center space-x-1.5">
        <Link to="/" className="hover:text-slate-600">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-slate-600">Catalog</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category?.slug}`} className="hover:text-slate-600">{product.category?.name}</Link>
        <span>/</span>
        <span className="text-slate-700 truncate">{product.title}</span>
      </div>
  

      {/* Main product showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Left Side: Images */}
        <div className="space-y-4">

          <div className="aspect-square bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden shadow-xs relative">
            <img
  src={activeImage || product.images?.[0]}
  alt={product.title}
  className="w-full h-full object-cover"
/>
            
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                <span className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-full tracking-wider uppercase">
                  Sold Out
                </span>
              </div>
            )}
          </div>

      {/* Gallery selector thumbnail list */}
{product.images.length > 1 && (
  <div className="flex gap-3">
    {product.images.map((img, idx) => {
      const imageUrl = img.startsWith("/uploads")
        ? `https://ecommerce-1-hxqt.onrender.com${img}`
        : img;

      return (
        <button
          key={idx}
          onClick={() => setActiveImage(imageUrl)}
          className={`h-20 w-20 rounded-xl overflow-hidden border bg-slate-50 ${
            activeImage === imageUrl
              ? "border-indigo-600 ring-2 ring-indigo-50/50"
              : "border-slate-200"
          }`}
        >
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </button>
      );
    })}
  </div>
)}
</div>

        {/* Right Side: Details & Actions */}
        <div className="space-y-6 flex flex-col justify-center">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
              {product.brand}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 mt-1">
              {product.title}
            </h1>

            {/* Rating overview */}
            <div className="flex items-center space-x-2 mt-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">{product.rating}</span>
              <span className="text-xs text-slate-400">({product.numReviews} customer reviews)</span>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Pricing & Stock */}
          <div className="flex items-baseline space-x-4 flex-wrap gap-2">
            <span className="text-3xl font-extrabold text-slate-950">${product.price.toFixed(2)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-lg text-slate-400 line-through">${product.originalPrice.toFixed(2)}</span>
                <span className="text-xs font-bold text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">
                  {product.discountPercentage}% OFF
                </span>
              </>
            )}
            {product.stock > 0 ? (
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                In Stock ({product.stock} units available)
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full border border-rose-100">
                Out of Stock
              </span>
            )}
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          <hr className="border-slate-100" />

          {/* Action buttons */}
          {product.stock > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              
              {/* Quantity counter stepper */}
              <div className="flex border border-slate-200 rounded-xl overflow-hidden h-12 w-32 justify-between items-center bg-white shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="px-3 h-full hover:bg-slate-50 font-bold text-slate-600"
                >
                  -
                </button>
                <span className="text-sm font-semibold text-slate-800">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                  className="px-3 h-full hover:bg-slate-50 font-bold text-slate-600"
                >
                  +
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-900/10"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>

              {/* Buy Now button */}
              <button

                onClick={handleBuyNow}
                className="flex-1 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md shadow-amber-900/10 cursor-pointer"
              >
                <span>⚡ Buy Now</span>
              </button>

              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3 border rounded-xl h-12 flex items-center justify-center transition-colors ${
                  wishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                }`}
                title="Save to wishlist"
              >
                <Heart className={`h-5 w-5 ${wishlisted ? 'fill-rose-500' : ''}`} />
              </button>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="p-3 border border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl h-12 flex items-center justify-center transition-colors"
                title="Share product link"
              >
                <Share2 className="h-5 w-5" />
              </button>

            </div>
          )}

          {/* Spec details card */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
            <Tag className="h-5 w-5 text-indigo-500 flex-shrink-0" />
            <div className="text-xs text-slate-600 leading-normal">
              Category: <span className="font-bold text-slate-900">{product.category?.name}</span> <br />
              Brand: <span className="font-bold text-slate-900">{product.brand}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Reviews Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8 border-t border-slate-100">
        
        {/* Reviews Left Column: Score breakdown */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Customer Reviews</h2>
          <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-5xl font-extrabold text-slate-900">{product.rating}</span>
              <div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-400">Based on {product.reviews.length} reviews</span>
              </div>
            </div>
          </div>

          {/* Write a review form */}
          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4 bg-white border border-slate-100 p-6 rounded-2xl shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm">Write a Customer Review</h3>
              
              {/* Rating selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Rating Score</label>
                <div className="flex space-x-1 text-slate-300">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className={`p-1 transition-colors ${
                        num <= rating ? 'text-amber-400' : 'hover:text-amber-300'
                      }`}
                    >
                      <Star className={`h-6 w-6 ${num <= rating ? 'fill-amber-400' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Review Comment</label>
                <textarea
                  rows="4"
                  placeholder="Share your experience using this product. What did you like, what could be improved?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs p-3 focus:outline-hidden focus:border-indigo-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-400 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
              </button>
            </form>
          ) : (
            <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl text-center space-y-3">
              <p className="text-xs text-amber-800 font-medium">
                Please log in to your customer account to submit a review for this product.
              </p>
              <Link to="/login" className="inline-block bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-lg">
                Log In
              </Link>
            </div>
          )}
        </div>
        </section>
        </div>
        );
      }
      export default ProductDetails;