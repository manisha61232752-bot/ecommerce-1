import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Lock, Save, ShieldAlert } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      return toast.error('Name and email fields cannot be empty');
    }

    try {
      setUpdatingProfile(true);
      await updateProfile(name.trim(), email.trim());
      toast.success('Profile details updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error('Please enter all password details');
    }
    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }

    try {
      setChangingPass(true);
      await changePassword(currentPassword, newPassword);
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">My Profile</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your contact details, permissions, and security passwords</p>
        </div>
        {user?.role === 'admin' && (
          <span className="flex items-center text-xs font-bold px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
            <ShieldAlert className="h-4 w-4 mr-1 text-amber-600" />
            Administrator Account
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Details Form */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-50 text-slate-800">
            <User className="h-4.5 w-4.5 text-indigo-500" />
            <h3 className="font-bold text-slate-900 text-sm">Account Information</h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            
            <div className="space-y-1.5">
              <label className="font-bold text-slate-600 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-600 block">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="bg-slate-900 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center space-x-1.5 transition-colors disabled:bg-slate-400"
            >
              <Save className="h-4 w-4" />
              <span>{updatingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>

          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-50 text-slate-800">
            <Lock className="h-4.5 w-4.5 text-indigo-500" />
            <h3 className="font-bold text-slate-900 text-sm">Update Password</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            
            <div className="space-y-1.5">
              <label className="font-bold text-slate-600 block">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-600 block">New Password</label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-600 block">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={changingPass}
              className="bg-slate-900 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center space-x-1.5 transition-colors disabled:bg-slate-400"
            >
              <Lock className="h-4 w-4" />
              <span>{changingPass ? 'Updating...' : 'Change Security Password'}</span>
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
