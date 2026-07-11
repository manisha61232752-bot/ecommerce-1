import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup, isAuthenticated } = useAuth();

  // Inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirect = searchParams.get('redirect') || '/';

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, navigate, redirect]);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      return toast.error('Please fill in all registration fields');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      setSubmitting(true);
      await signup(name, email, password);
      toast.success('Account created successfully!');
      navigate(redirect, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Registration failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl shadow-xs dark:shadow-md space-y-6 fade-in-up transition-colors duration-300">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50">Create Account</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Sign up today for premium perks, trackable checkout & sales alerts</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSignupSubmit} className="space-y-4 text-xs">
        
        {/* Name */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-600 dark:text-slate-300 block">Full Name</label>
          <div className="relative">
            <input
              type="text"
              placeholder="John Doe"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 pl-9 pr-3 py-3 rounded-xl focus:outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-750"
            />
            <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-600 dark:text-slate-300 block">Email Address</label>
          <div className="relative">
            <input
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 pl-9 pr-3 py-3 rounded-xl focus:outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-750"
            />
            <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-600 dark:text-slate-300 block">Password</label>
          <div className="relative">
            <input
              type="password"
              placeholder="Minimum 6 characters"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 pl-9 pr-3 py-3 rounded-xl focus:outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-750"
            />
            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-600 dark:text-slate-300 block">Confirm Password</label>
          <div className="relative">
            <input
              type="password"
              placeholder="••••••••"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 pl-9 pr-3 py-3 rounded-xl focus:outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-750"
            />
            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-colors mt-2 cursor-pointer"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>{submitting ? 'Creating Account...' : 'Sign Up'}</span>
        </button>

      </form>

      {/* Footer Info */}
      <div className="text-center pt-2">
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
            Log In Instead
          </Link>
        </p>
      </div>

    </div>
  );
};

export default Signup;
