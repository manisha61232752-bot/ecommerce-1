import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Initial Load: Load wishlist items
  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      if (isAuthenticated) {
        try {
          const { data } = await api.get('/api/wishlist');
          setWishlistItems(data);
        } catch (err) {
          console.error('Failed to load wishlist from server:', err);
        }
      } else {
        const localWish = localStorage.getItem('wishlistItems');
        if (localWish) {
          setWishlistItems(JSON.parse(localWish));
        }
      }
      setLoading(false);
    };
    loadWishlist();
  }, [isAuthenticated, user]);

  // 2. Toggle item in wishlist (Add or Remove)
  const toggleWishlist = async (product) => {
    if (!product) return;
    const productId = product._id;

    if (isAuthenticated) {
      try {
        const { data } = await api.post('/api/wishlist/toggle', { productId });
        const isAdded = data.isWishlisted;

        if (isAdded) {
          setWishlistItems(prev => [...prev, product]);
          toast.success('Added to wishlist');
        } else {
          setWishlistItems(prev => prev.filter(item => item._id !== productId));
          toast.success('Removed from wishlist');
        }
      } catch (err) {
        toast.error('Failed to update wishlist');
      }
    } else {
      // LocalStorage toggle for guest users
      const exist = wishlistItems.find(item => item._id === productId);
      let updatedWishlist = [];

      if (exist) {
        updatedWishlist = wishlistItems.filter(item => item._id !== productId);
        toast.success('Removed from wishlist');
      } else {
        updatedWishlist = [...wishlistItems, product];
        toast.success('Added to wishlist');
      }

      setWishlistItems(updatedWishlist);
      localStorage.setItem('wishlistItems', JSON.stringify(updatedWishlist));
    }
  };

  // Helper check
  const isWishlisted = (productId) => {
    return wishlistItems.some(item => item._id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        toggleWishlist,
        isWishlisted
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
