// src/pages/Register.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // ✅ for error messages
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError(''); // reset error
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { username, password });
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-green-100 to-blue-200">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 flex flex-col items-center">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-green-700">Kotha - Register</h1>

        {error && (
          <div className="bg-red-100 text-red-700 border border-red-400 w-full p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="border border-gray-300 p-3 w-full mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border border-gray-300 p-3 w-full mb-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
        />

        <button
          onClick={handleRegister}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold w-full py-3 rounded-xl shadow-md transition transform hover:-translate-y-0.5"
        >
          Register
        </button>

        <p className="mt-6 text-gray-600 text-sm text-center">
          Already have an account?{' '}
          <a href="/" className="font-bold text-green-600 hover:text-green-800 transition">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
