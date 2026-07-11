import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  
  // Dialog State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null if adding, product object if editing

  // Form Fields
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [keyword]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryStr = keyword ? `?keyword=${keyword}&page=1` : '?page=1';
      const { data } = await api.get(`/api/products${queryStr}`);
      // By default, paginated endpoint returns { products, page, pages, totalProducts }
      setProducts(data.products || []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/api/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setBrand('');
    setDescription('');
    setCategory(categories[0]?._id || '');
    setPrice('');
    setStock('');
    setImage('/uploads/sample-placeholder.jpg');
    setIsFeatured(false);
    setIsTrending(false);
    setIsNewArrival(false);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setTitle(product.title);
    setBrand(product.brand);
    setDescription(product.description);
    setCategory(product.category?._id || product.category);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setImage(product.images?.[0] || '/uploads/sample-placeholder.jpg');
    setIsFeatured(!!product.isFeatured);
    setIsTrending(!!product.isTrending);
    setIsNewArrival(!!product.isNewArrival);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const { data } = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImage(data.image);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title || !brand || !description || !category || !price || !stock) {
      return toast.error('Please enter all required fields');
    }

    const payload = {
      title,
      brand,
      description,
      category,
      price: Number(price),
      stock: Number(stock),
      images: [image],
      isFeatured,
      isTrending,
      isNewArrival
    };

    try {
      setSubmitting(true);
      if (editingProduct) {
        // Edit product
        await api.put(`/api/products/${editingProduct._id}`, payload);
        toast.success('Product updated successfully!');
      } else {
        // Add product
        await api.post('/api/products', payload);
        toast.success('Product created successfully!');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/api/products/${id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 -mx-4 sm:-mx-6 lg:-mx-8 -my-6">
      
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Products Catalog</h1>
            <p className="text-xs text-slate-500 mt-1">Manage catalog listings, prices, inventories, and promote flags</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Filters and search */}
        <div className="flex bg-white border border-slate-100 p-4 rounded-xl items-center shadow-xs">
          <input
            type="text"
            placeholder="Search products by title or brand..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs px-4 py-2 rounded-lg focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        {/* Table View */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Product Info</th>
                    <th className="p-4">Brand</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Promoted</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((prod) => (
                    <tr key={prod._id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Name/Thumbnail */}
                      <td className="p-4 flex items-center space-x-3 max-w-xs">
                        <img
                          src={prod.images?.[0] || '/uploads/sample-placeholder.jpg'}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover bg-slate-50 border flex-shrink-0"
                        />
                        <div className="truncate">
                          <span className="font-bold text-slate-900 block truncate">{prod.title}</span>
                          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">ID: {prod._id.slice(-8).toUpperCase()}</span>
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="p-4 text-slate-600 font-medium">{prod.brand}</td>
                      
                      {/* Category */}
                      <td className="p-4 text-slate-600 font-medium">
                        {prod.category?.name || 'Unassigned'}
                      </td>
                      
                      {/* Price */}
                      <td className="p-4 font-bold text-slate-950">${prod.price.toFixed(2)}</td>
                      
                      {/* Stock */}
                      <td className="p-4">
                        <span className={`font-bold ${prod.stock <= 5 ? 'text-rose-500 font-extrabold' : 'text-slate-600'}`}>
                          {prod.stock} units
                        </span>
                      </td>

                      {/* Promos */}
                      <td className="p-4 space-x-1">
                        {prod.isFeatured && (
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Feat</span>
                        )}
                        {prod.isTrending && (
                          <span className="bg-violet-50 text-violet-700 border border-violet-100 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Trend</span>
                        )}
                        {prod.isNewArrival && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">New</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg hover:text-indigo-600 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod._id)}
                          className="p-1.5 border border-rose-100 hover:bg-rose-50 text-slate-400 rounded-lg hover:text-rose-600 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Product Modal Dialog */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl fade-in-up">
              
              {/* Modal Header */}
              <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="text-base font-extrabold tracking-wide">
                  {editingProduct ? 'Edit Catalog Product' : 'Add New Product Listing'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Title */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-bold text-slate-600 block">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  {/* Brand */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 block">Brand *</label>
                    <input
                      type="text"
                      required
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 block">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-hidden focus:border-indigo-500 font-medium"
                    >
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 block">Price ($ USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  {/* Stock */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 block">Inventory Stock Count *</label>
                    <input
                      type="number"
                      required
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  {/* Image input & Upload */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-bold text-slate-600 block">Product Image URL / File *</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="text"
                        required
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-hidden focus:border-indigo-500"
                      />
                      
                      {/* Image Upload Input Selector */}
                      <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl cursor-pointer flex items-center space-x-1 shadow-xs whitespace-nowrap">
                        <Upload className="h-4 w-4" />
                        <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-bold text-slate-600 block">Description *</label>
                    <textarea
                      rows="4"
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-hidden focus:border-indigo-500"
                    ></textarea>
                  </div>

                  {/* Promote Flags */}
                  <div className="md:col-span-2 flex flex-wrap gap-6 pt-2 select-none">
                    <label className="flex items-center space-x-2 font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span>Featured Product</span>
                    </label>
                    <label className="flex items-center space-x-2 font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isTrending}
                        onChange={(e) => setIsTrending(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span>Trending Now</span>
                    </label>
                    <label className="flex items-center space-x-2 font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isNewArrival}
                        onChange={(e) => setIsNewArrival(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span>New Arrival</span>
                    </label>
                  </div>

                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold px-6 py-2.5 rounded-xl shadow-xs"
                  >
                    {submitting ? 'Saving changes...' : 'Save Product'}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default AdminProducts;
