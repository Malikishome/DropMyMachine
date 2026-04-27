import { useState } from 'react'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)

  const handleEmailChange = (e) => { setEmail(e.target.value) }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl text-green-500">Reset link sent! Check your inbox.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl text-red-500">An error occurred. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter your email"
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword