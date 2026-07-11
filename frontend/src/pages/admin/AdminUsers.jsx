import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Calendar, User, ShieldAlert, Trash2, ArrowUpDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/users');
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`Are you sure you want to change this user's role to "${newRole}"?`)) return;

    try {
      await api.put(`/api/users/${userId}`, { role: newRole });
      toast.success(`Role updated successfully to "${newRole}"!`);
      
      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account? This cannot be undone.')) return;

    try {
      await api.delete(`/api/users/${userId}`);
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 -mx-4 sm:-mx-6 lg:-mx-8 -my-6">
      
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-10 space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Manage Users</h1>
            <p className="text-xs text-slate-500 mt-1">Manage user account details, assign administrator roles, and close accounts</p>
          </div>
        </div>

        {/* Users Table */}
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
                    <th className="p-4 sm:p-5">User Info</th>
                    <th className="p-4 sm:p-5">Joined Date</th>
                    <th className="p-4 sm:p-5">System Role</th>
                    <th className="p-4 sm:p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Name/Email */}
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center space-x-3 text-slate-700">
                          <div className="p-2 bg-slate-100 text-slate-500 rounded-lg flex-shrink-0">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{item.name}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{item.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Created At Date */}
                      <td className="p-4 sm:p-5 text-slate-500">
                        <span className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      {/* System Role */}
                      <td className="p-4 sm:p-5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.role === 'admin'
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        }`}>
                          {item.role === 'admin' ? 'Administrator' : 'Customer'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 sm:p-5 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleRoleToggle(item._id, item.role)}
                          className="inline-flex items-center space-x-1 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-600 font-semibold px-3 py-1.5 rounded-lg transition-all"
                          title="Toggle Admin/Customer role"
                        >
                          <ShieldAlert className="h-3.5 w-3.5 text-indigo-500" />
                          <span>Change Role</span>
                        </button>
                        
                        <button
                          onClick={() => handleDeleteUser(item._id)}
                          className="p-1.5 border border-rose-100 hover:bg-rose-50 text-slate-400 rounded-lg hover:text-rose-600 transition-colors"
                          title="Delete User Account"
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

      </main>

    </div>
  );
};

export default AdminUsers;
