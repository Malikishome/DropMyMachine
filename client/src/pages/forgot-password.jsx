import React, { useState } from 'react';

function forgotPassword() {
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(false);
    const [email, setEmail] = useState('');

    if (sent) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-2xl text-green-500">Reset link sent to your email! Please check your inbox.</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-2xl text-red-500">An error occurred. Please try again. </p>
            </div>
        );
    }
    
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
        // Handle forgot password logic here (e.g., API call to send reset link)
        alert('Reset link sent to your email!');
    };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        <form>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter your email"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}

export default forgotPassword;