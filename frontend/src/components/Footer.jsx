import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white tracking-wide">AuraStore</h3>
            <p className="text-sm">
              Premium curated lifestyle products, gadget tech accessories, and fashion clothing. Designed for modern living.
            </p>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} AuraStore Inc. All rights reserved.
            </p>
          </div>

          {/* Quick Shop */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Shop Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop?category=electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link to="/shop?category=fashion" className="hover:text-white transition-colors">Fashion Apparel</Link></li>
              <li><Link to="/shop?category=home-decor" className="hover:text-white transition-colors">Home Decor</Link></li>
              <li><Link to="/shop?category=fitness-outdoors" className="hover:text-white transition-colors">Fitness & Gym</Link></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Customer Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/orders" className="hover:text-white transition-colors">Track Orders</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">My Wishlist</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Manage Profile</Link></li>
              <li><span className="cursor-not-allowed text-slate-600">Privacy & Terms</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Get In Touch</h4>
            <p className="text-sm">
              Email: support@aurastore.com <br />
              Phone: +1 (555) 019-2834
            </p>
            <div className="flex space-x-3 pt-2">
              <span className="px-2 py-1 bg-slate-800 text-[10px] text-slate-300 font-semibold rounded-sm">VISA</span>
              <span className="px-2 py-1 bg-slate-800 text-[10px] text-slate-300 font-semibold rounded-sm">MASTERCARD</span>
              <span className="px-2 py-1 bg-slate-800 text-[10px] text-slate-300 font-semibold rounded-sm">AMEX</span>
              <span className="px-2 py-1 bg-slate-800 text-[10px] text-slate-300 font-semibold rounded-sm">COD</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
