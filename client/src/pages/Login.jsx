import React, {    useState    } from 'react';
import {    Link ,    useNavigate   } from 'react-router-dom';

function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();


    const handleSubmit = (e) => {
        e.preventDefault();
        setEmail('');
        setPassword('');
        setLoading(true);

            if (!password) {
            setError('Password is required');
        }
        if (!email) {
            setError('Email is required');
        }

        setTimeout(() => {
            setSuccess(true);
            setLoading(false);
            setError(false);
            navigate('/dashboard');
        }, 1000);
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleRegisterRedirect = () => {
        // Redirect to the registration page
        useNavigate = '/register';
    };

    const handleForgotPasswordRedirect = () => {
        // Redirect to the forgot password page
        useNavigate = '/forgot-password';
    };

    const handleGoogleLogin = () => {
        // Redirect to the Google login page
        useNavigate = '/dashboard';
        // Handle Google login logic here(authentication, API calls, etc.)
    };

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
        <section className="flex items-center justify-center h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded shadow">
                <h2 className="text-2xl font-bold mb-6 text-center">Login to Your Account</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className={inputClass}
                            placeholder="Enter your email"
                            value={email}
                            onChange={handleEmailChange}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            id="password"
                            className={inputClass}
                            placeholder="Enter your password"
                            value={password}
                            onChange={handlePasswordChange}
                        />
                    </div>
                    <button type="submit" className={buttonClass}>Login</button>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Register</Link></p>
                    <p className="text-sm text-gray-600 mt-2"><Link to="/forgot-password" className="text-blue-500 hover:underline">Forgot Password?</Link></p>
                    <button onClick={handleGoogleLogin} className={`${buttonClass} mt-4 bg-red-500 hover:bg-red-600`}>Login with Google</button>
                </div>
            </div>
        </section>
    );
}
export default Login;