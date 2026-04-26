function Login() {
    
    return (
        <div className="flex items-center justify-center h-screen">
        <h1 className="text-4xl font-bold">Login Page</h1>
        <section>
            <h2>Sign In</h2>
            <form>
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" required />
                <br />
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" required />
                <br />
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <a href="/register">Sign Up</a></p>

        </section>
        {/* Add your login form here :
        <LoginForm />
        */}
        </div>
    )
    }