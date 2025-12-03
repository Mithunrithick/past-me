import { useState } from 'react';
import { auth } from './firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from "firebase/auth";

const googleProvider = new GoogleAuthProvider();

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault(); 
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
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
    <div className="w-full h-screen flex items-center justify-center relative z-50">
      {/* --- GLASS CARD CONTAINER --- */}
      <div className="w-full max-w-md p-8 bg-gray-900/60 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-900/20">
        
        <h1 className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tighter">
          PastMe
        </h1>
        <p className="text-center text-blue-200/60 mb-8 text-sm tracking-widest uppercase">
          Initialize Neural Link
        </p>
        
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.02]"
        >
          Connect with Google
        </button>

        <div className="my-6 flex items-center justify-center">
          <span className="border-b border-blue-500/20 w-1/4"></span>
          <span className="px-4 text-blue-300/50 text-xs uppercase">or manual entry</span>
          <span className="border-b border-blue-500/20 w-1/4"></span>
        </div>

        <form onSubmit={handleEmailSignIn}>
          <div className="mb-4">
            <label className="block text-blue-300 text-xs font-bold mb-2 uppercase tracking-wider">
              Identity
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@pastme.ai"
              className="w-full px-4 py-3 bg-gray-800/50 border border-blue-500/30 rounded-lg text-blue-100 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 placeholder-blue-500/30 transition-all"
              required
            />
          </div>
          <div className="mb-8">
            <label className="block text-blue-300 text-xs font-bold mb-2 uppercase tracking-wider">
              Passcode
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-800/50 border border-blue-500/30 rounded-lg text-blue-100 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 placeholder-blue-500/30 transition-all"
              required
              minLength={6} 
            />
          </div>

          {error && (
            <div className="p-3 mb-4 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-xs">
              Error: {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-transparent border border-blue-500 text-blue-400 hover:bg-blue-500/10 font-bold py-3 px-4 rounded-lg transition-all"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;