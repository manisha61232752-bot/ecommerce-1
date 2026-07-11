import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import { SlidersHorizontal, ArrowUpDown, RefreshCw, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State variables
  const [products, setProducts] = useState([]);
  const [comparedProducts, setComparedProducts] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const handleCompareToggle = (product) => {
    const exists = comparedProducts.some(p => p._id === product._id);
    if (exists) {
      setComparedProducts(comparedProducts.filter(p => p._id !== product._id));
    } else {
      if (comparedProducts.length >= 3) {
        toast.error('You can compare a maximum of 3 products at a time!');
        return;
      }
      setComparedProducts([...comparedProducts, product]);
    }
  };
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filters read from URL search params
  const categoryParam = searchParams.get('category') || '';
  const keywordParam = searchParams.get('keyword') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const ratingParam = searchParams.get('rating') || '';
  const sortByParam = searchParams.get('sortBy') || '';

  // Local filter states for input inputs
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync inputs with URL change
  useEffect(() => {
    setMinPrice(minPriceParam);
    setMaxPrice(maxPriceParam);
  }, [minPriceParam, maxPriceParam]);

  // Fetch Categories on Mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/api/categories');
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products when searchParams or page changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams(searchParams);
        queryParams.set('page', currentPage.toString());

        const { data } = await api.get(`/api/products?${queryParams.toString()}`);
        setProducts(data.products);
        setTotalPages(data.pages);
        setTotalProducts(data.totalProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, currentPage]);

  // Handle URL searches updates
  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page'); // Reset pagination to page 1 on filter update
    setCurrentPage(1);
    setSearchParams(newParams);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (minPrice) newParams.set('minPrice', minPrice);
    else newParams.delete('minPrice');
    
    if (maxPrice) newParams.set('maxPrice', maxPrice);
    else newParams.delete('maxPrice');
    
    newParams.delete('page');
    setCurrentPage(1);
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div className="space-y-6 py-4">
      {/* Title / Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Shop Collection</h1>
          <p className="text-xs text-slate-500 mt-1">
            {loading ? 'Searching catalog...' : `Showing ${totalProducts} premium products matching your query`}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center space-x-2 border border-slate-200 bg-white px-4 py-2.5 rounded-xl text-sm font-semibold"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </button>

          {/* Sort Selection */}
          <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm">
            <ArrowUpDown className="h-4 w-4 text-slate-400" />
            <select
              value={sortByParam}
              onChange={(e) => updateFilters('sortBy', e.target.value)}
              className="bg-transparent border-0 focus:outline-hidden font-medium text-slate-700"
            >
              <option value="">Sort By: Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Avg. Rating</option>
            </select>
          </div>

          {/* Clear Filters */}
          {Object.keys(Object.fromEntries(searchParams)).length > 0 && (
            <button
              onClick={clearAllFilters}
              className="p-2 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-sm transition-colors"
              title="Reset all filters"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-8 items-start">
        
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden md:block w-64 bg-white border border-slate-100 p-6 rounded-2xl space-y-6 sticky top-20 shadow-xs">
          
          {/* Categories list */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Categories</h3>
            <div className="flex flex-col space-y-1.5 text-sm">
              <button
                onClick={() => updateFilters('category', '')}
                className={`text-left py-1 font-medium transition-colors ${
                  categoryParam === '' ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-indigo-500'
                }`}
              >
                All Products
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => updateFilters('category', cat.slug)}
                  className={`text-left py-1 font-medium transition-colors ${
                    categoryParam === cat.slug ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-indigo-500'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Price Range inputs */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Price Range</h3>
            <form onSubmit={handlePriceApply} className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
              >
                Apply Prices
              </button>
            </form>
          </div>

          <hr className="border-slate-100" />

          {/* Rating filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Minimum Rating</h3>
            <div className="flex flex-col space-y-1.5">
              {[4, 3, 2].map((num) => (
                <button
                  key={num}
                  onClick={() => updateFilters('rating', num.toString())}
                  className={`flex items-center text-xs font-medium space-x-1.5 transition-colors ${
                    ratingParam === num.toString() ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < num ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span>& Up</span>
                </button>
              ))}
              <button
                onClick={() => updateFilters('rating', '')}
                className={`text-left text-xs font-medium pt-1 ${
                  ratingParam === '' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Any Rating
              </button>
            </div>
          </div>

        </aside>

        {/* Mobile Filters Drawer Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 md:hidden bg-black/50 backdrop-blur-xs flex justify-end">
            <div className="w-80 bg-white h-full p-6 overflow-y-auto flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-slate-950">Filters</h2>
                  <button onClick={() => setShowMobileFilters(false)} className="text-slate-400 text-sm font-bold">Close</button>
                </div>
                
                {/* Mobile Categories list */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => { updateFilters('category', ''); setShowMobileFilters(false); }}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          categoryParam === '' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        All
                      </button>
                      {categories.map(cat => (
                        <button
                          key={cat._id}
                          onClick={() => { updateFilters('category', cat.slug); setShowMobileFilters(false); }}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                            categoryParam === cat.slug ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Mobile Price selection */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Price Range</h3>
                    <form onSubmit={(e) => { handlePriceApply(e); setShowMobileFilters(false); }} className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg"
                        />
                        <span className="text-slate-400">-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg"
                        />
                      </div>
                      <button type="submit" className="w-full bg-indigo-600 text-white text-xs font-semibold py-2.5 rounded-lg">
                        Apply
                      </button>
                    </form>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Mobile Rating selector */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Minimum Rating</h3>
                    <div className="flex flex-col space-y-2">
                      {[4, 3, 2].map((num) => (
                        <button
                          key={num}
                          onClick={() => { updateFilters('rating', num.toString()); setShowMobileFilters(false); }}
                          className={`flex items-center text-xs space-x-2 text-slate-600 ${
                            ratingParam === num.toString() ? 'text-indigo-600 font-bold' : ''
                          }`}
                        >
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < num ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                            ))}
                          </div>
                          <span>& Up</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { clearAllFilters(); setShowMobileFilters(false); }}
                className="w-full border border-slate-200 text-slate-700 text-xs font-bold py-3 rounded-lg hover:bg-slate-50 transition-colors mt-8"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <div className="flex-1 space-y-10">
          
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
              <span className="text-4xl block">🔍</span>
              <h2 className="text-lg font-bold text-slate-900">No products found</h2>
              <p className="text-xs text-slate-500">
                We couldn't find any products matching your current filters. Try relaxing your parameters or searching for a different keyword.
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2.5 rounded-full"
              >
                Reset Catalog Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isCompared={comparedProducts.some(p => p._id === product._id)}
                  onCompare={handleCompareToggle}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-6">
              {[...Array(totalPages)].map((_, idx) => {
                const pageNumber = idx + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => {
                      setCurrentPage(pageNumber);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`h-9 w-9 text-xs font-bold rounded-lg border transition-all ${
                      currentPage === pageNumber
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* Floating Bottom Comparison Drawer */}
      {comparedProducts.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl p-4 z-40 fade-in-up">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-bold text-slate-900">Comparing ({comparedProducts.length}/3 products):</span>
              <div className="flex gap-2">
                {comparedProducts.map(p => (
                  <div key={p._id} className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <span>{p.title}</span>
                    <button
                      onClick={() => setComparedProducts(comparedProducts.filter(item => item._id !== p._id))}
                      className="text-rose-500 hover:text-rose-700 font-bold ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setComparedProducts([])}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Clear All
              </button>
              {comparedProducts.length >= 2 && (
                <button
                  onClick={() => setShowCompareModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg"
                >
                  Compare Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal Overlay */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative fade-in-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-xl font-extrabold text-slate-950">⚖️ Product Comparison</h2>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 text-xs md:text-sm">
              {/* Labels Column */}
              <div className="space-y-4 font-bold text-slate-500 pr-2 border-r border-slate-100">
                <div className="h-40 flex items-center">Product Image</div>
                <div className="h-10 flex items-center">Name</div>
                <div className="h-8 flex items-center">Brand</div>
                <div className="h-8 flex items-center">Price</div>
                <div className="h-8 flex items-center">Rating</div>
                <div className="h-8 flex items-center">Stock</div>
                <div className="flex-1 pt-2">Description</div>
              </div>

              {/* Products Columns */}
              {comparedProducts.map(p => (
                <div key={p._id} className="space-y-4 text-center">
                  <div className="h-40 rounded-xl overflow-hidden bg-slate-50 relative">
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="h-10 font-bold text-slate-900 line-clamp-2 text-left px-1">{p.title}</div>
                  <div className="h-8 text-slate-600 flex items-center justify-center">{p.brand}</div>
                  <div className="h-8 font-extrabold text-slate-950 flex items-center justify-center">${p.price.toFixed(2)}</div>
                  <div className="h-8 text-amber-500 font-semibold flex items-center justify-center">★ {p.rating} ({p.numReviews})</div>
                  <div className="h-8 flex items-center justify-center">
                    {p.stock > 0 ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">In Stock ({p.stock})</span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">Sold Out</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 text-left line-clamp-4">{p.description}</p>
                </div>
              ))}

              {/* Empty placeholder columns to maintain grid structure */}
              {[...Array(3 - comparedProducts.length)].map((_, i) => (
                <div key={i} className="border border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 text-xs py-12">
                  Select another product
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Shop;
