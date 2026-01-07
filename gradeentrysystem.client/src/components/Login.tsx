import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';


/**
 * Login/Register screen.

 */
export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await authService.register({ username, email, password });
      } else {
        await authService.login({ username, password });
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err && 
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : (isRegister ? 'Registration failed. Please try again.' : 'Login failed. Please try again.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-10 shadow-lg border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-slate-800 mb-2">
            Grade Entry System
          </h1>
          <h2 className="text-lg text-slate-500 font-normal">{isRegister ? 'Create your account' : 'Welcome back'}</h2>
        </div>
        
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Enter your username"
            />
          </div>
          
          {isRegister && (
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Enter your email"
              />
            </div>
          )}
          
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Enter your password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (isRegister ? 'Creating account...' : 'Signing in...') : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          {isRegister ? (
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <button
                type="button"
                className="font-medium text-slate-700 hover:text-slate-900 transition"
                onClick={() => setIsRegister(false)}
              >
                Sign in
              </button>
            </p>
          ) : (
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <button
                type="button"
                className="font-medium text-slate-700 hover:text-slate-900 transition"
                onClick={() => setIsRegister(true)}
              >
                Create one
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
