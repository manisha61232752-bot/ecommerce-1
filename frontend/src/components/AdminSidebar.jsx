import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, FolderTree, ClipboardList, Users, Shield, Bell } from 'lucide-react';

const AdminSidebar = () => {
  const links = [
    { to: '/admin', icon: LayoutDashboard, text: 'Dashboard Overview' },
    { to: '/admin/products', icon: ShoppingBag, text: 'Manage Products' },
    { to: '/admin/categories', icon: FolderTree, text: 'Manage Categories' },
    { to: '/admin/orders', icon: ClipboardList, text: 'Manage Orders' },
    { to: '/admin/users', icon: Users, text: 'Manage Users' },
    { to: '/admin/notifications', icon: Bell, text: 'Manage Notifications' }
  ];

  return (
    <div className="w-full md:w-64 bg-slate-900 text-slate-300 md:min-h-screen flex flex-col border-r border-slate-800">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-2">
        <Shield className="h-6 w-6 text-amber-500" />
        <span className="text-lg font-bold text-white tracking-wider">
          Admin Console
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {links.map((link, idx) => (
          <NavLink
            key={idx}
            to={link.to}
            end={link.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <link.icon className="h-5 w-5" />
            <span>{link.text}</span>
          </NavLink>
        ))}
      </nav>

      {/* Info tag */}
      <div className="p-4 border-t border-slate-800 text-center">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          AuraStore Security Level 1
        </p>
      </div>

    </div>
  );
};

export default AdminSidebar;
