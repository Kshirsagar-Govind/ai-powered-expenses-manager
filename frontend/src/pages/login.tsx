import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../config/axios';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/user/login', {
        email: formData.email.trim(),
        password: formData.password,
      });
      if (response.data.token) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);

        // Optionally store user data
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        // Dispatch custom event to notify App component of auth state change
        window.dispatchEvent(new Event('authStateChange'));

        // Redirect to expenses page
        navigate('/expenses');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.msg || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#151421] flex items-start sm:items-center justify-center px-3 py-6 sm:px-4 sm:py-8">
      <div className="relative w-full max-w-md bg-white dark:bg-[#201e30] rounded-2xl shadow-lg p-5 sm:p-8">
        <div className="mb-4 flex justify-end"><ThemeToggle /></div>
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800 dark:text-white">
          Login
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
