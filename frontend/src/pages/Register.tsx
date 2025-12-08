import React, { useState } from 'react';
import { useRegisterMutation } from '../store/api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', sponsorUsername: '' });
  const [register, { isLoading, error }] = useRegisterMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData).unwrap();
      navigate('/login');
    } catch (err) {
      console.error('Failed to register', err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="p-8 bg-gray-800 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-teal-400">Register</h2>
         {error && <p className="text-red-500 text-sm mb-4">Registration failed. {(error as any).data?.message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-teal-500 focus:outline-none"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-teal-500 focus:outline-none"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-teal-500 focus:outline-none"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <input
            type="text"
            placeholder="Sponsor Username (Optional)"
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-teal-500 focus:outline-none"
            value={formData.sponsorUsername}
            onChange={(e) => setFormData({ ...formData, sponsorUsername: e.target.value })}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-2 bg-teal-600 hover:bg-teal-500 rounded font-semibold transition"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
         <p className="mt-4 text-center text-sm text-gray-400">
          Already have an account? <Link to="/login" className="text-teal-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
