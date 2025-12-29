import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Activity, Search, Fingerprint, Radio, List, Disc 
} from 'lucide-react';
import useSoundEffects from '../../hooks/useSoundEffects'; // Import the hook

// Color Mapping
const THEME_COLORS = {
    blue:   { text: "text-blue-400",   bg: "bg-blue-500/20",   glow: "shadow-[0_0_15px_rgba(59,130,246,0.5)]", border: "border-blue-500/30" },
    purple: { text: "text-purple-400", bg: "bg-purple-500/20", glow: "shadow-[0_0_15px_rgba(168,85,247,0.5)]", border: "border-purple-500/30" },
    teal:   { text: "text-teal-400",   bg: "bg-teal-500/20",   glow: "shadow-[0_0_15px_rgba(20,184,166,0.5)]", border: "border-teal-500/30" },
    pink:   { text: "text-pink-400",   bg: "bg-pink-500/20",   glow: "shadow-[0_0_15px_rgba(236,72,153,0.5)]", border: "border-pink-500/30" },
    yellow: { text: "text-yellow-400", bg: "bg-yellow-500/20", glow: "shadow-[0_0_15px_rgba(234,179,8,0.5)]",  border: "border-yellow-500/30" },
    cyan:   { text: "text-cyan-400",   bg: "bg-cyan-500/20",   glow: "shadow-[0_0_15px_rgba(6,182,212,0.5)]",  border: "border-cyan-500/30" },
    red:    { text: "text-red-400",    bg: "bg-red-500/20",    glow: "shadow-[0_0_15px_rgba(239,68,68,0.5)]",   border: "border-red-500/30" },
};

const DockItem = React.memo(({ icon: Icon, label, isActive, onClick, colorKey }) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = THEME_COLORS[colorKey];
  
  // Initialize Sound Hook
  const { playHover, playClick } = useSoundEffects();

  return (
    <div className="relative flex flex-col items-center justify-center">
      
      {/* 1. HOLOGRAPHIC TOOLTIP */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -50, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className={`absolute z-50 px-3 py-1.5 bg-gray-900/90 backdrop-blur-xl border ${theme.border} rounded-lg shadow-xl pointer-events-none`}
          >
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme.text} whitespace-nowrap`}>
              {label}
            </span>
            <div className="absolute top-0 left-0 w-1 h-1 bg-white/50" />
            <div className="absolute bottom-0 right-0 w-1 h-1 bg-white/50" />
            <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-r border-b ${theme.border} rotate-45`} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        // SOUND TRIGGER: HOVER
        onHoverStart={() => {
            setIsHovered(true);
            playHover(); // Play "blip"
        }}
        onHoverEnd={() => setIsHovered(false)}
        
        // SOUND TRIGGER: CLICK
        onClick={() => {
            playClick(); // Play "click"
            onClick();
        }}
        
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative z-10 p-3 rounded-2xl group transition-all duration-300"
      >
        <Icon 
            size={24} 
            strokeWidth={1.5} 
            className={`relative z-20 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`} 
        />

        {/* 2. SLIDING ENERGY CORE */}
        {isActive && (
          <motion.div
            layoutId="activeDockGlow"
            className={`absolute inset-0 rounded-2xl ${theme.bg} ${theme.glow} border ${theme.border} backdrop-blur-sm z-10`}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        
        {/* Hover Highlight */}
        {!isActive && isHovered && (
            <motion.div 
                layoutId="hoverDockGlow"
                className="absolute inset-0 bg-white/5 rounded-2xl z-0"
                transition={{ duration: 0.2 }}
            />
        )}
      </motion.button>
      
      {/* 3. ACTIVE DOT */}
      {isActive && (
        <motion.div
            layoutId="activeDot"
            className={`absolute -bottom-2 w-1 h-1 rounded-full ${theme.bg.replace('/20','')} shadow-[0_0_8px_currentColor]`}
        />
      )}
    </div>
  );
});

const CommandDock = ({ activePanel, togglePanel, isBlackHoleMode }) => {
    if (isBlackHoleMode) return null;

    return (
        <motion.div 
            initial={{ y: 100, x: "-50%" }}
            animate={{ y: 0, x: "-50%" }}
            className="absolute bottom-8 left-1/2 z-50 perspective-[1000px]"
        >
             {/* CONSOLE CONTAINER */}
             <div className="
                flex items-center gap-1.5 px-3 py-2 
                bg-gray-950/60 backdrop-blur-2xl 
                border border-white/10 ring-1 ring-white/5
                rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)]
             ">
                
                {/* SECTOR 1: LOGS */}
                <DockItem icon={List} label="Chronicles" isActive={activePanel === 'log'} onClick={() => togglePanel('log')} colorKey="blue" />
                
                <div className="w-px h-6 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1" />
                
                {/* SECTOR 2: ANALYSIS */}
                <DockItem icon={Fingerprint} label="Identify" isActive={activePanel === 'identity'} onClick={() => togglePanel('identity')} colorKey="purple" />
                <DockItem icon={Search} label="Discover" isActive={activePanel === 'discover'} onClick={() => togglePanel('discover')} colorKey="teal" />
                <DockItem icon={Activity} label="Vitals" isActive={activePanel === 'vitals'} onClick={() => togglePanel('vitals')} colorKey="pink" />
                
                <div className="w-px h-6 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1" />
                
                {/* SECTOR 3: ACTION */}
                <DockItem icon={BookOpen} label="Journal" isActive={activePanel === 'journal'} onClick={() => togglePanel('journal')} colorKey="yellow" />
                
                <div className="w-px h-6 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1" />

                {/* SECTOR 4: COSMIC */}
                <DockItem icon={Radio} label="Oracle" isActive={activePanel === 'oracle'} onClick={() => togglePanel('oracle')} colorKey="cyan" />
                <DockItem icon={Disc} label="The Void" isActive={activePanel === 'void'} onClick={() => togglePanel('void')} colorKey="red" />

             </div>
        </motion.div>
    )
}

export default React.memo(CommandDock);