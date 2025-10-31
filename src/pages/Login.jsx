import { useState } from 'react';
import { supabase } from '../lib/supabase-client';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('password')
        .eq('email', email)
        .single();

      if (fetchError || !data) {
        setError('Invalid email or password.');
        return;
      }

      // In a real application, you would use a secure password hashing library like bcrypt to compare the password.
      // For this example, we will assume a plain text password for simplicity.
      // IMPORTANT: This is not secure and should not be used in production.
      if (password === data.password) {
        // On successful login, you might want to set a session token or a cookie
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/Users');
      } else {
        setError('Invalid email or password.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#015f40]">
      <div className="text-center">
        <img
          src="https://res.cloudinary.com/dcisrjaxp/image/upload/v1750264608/EXLITY_ICONabc_1_opbmxo.png"
          alt="Logo"
          className="h-30 w-80"
        />
        <div className="bg-white rounded-2xl shadow-lg p-8 w-80 mx-auto">
          <h2 className="text-gray-800 text-lg font-semibold mb-6">
            Sign In to your account
          </h2>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-[#f1812a] text-white py-2 rounded-full transition-colors"
          >
            Login
          </button>
          <p className="text-sm text-gray-500 mt-4 cursor-pointer hover:underline">
            Forgot Password
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
