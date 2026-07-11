import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { MapPin, CreditCard, ShoppingBag, ArrowRight } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotals, coupon, clearCart } = useCart();

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Form States
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Stripe'); // 'Stripe', 'Razorpay', or 'COD'
  
  const [placingOrder, setPlacingOrder] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState('new');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await api.get('/api/auth/profile');
        setSavedAddresses(data.savedAddresses || []);
      } catch (err) {
        console.error('Failed to load profile addresses:', err);
      }
    };
    fetchUserProfile();
  }, []);

  const handleAddressSelect = (e) => {
    const value = e.target.value;
    setSelectedAddressIndex(value);
    if (value === 'new') {
      setAddress('');
      setCity('');
      setPostalCode('');
      setCountry('');
    } else {
      const selected = savedAddresses[Number(value)];
      if (selected) {
        setAddress(selected.address);
        setCity(selected.city);
        setPostalCode(selected.postalCode);
        setCountry(selected.country);
      }
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!address || !city || !postalCode || !country) {
      return toast.error('Please fill in all shipping address fields');
    }

    try {
      setPlacingOrder(true);

      const orderData = {
        orderItems: cartItems.map(item => ({
          title: item.product.title,
          quantity: item.quantity,
          image: item.product.images?.[0] || '/uploads/sample-placeholder.jpg',
          price: item.product.price,
          product: item.product._id
        })),
        shippingAddress: {
          address,
          city,
          postalCode,
          country
        },
        paymentMethod,
        itemsPrice: cartTotals.subtotal,
        shippingPrice: cartTotals.shipping,
        taxPrice: cartTotals.tax,
        discountAmount: cartTotals.discount,
        totalPrice: cartTotals.total,
        couponCode: coupon ? coupon.code : ''
      };

      const { data } = await api.post('/api/orders', orderData);
      
      // Clear cart locally and on server
      await clearCart();
      toast.success('Order placed successfully!');
      
      // Redirect to Order Confirmation page
      navigate(`/order/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Secure Checkout</h1>
        <p className="text-xs text-slate-500 mt-1">Please enter your shipping address and choose a payment method</p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns: Address & Payment */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Shipping Address Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-50">
              <MapPin className="h-5 w-5 text-indigo-500" />
              <h2 className="font-extrabold text-slate-950 text-base">Shipping Details</h2>
            </div>

            {savedAddresses.length > 0 && (
              <div className="space-y-1.5 text-xs pb-2">
                <label className="font-bold text-slate-600 block">Select from Saved Addresses</label>
                <select
                  value={selectedAddressIndex}
                  onChange={handleAddressSelect}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-hidden focus:border-indigo-500 text-slate-700 font-semibold"
                >
                  <option value="new">-- Enter a new shipping address --</option>
                  {savedAddresses.map((addr, idx) => (
                    <option key={idx} value={idx}>
                      🏡 {addr.address}, {addr.city}, {addr.postalCode}, {addr.country}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              <div className="md:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-600 block">Street Address</label>
                <input
                  type="text"
                  placeholder="Apartment, suite, unit, building, street address"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block">City</label>
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block">Postal / ZIP Code</label>
                <input
                  type="text"
                  placeholder="Postal Code"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-600 block">Country</label>
                <input
                  type="text"
                  placeholder="Country"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-hidden focus:border-indigo-500"
                />
              </div>

            </div>
          </div>

          {/* Payment Method Selector Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-50">
              <CreditCard className="h-5 w-5 text-indigo-500" />
              <h2 className="font-extrabold text-slate-950 text-base">Payment Method</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Stripe Option */}
              <label className={`border p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === 'Stripe' ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-200 bg-slate-50/30'
              }`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    value="Stripe"
                    checked={paymentMethod === 'Stripe'}
                    onChange={() => setPaymentMethod('Stripe')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">Stripe Gateway</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Pay with Stripe Card</span>
                  </div>
                </div>
                <span className="text-lg">💳</span>
              </label>

              {/* Razorpay Option */}
              <label className={`border p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === 'Razorpay' ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-200 bg-slate-50/30'
              }`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    value="Razorpay"
                    checked={paymentMethod === 'Razorpay'}
                    onChange={() => setPaymentMethod('Razorpay')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">Razorpay Wallet</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">UPI / Net Banking</span>
                  </div>
                </div>
                <span className="text-lg">📱</span>
              </label>

              {/* Cash On Delivery Option */}
              <label className={`border p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === 'COD' ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-200 bg-slate-50/30'
              }`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">COD</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Cash On Delivery</span>
                  </div>
                </div>
                <span className="text-lg">💵</span>
              </label>

            </div>

            {/* Conditionally Render Stripe Mock Inputs */}
            {paymentMethod === 'Stripe' && (
              <div className="border border-indigo-100 bg-indigo-50/5 p-4 rounded-xl space-y-3 text-xs fade-in-up">
                <h3 className="font-bold text-slate-800">Stripe Payment details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2 space-y-1">
                    <label className="font-bold text-slate-500">Card Number</label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242 (Stripe Mock)"
                      maxLength="19"
                      required
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-hidden focus:border-indigo-500 text-xs font-semibold text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Expiration Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength="5"
                      required
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-hidden focus:border-indigo-500 text-xs font-semibold text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">CVV / CVC</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength="3"
                      required
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-hidden focus:border-indigo-500 text-xs font-semibold text-slate-700"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Conditionally Render Razorpay Mock Inputs */}
            {paymentMethod === 'Razorpay' && (
              <div className="border border-indigo-100 bg-indigo-50/5 p-4 rounded-xl space-y-3 text-xs fade-in-up">
                <h3 className="font-bold text-slate-800">Razorpay UPI details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">UPI Virtual Address ID</label>
                    <input
                      type="text"
                      placeholder="username@okaxis"
                      required
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-hidden focus:border-indigo-500 text-xs font-semibold text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">UPI Mobile Number</label>
                    <input
                      type="text"
                      placeholder="+91 99999 88888"
                      maxLength="15"
                      required
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-hidden focus:border-indigo-500 text-xs font-semibold text-slate-700"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Checkout Summary */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-50">
            <ShoppingBag className="h-5 w-5 text-indigo-500" />
            <h2 className="font-extrabold text-slate-950 text-base">Items Overview</h2>
          </div>

          {/* Cart review scroll-list */}
          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 pr-1">
            {cartItems.map((item) => (
              <div key={item.product._id} className="py-3 flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2.5 truncate max-w-[70%]">
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-50 border flex-shrink-0">
                    <img src={item.product.images?.[0]} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-slate-900 block truncate">{item.product.title}</span>
                    <span className="text-[10px] text-slate-400">Qty: {item.quantity}</span>
                  </div>
                </div>
                <span className="font-bold text-slate-900">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <hr className="border-slate-100" />

          {/* Calculations */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Items Total</span>
              <span className="font-semibold text-slate-900">${cartTotals.subtotal.toFixed(2)}</span>
            </div>
            {coupon && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount ({coupon.code})</span>
                <span>-${cartTotals.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Shipping Fee</span>
              <span className="font-semibold text-slate-900">
                {cartTotals.shipping === 0 ? 'FREE' : `$${cartTotals.shipping.toFixed(2)}`}
              </span>
            </div>
             <div className="flex justify-between text-slate-500">
              <span>GST (18%)</span>
              <span className="font-semibold text-slate-900">${cartTotals.tax.toFixed(2)}</span>
            </div>
            
            <hr className="border-slate-100" />
            
            <div className="flex justify-between text-sm font-extrabold text-slate-950">
              <span>Grand Total</span>
              <span className="text-base font-black">${cartTotals.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            type="submit"
            disabled={placingOrder}
            className="w-full bg-slate-950 hover:bg-indigo-600 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-colors mt-4"
          >
            <span>{placingOrder ? 'Processing...' : 'Place Secure Order'}</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </div>

      </form>
    </div>
  );
};

export default Checkout;
