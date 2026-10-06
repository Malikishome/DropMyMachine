import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FloatingInput from '../FloatingInput'

const REDIRECT_SECONDS = 3;

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS)
  const navigate = useNavigate()

  const handleEmailChange = (e) => { setEmail(e.target.value) }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  useEffect(() => {
    if (!sent) return

    if (secondsLeft <= 0) {
      navigate('/login')
      return
    }

    const timeout = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timeout)
  }, [sent, secondsLeft, navigate])

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-2 bg-gray-900">
        <p className="text-2xl text-green-500">Reset link sent! Check your inbox.</p>
        <p className="text-sm text-gray-400">Redirecting to login in {secondsLeft}s...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-2xl text-red-500">An error occurred. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <FloatingInput
              label="Enter your Email Address"
              name="email"
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              dark
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

export default ForgotPassword;
