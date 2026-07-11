import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Trash2, ArrowRight, Tag, X, ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    coupon,
    updateCartQty,
    removeFromCart,
    clearCart,
    applyCouponCode,
    removeCoupon,
    cartTotals
  } = useCart();

  const { isAuthenticated } = useAuth();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [submittingCoupon, setSubmittingCoupon] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    try {
      setSubmittingCoupon(true);
      const data = await applyCouponCode(couponCodeInput.trim());
      toast.success(`Coupon "${data.code}" applied: ${data.discountPercentage}% discount!`);
      setCouponCodeInput('');
    } catch (err) {
      toast.error(err.message || 'Invalid coupon code');
    } finally {
      setSubmittingCoupon(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length > 0) {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6 fade-in-up">
        <div className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-full">
          <ShoppingCart className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Your Shopping Cart is Empty</h2>
        <p className="text-slate-500 text-xs max-w-xs mx-auto">
          Looks like you haven't added anything to your cart yet. Head back to our shop to explore our premium collections.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-6 py-3 rounded-full shadow-md shadow-indigo-900/10 transition-transform hover:scale-102"
        >
          Go Shop Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Shopping Cart</h1>
        <p className="text-xs text-slate-500 mt-1">Review your selections and proceed to secure checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Items list */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="divide-y divide-slate-100">
              {cartItems.map((item) => {
                const product = item.product;
                const imageUrl = product.images?.[0] || '/uploads/sample-placeholder.jpg';
                
                return (
                  <div key={product._id} className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    
                    {/* Thumbnail & Meta */}
                    <div className="flex gap-4 items-center flex-1">
                      <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <Link to={`/product/${product._id}`} className="font-bold text-slate-900 hover:text-indigo-600 text-sm line-clamp-1 transition-colors">
                          {product.title}
                        </Link>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                          {product.brand}
                        </span>
                      </div>
                    </div>

                    {/* Stepper, Price & Actions */}
                    <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                      
                      {/* Price per Unit */}
                      <span className="text-xs font-semibold text-slate-400 sm:w-16 sm:text-right hidden sm:inline">
                        ${product.price.toFixed(2)}
                      </span>

                      {/* Stepper */}
                      <div className="flex border border-slate-200 rounded-lg overflow-hidden h-9 w-24 justify-between items-center bg-white">
                        <button
                          type="button"
                          onClick={() => updateCartQty(product._id, item.quantity - 1)}
                          className="px-2 h-full hover:bg-slate-50 font-bold text-slate-500"
                        >
                          -
                        </button>
                        <span className="text-xs font-semibold text-slate-800">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(product._id, item.quantity + 1)}
                          className="px-2 h-full hover:bg-slate-50 font-bold text-slate-500"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <span className="text-sm font-extrabold text-slate-900 sm:w-20 sm:text-right">
                        ${(product.price * item.quantity).toFixed(2)}
                      </span>

                      {/* Trash Button */}
                      <button
                        onClick={() => {
                          removeFromCart(product._id);
                          toast.success(`${product.title} removed from cart`);
                        }}
                        className="text-slate-300 hover:text-rose-500 p-1.5 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>

                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart action buttons */}
          <div className="flex justify-between items-center px-4">
            <Link to="/shop" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1">
              <span>← Continue Shopping</span>
            </Link>
            <button
              onClick={() => {
                clearCart();
                toast.success('Shopping cart cleared');
              }}
              className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center space-x-1"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              <span>Clear Shopping Cart</span>
            </button>
          </div>

        </div>

        {/* Right Side: Order Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
            <h3 className="font-extrabold text-slate-950 text-base">Order Summary</h3>

            {/* Calculations */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal ({cartTotals.itemsCount} items)</span>
                <span className="font-semibold text-slate-900">${cartTotals.subtotal.toFixed(2)}</span>
              </div>
              
              {/* Promo details */}
              {coupon && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span className="flex items-center">
                    Discount ({coupon.code})
                    <button onClick={removeCoupon} className="text-rose-500 hover:text-rose-700 p-0.5 ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                  <span>-${cartTotals.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-slate-900">
                  {cartTotals.shipping === 0 ? 'FREE' : `$${cartTotals.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Sales Tax (8%)</span>
                <span className="font-semibold text-slate-900">${cartTotals.tax.toFixed(2)}</span>
              </div>
              
              <hr className="border-slate-100" />
              
              <div className="flex justify-between text-sm font-extrabold text-slate-950">
                <span>Grand Total</span>
                <span className="text-base font-black">${cartTotals.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon input */}
            {!coupon ? (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Apply promo code"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 text-xs pl-8 pr-3 py-2 rounded-xl focus:outline-hidden focus:border-indigo-500"
                  />
                  <Tag className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
                <button
                  type="submit"
                  disabled={submittingCoupon}
                  className="bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors disabled:bg-slate-400"
                >
                  Apply
                </button>
              </form>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs flex justify-between items-center font-medium">
                <span>Coupon Applied: {coupon.code}</span>
                <button onClick={removeCoupon} className="text-rose-600 font-bold hover:text-rose-800">
                  Remove
                </button>
              </div>
            )}

            {/* Checkout Button */}
            {isAuthenticated ? (
              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-md shadow-indigo-900/10 cursor-pointer"
              >
                <span>Secure Checkout</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            ) : (
              <div className="space-y-2 pt-2">
                <div className="bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-semibold p-3 rounded-xl text-center">
                  🔒 Please log in or sign up to complete your checkout
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Link
                    to="/login"
                    className="w-full text-center py-2.5 font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl block transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="w-full text-center py-2.5 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl block transition-colors shadow-xs"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}

          </div>

          <div className="text-[10px] text-center text-slate-400 font-medium">
            🔒 Checkout powered by SSL encryption. Free returns within 30 days.
          </div>
        </div>

      </div>

    </div>
  );
};

export default Cart;
