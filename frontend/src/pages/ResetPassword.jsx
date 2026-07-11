import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Lock, Check } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      return toast.error('Please enter all fields');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      setSubmitting(true);
      await resetPassword(token, password);
      toast.success('Password updated successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white border border-slate-100 p-8 rounded-3xl shadow-xs space-y-6 fade-in-up">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Reset Password</h1>
        <p className="text-xs text-slate-500">Choose a new security password for your account</p>
      </div>

      <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
        
        {/* New Password */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-600 block">New Password</label>
          <div className="relative">
            <input
              type="password"
              placeholder="Minimum 6 characters"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-3 rounded-xl focus:outline-hidden focus:border-indigo-500"
            />
            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-600 block">Confirm New Password</label>
          <div className="relative">
            <input
              type="password"
              placeholder="••••••••"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-3 rounded-xl focus:outline-hidden focus:border-indigo-500"
            />
            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-colors mt-2"
        >
          <Check className="h-4.5 w-4.5" />
          <span>{submitting ? 'Updating...' : 'Update Password'}</span>
        </button>

      </form>

      {/* Return link */}
      <div className="text-center pt-2">
        <Link to="/login" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800">
          Back to Login
        </Link>
      </div>

    </div>
  );
};

export default ResetPassword;
