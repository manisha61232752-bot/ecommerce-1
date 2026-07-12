import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Initial Load: load from localStorage if guest, otherwise from API
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (isAuthenticated) {
        try {
          const { data } = await api.get('/api/cart');
          setCartItems(data);
        } catch (err) {
          console.error('Failed to load cart from server:', err);
        }
      } else {
        const localCart = localStorage.getItem('cartItems');
        if (localCart) {
          setCartItems(JSON.parse(localCart));
        }
      }
      setLoading(false);
    };
    loadCart();
  }, [isAuthenticated, user]);

  // 2. Sync cart to LocalStorage for guests, and to DB for logged-in users when items change
  const syncCartWithServer = async (items) => {
    if (isAuthenticated) {
      try {
        const bodyItems = items.map(item => ({
          product: item.product._id || item.product,
          quantity: item.quantity
        }));
        await api.post('/api/cart/sync', { cartItems: bodyItems });
      } catch (err) {
        console.error('Failed to sync cart with server:', err);
      }
    } else {
      localStorage.setItem('cartItems', JSON.stringify(items));
    }
  };

  // Add Item to Cart
  const addToCart = (product, quantity = 1) => {
    let updatedItems = [];
    const existItem = cartItems.find(item => item.product._id === product._id);

    if (existItem) {
      updatedItems = cartItems.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
          : item
      );
    } else {
      updatedItems = [...cartItems, { product, quantity }];
    }

    setCartItems(updatedItems);
    syncCartWithServer(updatedItems);
  };

  // Remove Item from Cart
  const removeFromCart = (productId) => {
    const updatedItems = cartItems.filter(item => item.product._id !== productId);
    setCartItems(updatedItems);
    syncCartWithServer(updatedItems);
  };

  // Update Cart Quantity
  const updateCartQty = (productId, qty) => {
    const updatedItems = cartItems.map(item =>
      item.product._id === productId
        ? { ...item, quantity: Math.max(1, Math.min(item.product.stock, qty)) }
        : item
    );
    setCartItems(updatedItems);
    syncCartWithServer(updatedItems);
  };

  // Clear Cart
  const clearCart = async () => {
    setCartItems([]);
    setCoupon(null);
    if (isAuthenticated) {
      try {
        await api.delete('/api/cart');
      } catch (err) {
        console.error('Failed to clear cart on server:', err);
      }
    } else {
      localStorage.removeItem('cartItems');
    }
  };

  // Apply Discount Coupon
  const applyCouponCode = async (code) => {
    try {
      const { data } = await api.post('/api/coupons/validate', { code });
      setCoupon(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid coupon';
      throw new Error(msg);
    }
  };

  // Remove Discount Coupon
  const removeCoupon = () => {
    setCoupon(null);
  };

  // Compute Cart Totals dynamically
  const getCartTotals = () => {
    const items = Array.isArray(cartItems) ? cartItems : [];

    const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

    const subtotal = items.reduce(
   (acc, item) => acc + ((item.product?.price || 0) * item.quantity),
   0
  );
    
    // Free shipping above $150, else flat $15 shipping fee
    const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15.00;
    
    // 8% tax calculation
    const tax = Math.round((subtotal * 0.08) * 100) / 100;
    
    // Coupon Discount calculation
    let discount = 0;
    if (coupon && coupon.discountPercentage) {
      discount = Math.round((subtotal * (coupon.discountPercentage / 100)) * 100) / 100;
    }

    const total = Math.round((subtotal + shipping + tax - discount) * 100) / 100;

    return {
      itemsCount,
      subtotal: Math.round(subtotal * 100) / 100,
      shipping,
      tax,
      discount,
      total: Math.max(0, total)
    };
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        coupon,
        loading,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        applyCouponCode,
        removeCoupon,
        cartTotals: getCartTotals()
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
