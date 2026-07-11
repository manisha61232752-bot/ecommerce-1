import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Mail, HelpCircle, ArrowRight } from 'lucide-react';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [retrievedToken, setRetrievedToken] = useState('');

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setSubmitting(true);
      const data = await forgotPassword(email);
      setRetrievedToken(data.resetToken || '');
      setSuccess(true);
      toast.success('Reset link printed to server logs!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit reset request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white border border-slate-100 p-8 rounded-3xl shadow-xs space-y-6 fade-in-up">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Forgot Password</h1>
        <p className="text-xs text-slate-500">Recover your account credentials securely</p>
      </div>

      {!success ? (
        <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
          <p className="text-slate-500 leading-normal mb-2 text-[11px]">
            Enter the email address registered to your account. We will simulate sending a password reset link by printing it directly to your Node.js console logs.
          </p>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-600 block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-3 rounded-xl focus:outline-hidden focus:border-indigo-500"
              />
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-colors mt-2"
          >
            <HelpCircle className="h-4.5 w-4.5" />
            <span>{submitting ? 'Generating link...' : 'Reset Password'}</span>
          </button>
        </form>
      ) : (
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl leading-relaxed">
            <span className="font-bold block mb-1">Link Sent to Server Logs!</span>
            We have generated a recovery token and printed the reset link to the backend server logs console for security.
          </div>

          {retrievedToken && (
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <span className="font-bold text-indigo-900 block mb-1.5">Local Development Bypass:</span>
              <p className="text-slate-600 leading-relaxed mb-3">
                Since we are in local development, you can click the button below to directly navigate to the password reset form with your token:
              </p>
              <Link
                to={`/reset-password/${retrievedToken}`}
                className="inline-flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg"
              >
                <span>Go Reset Password</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Return link */}
      <div className="text-center pt-2">
        <Link to="/login" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800">
          Back to Login
        </Link>
      </div>

    </div>
  );
};

export default ForgotPassword;
