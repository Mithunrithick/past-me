import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronRight, Hash, X, Search } from 'lucide-react';

// FIX: Define FULL class names so Tailwind doesn't purge them.
// Do not use string concatenation (e.g., `bg-${color}-500`) here.
const getEntryTheme = (text) => {
  const lower = text?.toLowerCase() || "";

  // 1. NEGATIVE / SAD (Red)
  if (lower.includes('sad') || lower.includes('overwhelmed') || lower.includes('difficult') || lower.includes('pain') || lower.includes('bad')) {
    return { 
      dot: "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]",
      dotWrapper: "border-red-900 bg-red-950",
      card: "border-red-500/30 bg-red-950/20 hover:border-red-400/60 hover:shadow-[0_0_25px_-5px_rgba(239,68,68,0.3)]",
      icon: "text-red-400"
    };
  }
  
  // 2. POSITIVE / HAPPY (Emerald/Green)
  if (lower.includes('happy') || lower.includes('acceptance') || lower.includes('joy') || lower.includes('great') || lower.includes('love')) {
    return { 
      dot: "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]",
      dotWrapper: "border-emerald-900 bg-emerald-950",
      card: "border-emerald-500/30 bg-emerald-950/20 hover:border-emerald-400/60 hover:shadow-[0_0_25px_-5px_rgba(52,211,153,0.3)]",
      icon: "text-emerald-400"
    };
  }
  
  // 3. NEUTRAL / DEFAULT (Blue)
  return { 
    dot: "bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]",
    dotWrapper: "border-blue-900 bg-blue-950",
    card: "border-blue-500/30 bg-blue-950/20 hover:border-blue-400/60 hover:shadow-[0_0_25px_-5px_rgba(96,165,250,0.3)]",
    icon: "text-blue-400"
  };
};

const StarLog = ({ entries, onNodeClick, onClose, searchTerm }) => { 
  
  const filteredEntries = useMemo(() => {
    if (!searchTerm) return entries;
    const lowerTerm = searchTerm.toLowerCase();
    return entries.filter(entry => 
      entry.content?.toLowerCase().includes(lowerTerm) || 
      entry.emotion?.toLowerCase().includes(lowerTerm)
    );
  }, [entries, searchTerm]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { x: 50, opacity: 0 },
    show: { x: 0, opacity: 1 }
  };

  return (
    <div className="pointer-events-auto h-full w-full md:max-w-md ml-auto bg-gray-950/95 md:bg-gray-950/80 backdrop-blur-2xl border-l border-white/10 flex flex-col shadow-2xl relative">
      
      {/* Header */}
      <div className="flex-none p-6 border-b border-white/5 bg-black/40 z-20 flex justify-between items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-widest flex items-center gap-3">
            <Hash className="text-blue-400" size={20} />
            {searchTerm ? 'SEARCH RESULTS' : 'CHRONICLES'}
          </h2>
          <div className="flex items-center gap-2 mt-1 ml-8">
             <span className={`text-[10px] uppercase tracking-[0.2em] ${searchTerm ? 'text-yellow-400' : 'text-blue-300/60'}`}>
                {filteredEntries.length} Records Found
             </span>
          </div>
        </div>
        {onClose && (
            <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
                <X size={24} />
            </button>
        )}
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-thin scrollbar-thumb-blue-900 scrollbar-track-transparent">
        
        {/* Timeline Line */}
        <div className="absolute left-6 md:left-9 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/0 via-blue-500/20 to-blue-500/0 h-full" />

        {filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-20 px-10 text-center opacity-50">
                <Search size={40} className="text-blue-500 mb-4" />
                <p className="text-blue-200 text-sm">No signals found matching "{searchTerm}"</p>
            </div>
        ) : (
            <motion.div 
              key={searchTerm || 'list'}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="p-4 md:p-6 space-y-6 md:space-y-8 pb-32"
            >
            {filteredEntries.map((entry) => {
                const theme = getEntryTheme(entry.content);
                const dateObj = entry.createdAt?.toDate ? entry.createdAt.toDate() : new Date();
                const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

                return (
                <motion.div 
                    key={entry.id}
                    variants={itemVariants}
                    className="relative pl-8 md:pl-10 group"
                    onClick={() => onNodeClick(entry)}
                >
                    {/* FIXED: Dot Rendering using Theme classes */}
                    <div className={`absolute left-0 top-6 w-6 h-6 md:w-7 md:h-7 -ml-[3px] md:-ml-[3.5px] rounded-full border z-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${theme.dotWrapper}`}>
                         <div className={`w-2 h-2 rounded-full animate-pulse ${theme.dot}`} />
                    </div>

                    {/* FIXED: Card Rendering using Theme classes */}
                    <div className={`
                        relative p-4 md:p-5 rounded-2xl cursor-pointer transition-all duration-300 border
                        ${theme.card}
                        active:scale-95
                    `}>
                    
                    <div className="flex justify-between items-center mb-2 md:mb-3 opacity-70 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono text-blue-200">
                        <Calendar size={10} />
                        <span>{dateStr}</span>
                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                        <Clock size={10} />
                        <span>{timeStr}</span>
                        </div>
                    </div>

                    <p className="text-gray-300 text-xs md:text-sm leading-relaxed font-light line-clamp-3 group-hover:text-white transition-colors">
                        {entry.content}
                    </p>

                    <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 hidden md:block">
                        <ChevronRight className={theme.icon} size={16} />
                    </div>
                    
                    </div>
                </motion.div>
                );
            })}
            </motion.div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none z-10" />
    </div>
  );
};

export default StarLog;