import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal dialog States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/categories');
      setCategories(data);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImage('/uploads/electronics.jpg'); // Fallback placeholder path
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImage(cat.image || '/uploads/electronics.jpg');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description) {
      return toast.error('Please enter name and description');
    }

    const payload = {
      name,
      description,
      image
    };

    try {
      setSubmitting(true);
      if (editingCategory) {
        await api.put(`/api/categories/${editingCategory._id}`, payload);
        toast.success('Category updated successfully!');
      } else {
        await api.post('/api/categories', payload);
        toast.success('Category created successfully!');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await api.delete(`/api/categories/${id}`);
      toast.success('Category removed successfully');
      fetchCategories();
    } catch (err) {
      // Handles referential integrity error returned by backend controller check!
      toast.error(err.response?.data?.message || 'Failed to delete category');
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
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Categories Management</h1>
            <p className="text-xs text-slate-500 mt-1">Configure product categories and manage indexing parameters</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add New Category</span>
          </button>
        </div>

        {/* Categories List table */}
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
                    <th className="p-4">Category Info</th>
                    <th className="p-4">URL Slug</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Name & Icon */}
                      <td className="p-4 flex items-center space-x-3 max-w-xs">
                        <img
                          src={cat.image}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover bg-slate-50 border flex-shrink-0"
                        />
                        <span className="font-bold text-slate-900 truncate">{cat.name}</span>
                      </td>

                      {/* Slug */}
                      <td className="p-4 text-slate-500 font-mono font-medium">{cat.slug}</td>
                      
                      {/* Description */}
                      <td className="p-4 text-slate-600 max-w-sm font-medium line-clamp-1">{cat.description}</td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg hover:text-indigo-600 transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="p-1.5 border border-rose-100 hover:bg-rose-50 text-slate-400 rounded-lg hover:text-rose-600 transition-colors"
                          title="Delete Category"
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

        {/* Add/Edit Modal Form overlay */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl fade-in-up">
              
              {/* Modal Header */}
              <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="text-base font-extrabold tracking-wide">
                  {editingCategory ? 'Edit Category Parameters' : 'Add New Category'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form content */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
                
                {/* Category Name */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                {/* Image URL path */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Image Path / URL *</label>
                  <input
                    type="text"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Description *</label>
                  <textarea
                    rows="3"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-hidden focus:border-indigo-500"
                  ></textarea>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold px-6 py-2.5 rounded-xl"
                  >
                    {submitting ? 'Saving changes...' : 'Save Category'}
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

export default AdminCategories;
