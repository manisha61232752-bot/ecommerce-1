import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Calendar, User, Eye, ArrowUpDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === '' ? true : order.status === statusFilter;

    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      if (dateFilter === 'today') {
        matchesDate = orderDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        matchesDate = orderDate >= oneWeekAgo;
      } else if (dateFilter === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        matchesDate = orderDate >= oneMonthAgo;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      return toast.error('No orders to export');
    }
    const headers = ['Order ID', 'Date', 'Customer Name', 'Customer Email', 'Total Price', 'Payment Method', 'Payment Status', 'Shipping Status'];
    const rows = filteredOrders.map(o => [
      o._id,
      new Date(o.createdAt).toLocaleDateString(),
      o.user?.name || 'Deleted Account',
      o.user?.email || 'N/A',
      o.totalPrice.toFixed(2),
      o.paymentMethod,
      o.isPaid ? 'Paid' : 'Unpaid',
      o.status
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aura_orders_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Orders exported to CSV successfully!');
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/orders');
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders list');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to "${newStatus}"`);
      
      // Update local state without full reload
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: newStatus, isDelivered: newStatus === 'Delivered' } : order
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
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
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Manage Orders</h1>
            <p className="text-xs text-slate-500 mt-1">Review system orders, payment confirmations, and update shipping stages</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            📊 Export Current List (CSV)
          </button>
        </div>

        {/* Filters and Search Bar row */}
        <div className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center text-xs">
          {/* Search Input */}
          <div className="w-full md:flex-1 relative">
            <input
              type="text"
              placeholder="Search by Order ID, customer name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-hidden focus:border-indigo-500 font-semibold"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-hidden focus:border-indigo-500 font-bold"
            >
              <option value="">All Statuses</option>
              <option value="Order Placed">Order Placed</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Returned">Returned</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="w-full md:w-44">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-hidden focus:border-indigo-500 font-bold"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
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
                    <th className="p-4 sm:p-5">Order ID</th>
                    <th className="p-4 sm:p-5">Date</th>
                    <th className="p-4 sm:p-5">Customer</th>
                    <th className="p-4 sm:p-5">Total Bill</th>
                    <th className="p-4 sm:p-5">Payment</th>
                    <th className="p-4 sm:p-5">Shipping Status</th>
                    <th className="p-4 sm:p-5 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-10 text-center text-slate-400 font-bold">
                        No orders match the current search or filters.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Order ID */}
                      <td className="p-4 sm:p-5 font-mono text-slate-900 font-bold">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>

                      {/* Date */}
                      <td className="p-4 sm:p-5 text-slate-500">
                        <span className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Customer info */}
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center space-x-1.5 text-slate-700">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <div>
                            <span className="font-bold text-slate-900 block">{order.user?.name || 'Deleted Account'}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{order.user?.email || ''}</span>
                          </div>
                        </div>
                      </td>

                      {/* Total bill */}
                      <td className="p-4 sm:p-5 font-extrabold text-slate-950">
                        ${order.totalPrice.toFixed(2)}
                      </td>

                      {/* Paid State */}
                      <td className="p-4 sm:p-5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                          order.isPaid
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                            : 'bg-rose-50 border-rose-100 text-rose-700'
                        }`}>
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium block mt-1">
                          {order.paymentMethod === 'Card' ? 'Credit Card' : 'COD'}
                        </span>
                      </td>

                      {/* Shipping status selector & Accept/Reject triggers */}
                      <td className="p-4 sm:p-5">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-hidden font-bold ${
                            order.status === 'Delivered'
                              ? 'text-emerald-700 border-emerald-100 bg-emerald-50/20'
                              : order.status === 'Cancelled' || order.status === 'Returned'
                              ? 'text-rose-700 border-rose-100 bg-rose-50/20'
                              : 'text-indigo-700 border-indigo-100 bg-indigo-50/20'
                          }`}
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Returned">Returned</option>
                        </select>

                        {order.status === 'Order Placed' && (
                          <div className="flex gap-1 mt-2">
                            <button
                              onClick={() => handleStatusChange(order._id, 'Confirmed')}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-md font-bold cursor-pointer transition-colors"
                              title="Accept Order"
                            >
                              ✓ Accept
                            </button>
                            <button
                              onClick={() => handleStatusChange(order._id, 'Cancelled')}
                              className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-md font-bold cursor-pointer transition-colors"
                              title="Reject Order"
                            >
                              × Reject
                            </button>
                          </div>
                        )}
                      </td>

                      {/* View Action link */}
                      <td className="p-4 sm:p-5 text-right">
                        <a
                          href={`/order/${order._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-600 font-semibold px-3 py-1.5 rounded-lg transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">View Details</span>
                        </a>
                      </td>

                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default AdminOrders;
