import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { ShoppingCart, Heart, User, Search, Menu, X, LogOut, ShieldAlert, Sun, Moon, Bell } from 'lucide-react';
import api from '../utils/api';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { cartTotals } = useCart();
  const { wishlistItems } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const { data } = await api.get(`/api/products/suggestions?keyword=${encodeURIComponent(searchQuery.trim())}`);
          setSuggestions(data);
          setShowSuggestions(true);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              AuraStore
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-sm pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-full focus:outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-750 transition-all text-slate-900 dark:text-slate-100"
              />
              <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg z-55 py-1.5 max-h-60 overflow-y-auto">
                {suggestions.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                      navigate(`/product/${item._id}`);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate block"
                  >
                    🔍 {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Links & Menu (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/shop" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Shop
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-amber-400" />}
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <Heart className="h-6 w-6" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold text-[10px] w-4.5 h-4.5 flex items-center justify-center rounded-full">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {cartTotals.itemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white font-bold text-[10px] w-4.5 h-4.5 flex items-center justify-center rounded-full">
                  {cartTotals.itemsCount}
                </span>
              )}
            </Link>

            {/* Notifications Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer flex items-center justify-center"
                  title="Notifications"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl py-2 z-55 max-h-96 overflow-y-auto fade-in-up">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => {
                            markAllAsRead();
                            setNotifDropdownOpen(false);
                          }}
                          className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-slate-50 dark:divide-slate-750">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-slate-400">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n._id}
                            onClick={() => {
                              markAsRead(n._id);
                              setNotifDropdownOpen(false);
                            }}
                            className={`px-4 py-2.5 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 ${!n.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/10' : ''}`}
                          >
                             <div className="flex justify-between items-start">
                               <span className={`text-xs font-bold ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                 {n.title}
                               </span>
                               <span className="text-[9px] text-slate-400">
                                 {new Date(n.createdAt).toLocaleDateString()}
                               </span>
                             </div>
                             <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                               {n.message}
                             </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Admin Tag */}
            {isAdmin && (
              <Link to="/admin" className="flex items-center text-xs font-semibold px-2.5 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 rounded-full hover:bg-amber-100 transition-colors">
                <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                Admin Panel
              </Link>
            )}

            {/* Login and Signup buttons (ALWAYS visible on navbar near Shopping Cart) */}
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full transition-all shadow-xs cursor-pointer"
              >
                Sign Up
              </Link>
            </div>

            {/* User Dropdown */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-hidden"
                >
                  <User className="h-5 w-5 mr-1 text-indigo-500" />
                  <span>{user.name.split(' ')[0]}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg shadow-lg py-1 fade-in-up">
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Order History
                    </Link>
                    <hr className="my-1 border-slate-100 dark:border-slate-700" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hamburger Menu (Mobile) */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Dark Mode Toggle (Mobile) */}
            <button
              onClick={toggleTheme}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-amber-400" />}
            </button>

            <Link to="/cart" className="relative p-1.5 text-slate-600 dark:text-slate-300">
              <ShoppingCart className="h-6 w-6" />
              {cartTotals.itemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white font-bold text-[10px] w-4.5 h-4.5 flex items-center justify-center rounded-full">
                  {cartTotals.itemsCount}
                </span>
              )}
            </Link>

            {/* Notifications Bell (Mobile) */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  title="Notifications"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Mobile Dropdown Panel */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl py-2 z-55 max-h-96 overflow-y-auto fade-in-up">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => {
                            markAllAsRead();
                            setNotifDropdownOpen(false);
                          }}
                          className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-slate-50 dark:divide-slate-750">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-slate-400">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n._id}
                            onClick={() => {
                              markAsRead(n._id);
                              setNotifDropdownOpen(false);
                            }}
                            className={`px-4 py-2.5 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 ${!n.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/10' : ''}`}
                          >
                             <div className="flex justify-between items-start">
                               <span className={`text-xs font-bold ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                 {n.title}
                               </span>
                               <span className="text-[9px] text-slate-400">
                                 {new Date(n.createdAt).toLocaleDateString()}
                               </span>
                             </div>
                             <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                               {n.message}
                             </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 focus:outline-hidden"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3 transition-colors duration-300">
          <div className="relative w-full">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm pl-10 pr-4 py-2 rounded-full text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
              <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg z-55 py-1.5 max-h-48 overflow-y-auto">
                {suggestions.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                      setMobileMenuOpen(false);
                      navigate(`/product/${item._id}`);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate block"
                  >
                    🔍 {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Shop
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center"
            >
              Wishlist ({wishlistItems.length})
            </Link>
            
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-amber-700 dark:text-amber-400 hover:text-amber-800"
              >
                Admin Panel Dashboard
              </Link>
            )}

            <hr className="border-slate-100 dark:border-slate-800 my-2" />

            {isAuthenticated && (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  My Profile
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Order History
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 text-base font-medium text-rose-600 flex items-center cursor-pointer"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Log Out
                </button>
              </>
            )}

            {/* Mobile Login and Signup (ALWAYS visible on navbar) */}
            <div className="flex flex-col space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-medium border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
