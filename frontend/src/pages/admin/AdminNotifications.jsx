import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Send, Trash2, Shield, User, Info, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminNotifications = () => {
  const [history, setHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [targetUser, setTargetUser] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('System');
  const [submitting, setSubmitting] = useState(false);

  const fetchHistoryAndUsers = async () => {
    try {
      setLoading(true);
      const [historyRes, usersRes] = await Promise.all([
        api.get('/api/notifications/admin/history'),
        api.get('/api/users')
      ]);
      setHistory(historyRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      toast.error('Failed to load notifications history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryAndUsers();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/api/notifications', {
        targetUser,
        title,
        message,
        type
      });
      toast.success('Notification sent successfully!');
      setTitle('');
      setMessage('');
      setTargetUser('all');
      setType('System');
      fetchHistoryAndUsers();
    } catch (err) {
      console.error('Error sending notification:', err);
      toast.error('Failed to send notification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification from history?')) return;
    try {
      await api.delete(`/api/notifications/${id}`);
      toast.success('Notification deleted');
      setHistory(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 -mx-4 sm:-mx-6 lg:-mx-8 -my-6 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-10 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Notification Center</h1>
          <p className="text-xs text-slate-500 mt-1">Send manual updates, marketing promos, or system announcements to specific customers or globally</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Send Notification Card */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs h-fit">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
              <Send className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Compose Alert
            </h2>

            <form onSubmit={handleSend} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400">Recipient Target</label>
                <select
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-medium"
                >
                  <option value="all">All Registered Customers (Broadcast)</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email}) - {u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400">Notification Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-medium"
                >
                  <option value="System">System Update</option>
                  <option value="Promo">Coupon / Discount Promo</option>
                  <option value="NewProduct">New Product Alerts</option>
                  <option value="Order">Order Related updates</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400">Title</label>
                <input
                  type="text"
                  placeholder="e.g. 50% Off Autumn Jackets!"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400">Message Content</label>
                <textarea
                  placeholder="Type message description..."
                  required
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer text-xs"
              >
                {submitting ? 'Sending...' : 'Broadcast Notification'}
              </button>
            </form>
          </div>

          {/* History List Card */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Notification Dispatch History
            </h2>

            {loading ? (
              <div className="space-y-4 py-8 text-center text-xs text-slate-500">
                <div className="spinner mx-auto mb-2"></div>
                Loading dispatch histories...
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                No notifications logged in system dispatch logs.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                      <th className="py-3 px-2">Recipient</th>
                      <th className="py-3 px-2">Type</th>
                      <th className="py-3 px-2">Content</th>
                      <th className="py-3 px-2 text-center">Status</th>
                      <th className="py-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                    {history.map((n) => (
                      <tr key={n._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                        <td className="py-3 px-2 font-medium">
                          {n.user ? (
                            <span className="flex items-center text-slate-700 dark:text-slate-300">
                              <User className="h-3.5 w-3.5 mr-1 text-slate-400" />
                              {n.user.name || 'User'}
                            </span>
                          ) : (
                            <span className="flex items-center text-amber-600 dark:text-amber-400">
                              <Shield className="h-3.5 w-3.5 mr-1" />
                              Broadcast
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[9px] ${
                            n.type === 'Order' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200' :
                            n.type === 'Promo' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200' :
                            n.type === 'NewProduct' ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-200' :
                            'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-750'
                          }`}>
                            {n.type}
                          </span>
                        </td>
                        <td className="py-3 px-2 max-w-xs">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                          <p className="text-slate-500 dark:text-slate-400 mt-0.5 truncate">{n.message}</p>
                        </td>
                        <td className="py-3 px-2 text-center">
                          {n.isRead ? (
                            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                              <CheckCircle2 className="h-3 w-3 mr-0.5" /> Read
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-slate-400 text-[10px] font-semibold">
                              Unread
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => handleDelete(n._id)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg cursor-pointer transition-colors"
                            title="Delete Notification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminNotifications;
