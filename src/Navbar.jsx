import { auth } from './firebase'; // Import our auth service
import { signOut } from 'firebase/auth';

// This component will get props to manage the view
// 'user' = who is logged in
// 'view' = which tab is active ('journal' or 'dashboard')
// 'setView' = a function to change the active tab
function Navbar({ user, view, setView }) {

  // Helper function to style the active tab
  const getTabClass = (tabName) => {
    return view === tabName
      ? "bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium"
      : "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium";
  };

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          
          {/* Left Side: Title and Tabs */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white mr-6">PastMe</h1>
            {/* --- THIS DIV IS NOW HIDDEN ON MOBILE --- */}
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                <button
                  onClick={() => setView('journal')}
                  className={getTabClass('journal')}
                >
                  Journal
                </button>
                <button
                  onClick={() => setView('dashboard')}
                  className={getTabClass('dashboard')}
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Account & Sign Out */}
          <div className="flex items-center">
            {/* --- THIS SPAN IS NOW HIDDEN ON MOBILE --- */}
            <span className="text-gray-400 text-sm mr-4 hidden md:block">
              {user.email}
            </span>
            <button
              onClick={() => signOut(auth)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
            >
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;