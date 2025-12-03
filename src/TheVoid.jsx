import React, { useState } from 'react';

const TheVoid = ({ onClose }) => {
  const [text, setText] = useState('');
  const [isVenting, setIsVenting] = useState(false);

  const handleVent = () => {
    if (!text.trim()) return;
    
    setIsVenting(true); // Trigger the "Suck" animation
    
    // Wait for animation to finish, then close
    setTimeout(() => {
      onClose(); 
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black animate-fade-in overflow-hidden">
       
       {/* --- BACKGROUND STARS --- */}
       <div className="absolute inset-0 opacity-50">
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-3/4 left-1/3 w-2 h-2 bg-purple-500 rounded-full blur-sm animate-pulse"></div>
            <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
       </div>

       {/* --- THE SUPERMASSIVE BLACK HOLE --- */}
       <div className={`relative flex items-center justify-center transition-transform duration-[2000ms] ease-in-out ${isVenting ? 'scale-[5] rotate-180' : 'scale-100'}`}>
            
            {/* 1. Outer Glow (Lensing Effect) */}
            <div className="absolute w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] animate-pulse"></div>

            {/* 2. Accretion Disk (Spinning Rings) */}
            <div className="absolute w-[420px] h-[420px] rounded-full border-[2px] border-transparent border-t-orange-500/50 border-r-red-600/50 blur-[1px] animate-[spin_8s_linear_infinite]"></div>
            <div className="absolute w-[400px] h-[400px] rounded-full border-[4px] border-transparent border-b-orange-400/30 border-l-yellow-600/30 blur-[2px] animate-[spin_12s_linear_infinite_reverse]"></div>
            
            {/* 3. Photon Ring (Bright Inner Rim) */}
            <div className="absolute w-[310px] h-[310px] rounded-full border-[1px] border-white/10 shadow-[0_0_50px_rgba(255,100,50,0.4)]"></div>

            {/* 4. The Event Horizon (Pure Black Void) */}
            <div className="w-72 h-72 bg-black rounded-full shadow-[0_0_60px_rgba(0,0,0,1)] z-10 relative flex items-center justify-center overflow-hidden">
                {/* Inner Darkness Pulse */}
                <div className="absolute inset-0 bg-black shadow-[inset_0_0_40px_rgba(50,0,0,0.5)] animate-pulse"></div>
            </div>
       </div>

       {/* --- THE UI LAYER --- */}
       <div className={`absolute z-50 flex flex-col items-center gap-6 transition-all duration-[1500ms] ease-in-out ${isVenting ? 'scale-0 opacity-0 translate-y-[200px] blur-xl' : 'scale-100 opacity-100'}`}>
           
           <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-black tracking-[0.5em] uppercase drop-shadow-glow">The Void</h2>
           
           <div className="w-[500px] bg-black/40 backdrop-blur-md border border-red-900/30 p-6 rounded-2xl shadow-2xl">
               <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type the thought you wish to destroy..."
                  className="w-full h-32 bg-transparent border-b border-red-900/30 p-4 text-red-100 text-lg focus:outline-none focus:border-red-500 transition-all resize-none placeholder-red-900/50 text-center font-mono"
               />
           </div>
           
           <div className="flex gap-4">
                <button 
                    onClick={onClose}
                    className="px-8 py-3 text-red-500/40 hover:text-red-400 font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all"
                >
                    Retreat
                </button>
                <button 
                    onClick={handleVent}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-10 rounded-full shadow-[0_0_50px_rgba(220,38,38,0.4)] hover:shadow-[0_0_80px_rgba(220,38,38,0.6)] uppercase tracking-widest text-xs transition-all hover:scale-110 active:scale-95"
                >
                    Cast into Void
                </button>
           </div>
       </div>

    </div>
  );
};

export default TheVoid;