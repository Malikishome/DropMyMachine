import React, {    useState    } from 'react';
import {    Link    } from 'react-router-dom';

function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);


    const handleSubmit = (e) => {
        e.preventDefault();
        setEmail('');
        setPassword('');
        setLoading(true);

        setTimeout(() => {
            setSuccess(true);
            setLoading(false);
            setError(false);
            useNavigate = '/dashboard';
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
        <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold">Login Page</h1>
        <section>
            <h2 className="text-3xl font-semibold">Sign In</h2>
            <form>
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" required />
                <br />
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" required />
                <br />
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <Link to="/register">Sign Up</ Link></p>
            <button onClick={handleForgotPasswordRedirect}>Forgot Password</button>
            <button onClick={handleGoogleLogin}>Login with Google</button>
        </section>
    </div>
    )
    }