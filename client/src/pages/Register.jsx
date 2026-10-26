import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FloatingInput from '../FloatingInput';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const REDIRECT_SECONDS = 3;

const ROLES = [
    { value: 'operator', label: 'Operator' },
    { value: 'location_owner', label: 'Location Owner' },
];

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmSent, setConfirmSent] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim() || !fullName.trim()) {
            setError('Please fill out all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (!role) {
            setError('Please select a role');
            return;
        }

        setError(false);
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role, full_name: fullName }),
            });
            const data = await res.json();

            if (!res.ok) {
                setLoading(false);
                setError(data.message || 'Registration failed. Please try again.');
                return;
            }

            setLoading(false);
            setConfirmSent(true);
        } catch (err) {
            console.error(err);
            setLoading(false);
            setError('Unable to reach the server. Please try again.');
        }
    };

    useEffect(() => {
        if (!confirmSent) return;

        if (secondsLeft <= 0) {
            navigate('/login');
            return;
        }

        const timeout = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearTimeout(timeout);
    }, [confirmSent, secondsLeft, navigate]);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };
    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    }
    const handleFullNameChange = (e) => {
        setFullName(e.target.value);
    };
    const buttonClass = "bg-blue-500 text-white rounded px-4 py-2 w-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500";

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-gray-900"><p className="text-2xl text-white">Loading...</p></div>;
    }
    if (confirmSent) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-2 bg-gray-900">
                <p className="text-2xl text-green-500 text-center">Check your email to confirm your account.</p>
                <p className="text-sm text-gray-400">Redirecting to login in {secondsLeft}s...</p>
            </div>
        );
    }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Register</h2>
        {error && (
          <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <FloatingInput
              label="Full Name"
              name="fullName"
              type="text"
              value={fullName}
              onChange={handleFullNameChange}
              placeholder="Enter your full name"
              required
              dark
            />
          </div>
          <div className="mb-4">
            <FloatingInput
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              required
              dark
            />
          </div>
          <div className="mb-4">
            <FloatingInput
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter your password"
              required
              dark
            />
          </div>
          <div className="mb-4">
            <FloatingInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Confirm your password"
              required
              dark
            />
          </div>
          <div className="mb-4">
            <span className="block text-md text-gray-400 mb-2">I am a...</span>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`rounded-md border px-3 py-2 text-sm transition-colors duration-200 ${
                    role === r.value
                      ? 'border-blue-500 bg-blue-500 text-white font-medium'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-blue-500'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
            <button
                type="submit"
                className={buttonClass}
            >
                Register
            </button>
        </form>
        <p className="mt-4 text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
