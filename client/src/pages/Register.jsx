import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

//Look over the logic of this code again
function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();


    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
        } else {
            setError(false);
        }

        setTimeout(() => {
            setSuccess('Registration successful!');
            setLoading(false);
            setError(false);
            navigate('/login');
        }, 1000);
    }
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };
    
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };
    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    }
    const inputClass = "border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500";
    const buttonClass = "bg-blue-500 text-white rounded px-4 py-2 w-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500";

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><p className="text-2xl">Loading...</p></div>;
    }
    if (success) {
        return <div className="flex items-center justify-center h-screen"><p className="text-2xl text-green-500">{success}</p></div>;
    }
    if (error) {
        return <div className="flex items-center justify-center h-screen"><p className="text-2xl text-red-500">{error}</p></div>;
    }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              className={inputClass}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className={inputClass}
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={inputClass}
              placeholder="Confirm your password"
              required
            />
          </div>
            <button
                type="submit"
                className={buttonClass}
            >
                Register
            </button>
        </form>
        <p className="mt-4 text-center">
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