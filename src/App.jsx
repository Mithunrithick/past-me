import { useState, useEffect } from 'react';
import { auth } from './firebase'; // Import our auth service
import { onAuthStateChanged } from "firebase/auth";

// Import all our components
import Login from './Login.jsx';
import Navbar from './Navbar.jsx'; // <-- Import the new Navbar
import Journal from './Journal.jsx'; 
import Dashboard from './Dashboard.jsx';

function App() {
  const [user, setUser] = useState(null); // Tracks if the user is logged in
  const [loading, setLoading] = useState(true); // Tracks if auth is still loading
  const [view, setView] = useState('journal'); // <-- New state to track the active tab

  useEffect(() => {
    // This is a Firebase listener that runs when the app loads
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Show a loading message while Firebase is checking auth
  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  // If 'user' is null, show the Login component.
  if (!user) {
    return <Login />;
  }

  // If we have a user, show the full application!
  return (
    <div className="w-full min-h-screen bg-gray-900 text-white">
      {/* Render the Navbar at the top. Pass it the tools to manage the view. */}
      <Navbar user={user} view={view} setView={setView} />

      {/* Render the active component based on the 'view' state */}
      <main className="max-w-7xl mx-auto p-8">
        {view === 'journal' && (
          <Journal user={user} />
        )}
        {view === 'dashboard' && (
          <Dashboard user={user} />
        )}
      </main>
    </div>
  );
}

export default App;