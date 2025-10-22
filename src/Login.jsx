import { useState } from 'react';
import { auth } from './firebase'; // Import our auth service
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from "firebase/auth";

// This is the Google provider object
const googleProvider = new GoogleAuthProvider();

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  // Function to handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // User is signed in! The onAuthStateChanged in App.jsx will handle it.
    } catch (err) {
      setError(err.message);
    }
  };

  // Function to handle Email/Password Sign-In
  const handleEmailSignIn = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      // If sign-in fails, try to create an account
      if (err.code === 'auth/user-not-found') {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (createErr) {
          setError(createErr.message);
        }
      } else {
        setError(err.message);
      }
    }
  };

  return (
    // We use Tailwind classes for a professional look
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">PastMe</h1>
        <p className="text-center text-gray-400 mb-8">Sign in or create an account</p>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition duration-300"
        >
          Sign in with Google
        </button>

        <div className="my-6 flex items-center justify-center">
          <span className="border-b border-gray-600 w-1/4"></span>
          <span className="px-4 text-gray-500">OR</span>
          <span className="border-b border-gray-600 w-1/4"></span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSignIn}>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
              minLength={6} // Firebase requires 6+ characters
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
          >
            Sign In / Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;