import React, {    useState    } from 'react';
import {    Link ,    useNavigate   } from 'react-router-dom';
import FloatingInput from '../FloatingInput';
import { useAuth } from '../context/useAuth.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Email is required');
            return;
        }
        if (!password) {
            setError('Password is required');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                setLoading(false);
                setError(data.message || 'Invalid email or password');
                return;
            }

            login(data.session);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setLoading(false);
            setError('Unable to reach the server. Please try again.');
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleRegisterRedirect = () => {
        navigate('/register');
    };

    const handleForgotPasswordRedirect = () => {
        navigate('/forgot-password');
    };

    const handleGoogleLogin = () => {
        // TODO: real Google OAuth login (not part of this fix)
        navigate('/dashboard');
    };

    const buttonClass = "bg-blue-500 text-white rounded px-4 py-2 w-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500";

    

    return (
        <section className="flex items-center justify-center h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 bg-gray-800 rounded shadow">
                <h2 className="text-2xl font-bold mb-6 text-center text-white">Login to Your Account</h2>
                {error && (
                    <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <FloatingInput
                            label="Email Address"
                            name="email"
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={handleEmailChange}
                            dark
                        />
                    </div>
                    <div className="mb-4">
                        <FloatingInput
                            label="Password"
                            name="password"
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={handlePasswordChange}
                            dark
                        />
                    </div>
                    <button type="submit" className={buttonClass} disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-400">Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Register</Link></p>
                    <p className="text-sm text-gray-400 mt-2"><Link to="/forgot-password" className="text-blue-500 hover:underline">Forgot Password?</Link></p>
                    <button onClick={handleGoogleLogin} className={`${buttonClass} mt-4 bg-red-500 hover:bg-red-600`}>Login with Google</button>
                </div>
            </div>
        </section>
    );
}
export default Login;