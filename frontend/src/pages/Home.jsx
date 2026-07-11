import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import { ArrowRight, ShoppingBag, Truck, RotateCcw, ShieldCheck } from 'lucide-react';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('featured'); // 'featured', 'trending', 'new'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoriesRes = await api.get('/api/categories');
        const productsRes = await api.get('/api/products?page=1'); // fetches newest page
        
        setCategories(categoriesRes.data);
        setProducts(productsRes.data.products);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products client side based on seeded properties
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  const trendingProducts = products.filter(p => p.isTrending).slice(0, 4);
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 4);

  const getActiveTabProducts = () => {
    switch (activeTab) {
      case 'featured':
        return featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4);
      case 'trending':
        return trendingProducts.length > 0 ? trendingProducts : products.slice(2, 6);
      case 'new':
        return newArrivals.length > 0 ? newArrivals : products.slice(4, 8);
      default:
        return products.slice(0, 4);
    }
  };

  return (
    <div className="space-y-16 py-4">
      
      {/* Hero Banner Section */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[450px] flex items-center shadow-lg">
        
        {/* Banner decorative background blur */}
        <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: "url('/uploads/electronics.jpg')" }}></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl"></div>
        
        {/* Content */}
        <div className="relative max-w-2xl mx-auto text-center px-6 py-16 space-y-6">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/60 px-4 py-1.5 rounded-full border border-indigo-900/50">
            Exclusive Summer Launch
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Elevate Your Everyday <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent">
              With Pure Aesthetics
            </span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-lg mx-auto">
            Discover a curated collection of premium gadgets, high-end fashion outerwear, organic cosmetics, and elite athletic wear.
          </p>
          <div className="pt-4 flex justify-center space-x-4">
            <Link
              to="/shop"
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-full transition-all shadow-md shadow-indigo-900/30 hover:scale-102"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              <span>Explore Collection</span>
            </Link>
            <Link
              to="/shop?category=electronics"
              className="flex items-center space-x-1 border border-slate-700 hover:border-slate-500 text-slate-200 text-sm font-semibold px-6 py-3 rounded-full transition-all"
            >
              <span>Latest Tech</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Value Propositions */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white border border-slate-100 p-8 rounded-3xl shadow-xs">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Free Express Shipping</h4>
            <p className="text-xs text-slate-500 mt-1">Free delivery for all orders exceeding $150.00</p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <RotateCcw className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Hassle-Free Returns</h4>
            <p className="text-xs text-slate-500 mt-1">30-day money-back guarantee policy</p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">100% Secure Checkout</h4>
            <p className="text-xs text-slate-500 mt-1">Industry standard encrypted payments</p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <span className="font-extrabold text-sm block">🏷️</span>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Member Promos</h4>
            <p className="text-xs text-slate-500 mt-1">Get up to 50% discount with promo codes</p>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Shop by Category</h2>
            <p className="text-xs text-slate-500 mt-1">Explore our range of premium products by category</p>
          </div>
          <Link to="/shop" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl skeleton-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {categories.map(category => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        )}
      </section>

      {/* Dynamic Product Tabs Section */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Curated Collections</h2>
            <p className="text-xs text-slate-500 mt-1">Handpicked arrivals and trending selections</p>
          </div>
          
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-full space-x-1 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                activeTab === 'featured' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Featured Products
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                activeTab === 'trending' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Trending Now
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                activeTab === 'new' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New Arrivals
            </button>
          </div>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {getActiveTabProducts().map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Discount/Offer Banner */}
      <section className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl font-bold text-slate-950">Special Welcome Promotion! 🏷️</h3>
          <p className="text-sm text-indigo-900/80">
            Use code <span className="font-extrabold text-indigo-600">WELCOME20</span> at checkout to receive an instant 20% discount on your order.
          </p>
        </div>
        <Link
          to="/shop"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-3 rounded-full transition-colors whitespace-nowrap"
        >
          Claim Discount
        </Link>
      </section>

    </div>
  );
};

export default Home;
