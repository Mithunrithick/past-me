import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './Login.jsx';
import MemoryGalaxy from './components/galaxy/MemoryGalaxy.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 1. Loading screen while Firebase checks credentials
  if (authLoading) {
     return <div className="w-full h-screen bg-black flex items-center justify-center text-blue-500 animate-pulse">Initializing Link...</div>;
  }

  // 2. If no user, show Login
  if (!user) {
    return <Login />;
  }

  // 3. If user exists, show the Galaxy
  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      <MemoryGalaxy user={user} />
    </div>
  );
}

export default App;