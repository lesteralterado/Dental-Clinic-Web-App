'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full opacity-30"
          animate={{
            scale: [1, 1.1, 1],
            y: [0, 20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
          {/* Back to Login */}
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Login</span>
          </button>

          {!isSubmitted ? (
            <>
              {/* Logo and Title */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                  <img 
                    src="/2.png" 
                    alt="Dr. Debra Dental Clinic Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Forgot Password?
                </h1>
                <p className="text-slate-500 mt-2 text-sm">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                >
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </motion.button>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-green-100 rounded-full">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">
                  Check Your Email
                </h1>
                <p className="text-slate-500 mb-6">
                  We've sent a password reset link to <span className="font-medium text-slate-700">{email}</span>
                </p>
                <p className="text-sm text-slate-400 mb-6">
                  The link will expire in 1 hour. If you don't see the email, check your spam folder.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Try a different email
                </button>
              </motion.div>
            </>
          )}
        </div>

        {/* Back to Home */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6"
        >
          <a
            href="/"
            className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
          >
            ← Back to Home
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}