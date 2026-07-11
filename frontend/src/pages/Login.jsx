import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, loading } = useAuth();

  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Read redirect path
  const redirect = searchParams.get('redirect') || '/';

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, navigate, redirect]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please enter email and password');
    }

    try {
      setSubmitting(true);
      await login(email, password);
      toast.success('Logged in successfully!');
      navigate(redirect, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl shadow-xs dark:shadow-md space-y-6 fade-in-up transition-colors duration-300">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50">Welcome Back</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Sign in to your AuraStore customer or admin account</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
        
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
          <div className="flex justify-between items-center">
            <label className="font-bold text-slate-600 dark:text-slate-300">Password</label>
            <Link to="/forgot-password" className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <LogIn className="h-4.5 w-4.5" />
          <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
        </button>

      </form>

      {/* Footer Info */}
      <div className="text-center pt-2">
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
            Sign Up Now
          </Link>
        </p>
      </div>

    </div>
  );
};

export default Login;
