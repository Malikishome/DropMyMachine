import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FloatingInput from '../FloatingInput';

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
    const buttonClass = "bg-blue-500 text-white rounded px-4 py-2 w-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500";

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-gray-900"><p className="text-2xl text-white">Loading...</p></div>;
    }
    if (success) {
        return <div className="flex items-center justify-center h-screen bg-gray-900"><p className="text-2xl text-green-500">{success}</p></div>;
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