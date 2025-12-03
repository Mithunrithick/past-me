import React from 'react';

const MoodExplorer = ({ onClose }) => {
  return (
    <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-40 animate-fade-in-up">
        <div className="bg-blue-950/90 backdrop-blur-2xl border border-blue-500/50 rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-blue-500/30 pb-2">
                <h2 className="text-lg font-bold text-blue-200">🧭 Mood Explorer</h2>
                <button onClick={onClose} className="text-blue-400 hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <a href="https://open.spotify.com/genre/0JQ5DAqbMKFzHmL4tf05da" target="_blank" rel="noopener noreferrer" className="block p-4 bg-black/40 rounded-xl border border-white/10 hover:bg-green-900/30 hover:border-green-500/50 transition-all group">
                    <h3 className="text-green-300 font-bold mb-1 group-hover:text-white">Mood Playlists</h3>
                    <p className="text-gray-400 text-xs">Spotify music matched to your vibe.</p>
                </a>
                <a href="https://www.youtube.com/results?search_query=meditation+for+mental+health" target="_blank" rel="noopener noreferrer" className="block p-4 bg-black/40 rounded-xl border border-white/10 hover:bg-red-900/30 hover:border-red-500/50 transition-all group">
                    <h3 className="text-red-300 font-bold mb-1 group-hover:text-white">Mindfulness Videos</h3>
                    <p className="text-gray-400 text-xs">YouTube guides for relaxation.</p>
                </a>
                <a href="https://www.ted.com/talks?topics%5B%5D=personal+growth" target="_blank" rel="noopener noreferrer" className="block p-4 bg-black/40 rounded-xl border border-white/10 hover:bg-red-900/30 hover:border-red-500/50 transition-all group">
                    <h3 className="text-red-300 font-bold mb-1 group-hover:text-white">TED Talks</h3>
                    <p className="text-gray-400 text-xs">Inspiring talks on personal growth.</p>
                </a>
                <a href="https://www.reddit.com/r/Journaling/" target="_blank" rel="noopener noreferrer" className="block p-4 bg-black/40 rounded-xl border border-white/10 hover:bg-orange-900/30 hover:border-orange-500/50 transition-all group">
                    <h3 className="text-orange-300 font-bold mb-1 group-hover:text-white">Community</h3>
                    <p className="text-gray-400 text-xs">See how others are journaling.</p>
                </a>
            </div>
        </div>
    </div>
  );
};

export default MoodExplorer;