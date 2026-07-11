import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { CheckCircle, Clock, CreditCard, Landmark, Truck, User, ArrowLeft, ShieldCheck } from 'lucide-react';

const OrderConfirmation = () => {
  const { id } = useParams();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  // Mock Credit Card Inputs
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/29');
  const [cvv, setCvv] = useState('123');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/orders/${id}`);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order:', err);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  const handleMockPayment = async (e) => {
    e.preventDefault();
    try {
      setPaying(true);
      const { data } = await api.put(`/api/orders/${id}/pay`, {
        id: `MOCK_CC_TXN_${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: order.user?.email
      });
      setOrder(data);
      toast.success('Mock payment processed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order? This will restore product stocks.')) {
      try {
        setLoading(true);
        const { data } = await api.put(`/api/orders/${order._id}/cancel`);
        setOrder(data);
        toast.success('Order cancelled successfully!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to cancel order');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReturnOrder = async () => {
    if (window.confirm('Are you sure you want to request a return/refund for this order?')) {
      try {
        setLoading(true);
        const { data } = await api.put(`/api/orders/${order._id}/return`);
        setOrder(data);
        toast.success('Return requested successfully!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to submit return request');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <h2 className="text-xl font-bold">Order Not Found</h2>
        <p className="text-slate-500 text-xs">We couldn't retrieve the transaction details for this order ID.</p>
        <Link to="/orders" className="inline-block bg-indigo-600 text-white text-xs font-semibold px-4 py-2.5 rounded-full">
          My Order History
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="text-xs text-slate-400 font-semibold block">Order Reference: #{order._id}</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 mt-1">Order Details</h1>
        </div>
        <div className="flex gap-2">
          {/* Print Invoice Button */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center text-xs font-bold px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs mr-2"
          >
            🖨️ Print Invoice
          </button>

          {/* Order Status Badge */}
          <span className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full border ${
            order.status === 'Delivered'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : order.status === 'Cancelled'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-indigo-50 border-indigo-200 text-indigo-700'
          }`}>
            Status: {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns: Info sections */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Success Hero */}
          {order.paymentMethod === 'COD' || order.isPaid ? (
            <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start gap-4 fade-in-up">
              <CheckCircle className="h-8 w-8 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="font-extrabold text-emerald-800 text-sm">Thank You for Your Order!</h3>
                <p className="text-xs text-emerald-700 mt-1">
                  Your order has been recorded successfully. A invoice summary has been prepared, and we will update you as the order changes shipping states.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start gap-4 fade-in-up">
              <Clock className="h-8 w-8 text-amber-600 flex-shrink-0 animate-pulse" />
              <div>
                <h3 className="font-extrabold text-amber-800 text-sm">Payment Verification Awaiting</h3>
                <p className="text-xs text-amber-700 mt-1">
                  This order has been created. Please complete the mock payment below using card details to process this order instantly.
                </p>
              </div>
            </div>
          )}

          {/* Visual Tracking Stepper */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4 fade-in-up">
            <h3 className="font-bold text-slate-900 text-sm">Order Status Tracking</h3>
            {['Cancelled', 'Returned'].includes(order.status) ? (
              <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl text-xs font-bold text-center">
                🚫 This order was {order.status.toLowerCase()}!
              </div>
            ) : (
              <div className="relative flex flex-col md:flex-row justify-between items-center gap-6 pt-4">
                {/* Stepper Line Background */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 hidden md:block z-0" />
                
                {/* Stepper Progress Fill */}
                <div 
                  className="absolute top-1/2 left-0 h-0.5 bg-indigo-600 -translate-y-1/2 hidden md:block z-0 transition-all duration-500" 
                  style={{
                    width: `${
                      order.status === 'Order Placed' ? '0%' :
                      order.status === 'Confirmed' ? '20%' :
                      order.status === 'Packed' ? '40%' :
                      order.status === 'Shipped' ? '60%' :
                      order.status === 'Out for Delivery' ? '80%' :
                      order.status === 'Delivered' ? '100%' : '0%'
                    }`
                  }}
                />

                {['Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].map((step, idx) => {
                  const statuses = ['Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
                  const activeIdx = statuses.indexOf(order.status);
                  const stepIdx = statuses.indexOf(step);
                  const isCompleted = stepIdx <= activeIdx;
                  const isActive = stepIdx === activeIdx;

                  return (
                    <div key={step} className="flex md:flex-col items-center gap-3 md:gap-2 z-10 w-full md:w-auto relative">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isCompleted ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                      } ${isActive ? 'ring-4 ring-indigo-100' : ''}`}>
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isCompleted ? 'text-indigo-600' : 'text-slate-400'
                      }`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Shipping & Payment Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Shipping Address */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-4">
              <div className="flex items-center space-x-2 text-slate-800 pb-2 border-b border-slate-50">
                <Truck className="h-4.5 w-4.5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 text-sm">Shipping Information</h3>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex items-center text-slate-700 mb-1.5 font-semibold">
                  <User className="h-4 w-4 mr-1 text-slate-400" />
                  <span>{order.user?.name} ({order.user?.email})</span>
                </div>
                <p>{order.shippingAddress?.address}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                <p>{order.shippingAddress?.country}</p>
                <div className="pt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Status: {order.isDelivered ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString()}` : 'Awaiting Delivery'}
                </div>
              </div>
            </div>

            {/* Payment Method Details */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-4">
              <div className="flex items-center space-x-2 text-slate-800 pb-2 border-b border-slate-50">
                <CreditCard className="h-4.5 w-4.5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 text-sm">Payment Status Overview</h3>
              </div>
              <div className="text-xs text-slate-600 space-y-2">
                <p>
                  Method: <span className="font-bold text-slate-900">{order.paymentMethod === 'Card' ? 'Credit / Debit Card' : 'Cash On Delivery'}</span>
                </p>
                <div className="flex items-center gap-2">
                  <span>Payment status:</span>
                  <span className={`inline-block font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                    order.isPaid
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}>
                    {order.isPaid ? 'PAID' : 'UNPAID'}
                  </span>
                </div>
                {order.isPaid && (
                  <div className="bg-slate-50 p-2.5 rounded-lg text-[10px] text-slate-500 font-medium">
                    Paid On: {new Date(order.paidAt).toLocaleString()} <br />
                    Reference: {order.paymentResult?.id}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Items Summary Table */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
            <h3 className="font-bold text-slate-950 text-sm mb-4 pb-2 border-b border-slate-50">Order Items</h3>
            <div className="divide-y divide-slate-100">
              {order.orderItems?.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3 max-w-[70%]">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-50 border flex-shrink-0">
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block line-clamp-1">{item.title}</span>
                      <span className="text-[10px] text-slate-400">Unit Price: ${item.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 mr-4">Qty: {item.quantity}</span>
                    <span className="font-extrabold text-slate-950">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Pricing Summary & Mock Payment Form */}
        <div className="space-y-6">
          
          {/* Order Billing Totals */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-bold text-slate-950 text-sm pb-2 border-b border-slate-50">Invoice Bill</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">${order.itemsPrice?.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span>-${order.discountAmount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Shipping Fee</span>
                <span>${order.shippingPrice?.toFixed(2)}</span>
              </div>
               <div className="flex justify-between text-slate-500">
                <span>GST (18%)</span>
                <span>${order.taxPrice?.toFixed(2)}</span>
              </div>
              
              <hr className="border-slate-50" />
              
              <div className="flex justify-between text-sm font-extrabold text-slate-950">
                <span>Paid Grand Total</span>
                <span className="text-base font-black">${order.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Mock Credit Card payment form (renders when unpaid & card selection) */}
          {!order.isPaid && (order.paymentMethod === 'Stripe' || order.paymentMethod === 'Razorpay') && (
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg space-y-4 fade-in-up">
              <div className="flex items-center space-x-2 text-indigo-400 pb-2 border-b border-slate-800">
                <Landmark className="h-4.5 w-4.5" />
                <h3 className="font-bold text-white text-sm">Secure Mock Payment Gateway</h3>
              </div>
              
              <form onSubmit={handleMockPayment} className="space-y-4 text-xs">
                
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Card Number</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl font-mono text-center text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Expiry Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-center text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">CVV Code</label>
                    <input
                      type="password"
                      required
                      placeholder="***"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-center text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={paying}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors mt-2 text-xs"
                >
                  <ShieldCheck className="h-4.5 w-4.5" />
                  <span>{paying ? 'Processing Gateway...' : `Pay $${order.totalPrice?.toFixed(2)}`}</span>
                </button>

              </form>
            </div>
          )}

          {/* Action Links */}
          <div className="flex flex-col gap-2">
            {['Order Placed', 'Confirmed'].includes(order.status) && (
              <button
                onClick={handleCancelOrder}
                className="w-full bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-center font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-1 cursor-pointer transition-colors"
              >
                <span>🚫 Cancel Order</span>
              </button>
            )}

            {order.status === 'Delivered' && (
              <button
                onClick={handleReturnOrder}
                className="w-full bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 text-center font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-1 cursor-pointer transition-colors"
              >
                <span>📦 Request Return / Refund</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-1 cursor-pointer transition-colors shadow-xs"
            >
              <span>🖨️ Print Invoice (PDF)</span>
            </button>

            <Link
              to="/orders"
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-center font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Order History</span>
            </Link>
            <Link
              to="/shop"
              className="w-full text-indigo-600 hover:text-indigo-800 font-bold text-center text-xs"
            >
              Continue Shopping Catalog
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};

export default OrderConfirmation;
