import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { ShoppingBag, Eye, Calendar, DollarSign, Clock, CheckCircle } from 'lucide-react';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/orders/myorders');
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6 fade-in-up">
        <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-full">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">No Orders Yet</h2>
        <p className="text-slate-500 text-xs max-w-xs mx-auto">
          You haven't placed any orders yet. When you complete checkout, your order history will be displayed here.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-6 py-3 rounded-full"
        >
          Browse Shop Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Order History</h1>
        <p className="text-xs text-slate-500 mt-1">Review your past purchases, payments, and delivery tracking statuses</p>
      </div>

      {/* Orders List Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 sm:p-5">Order ID</th>
                <th className="p-4 sm:p-5">Date</th>
                <th className="p-4 sm:p-5">Total Bill</th>
                <th className="p-4 sm:p-5">Payment Status</th>
                <th className="p-4 sm:p-5">Shipping Status</th>
                <th className="p-4 sm:p-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
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
                  
                  {/* Total */}
                  <td className="p-4 sm:p-5 font-extrabold text-slate-950">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  
                  {/* Paid Badge */}
                  <td className="p-4 sm:p-5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                      order.isPaid
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        : 'bg-rose-50 border-rose-100 text-rose-700'
                    }`}>
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  
                  {/* Status Badge */}
                  <td className="p-4 sm:p-5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : order.status === 'Cancelled'
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>

                  {/* Actions Link */}
                  <td className="p-4 sm:p-5 text-right">
                    <Link
                      to={`/order/${order._id}`}
                      className="inline-flex items-center space-x-1 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-600 font-semibold px-3 py-1.5 rounded-lg transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">View Invoice</span>
                    </Link>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default OrderHistory;
