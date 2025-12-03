import React, { useEffect, useState, useMemo } from 'react';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from '../../firebase';
import Journal from '../../Journal.jsx';
import TheVoid from '../../TheVoid.jsx';
import { signOut } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Scan, Database, Activity, FileText, X, User as UserIcon, LogOut, ShieldCheck } from 'lucide-react';

// --- Component Imports ---
import GalaxyGraph from './GalaxyGraph.jsx';
import CommandDock from './CommandDock.jsx';
import EntryModal from './EntryModal.jsx';

// --- Panel Imports ---
// FIX: Changed 'Panels' to 'panels' to match actual folder name
import StarLog from './panels/StarLog.jsx';
import OraclePanel from './panels/OraclePanel.jsx';
import IdentityPanel from './panels/IdentityPanel.jsx';
import SentimentPanel from './panels/SentimentPanel.jsx';
import MoodExplorer from './panels/MoodExplorer.jsx';

// --- COMPONENT: CAPTAIN'S IDENTITY BADGE ---
const UserBadge = ({ user }) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <motion.div className="absolute top-6 right-6 z-50 flex flex-col items-end" initial={false} animate={expanded ? "open" : "closed"}>
          <motion.button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-3 bg-blue-950/30 backdrop-blur-md border border-blue-500/30 rounded-full pl-4 pr-1 py-1 shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:bg-blue-900/40 transition-all group"
              whileHover={{ scale: 1.05, borderColor: "rgba(59,130,246,0.6)" }}
              whileTap={{ scale: 0.95 }}
          >
              <div className="flex flex-col items-end mr-2">
                   <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest leading-none">
                      CDR. {user.displayName?.split(' ')[0] || 'PILOT'}
                   </span>
                   <span className="text-[8px] text-blue-500/60 font-tech tracking-wider">
                      ID: {user.uid.substring(0, 4)}...{user.uid.substring(user.uid.length - 4)}
                   </span>
              </div>
  
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-blue-400/50 group-hover:border-blue-300 transition-colors bg-black">
                  {user.photoURL ? (
                      <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-900">
                          <UserIcon size={18} className="text-blue-200" />
                      </div>
                  )}
                  <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-black"></span>
                  </span>
              </div>
          </motion.button>
  
          <AnimatePresence>
              {expanded && (
                  <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="mt-2 w-56 bg-gray-950/90 backdrop-blur-2xl border border-blue-500/20 rounded-xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] origin-top-right"
                  >
                      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-50" />
                      <div className="p-4 border-b border-white/5 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-blue-200">
                             <ShieldCheck size={14} className="text-emerald-400" />
                             <span>Secure Connection</span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-tech truncate">{user.email}</p>
                      </div>
                      <button
                          onClick={() => signOut(auth)}
                          className="w-full flex items-center gap-3 p-4 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-xs font-bold uppercase tracking-wider"
                      >
                          <LogOut size={16} />
                          Disengage System
                      </button>
                  </motion.div>
              )}
          </AnimatePresence>
      </motion.div>
    );
};

// --- COMPONENT: BIG BANG INTRO ---
const IntroSequence = ({ onComplete }) => {
    return (
        <motion.div 
            className="absolute inset-0 z-[100] flex items-center justify-center bg-black"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1, delay: 2.5, ease: "easeOut" }}
            onAnimationComplete={onComplete}
        >
            <motion.div
                initial={{ scale: 0, opacity: 0, boxShadow: "0 0 0px #fff" }}
                animate={{ 
                    scale: [0, 1.5, 0.5, 50],
                    opacity: [0, 1, 1, 0],
                    boxShadow: ["0 0 0px #fff", "0 0 50px #fff", "0 0 100px #60a5fa", "0 0 500px #fff"]
                }}
                transition={{ duration: 2.5, times: [0, 0.4, 0.6, 1], ease: "easeInOut" }}
                className="w-4 h-4 bg-white rounded-full"
            />
            <motion.h1
                initial={{ opacity: 0, letterSpacing: "1em", scale: 2 }}
                animate={{ opacity: [0, 1, 0], letterSpacing: "0.2em", scale: 1 }}
                transition={{ duration: 2, delay: 0.2 }}
                className="absolute text-white font-bold text-sm md:text-xl uppercase tracking-widest mt-32 font-tech"
            >
                Initializing Universe
            </motion.h1>
        </motion.div>
    );
};

// --- COMPONENT: SCANNER HUD ---
const ScannerHUD = ({ data, onClose }) => {
    if (!data) return null;
    let config = { title: "UNKNOWN SIGNAL", type: "ANOMALY", desc: "Unable to parse data signature.", color: "gray", icon: Scan };

    if (data.group === 'entry') {
        config = { title: "MEMORY LOG", type: "CHRONICLE DATA", desc: `Encrypted journal entry from ${data.name || 'Unknown Date'}. Contains personal reflection data.`, color: "blue", icon: FileText };
    } else if (data.group === 'emotion') {
        config = { title: "EMOTIONAL CORE", type: "PSIONIC SIGNATURE", desc: `A cluster of memories bound by the feeling of "${(data.name || 'Unknown').toUpperCase()}". High resonance detected.`, color: "pink", icon: Activity };
    } else if (data.group === 'keyword') {
        config = { title: "NEURAL LINK", type: "SEMANTIC TAG", desc: `Recurring concept: "${(data.name || 'Unknown').toUpperCase()}". Connected to multiple timeline entries.`, color: "purple", icon: Database };
    }

    return (
        <motion.div initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 50, scale: 0.9 }} className={`absolute bottom-24 right-6 z-50 w-80 overflow-hidden rounded-xl border border-${config.color}-500/30 bg-black/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]`}>
            <motion.div initial={{ top: "-100%" }} animate={{ top: "200%" }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className={`absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${config.color}-400 to-transparent opacity-50`} />
            <div className={`flex items-center justify-between bg-${config.color}-950/30 p-3 border-b border-${config.color}-500/20`}>
                <div className="flex items-center gap-2"><config.icon size={16} className={`text-${config.color}-400 animate-pulse`} /><span className={`text-xs font-bold tracking-[0.2em] text-${config.color}-300 font-tech`}>{config.type}</span></div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={14} /></button>
            </div>
            <div className="p-4 space-y-3">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider text-shadow-sm">{config.title}</h3>
                <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent" />
                <p className="text-sm text-gray-300 font-tech leading-relaxed"><span className={`text-${config.color}-400`}>{">"}</span> {config.desc}</p>
                <div className="flex justify-between items-end mt-2 opacity-50">
                    <span className="text-[10px] text-gray-500 font-tech">ID: {data.id?.substring(0,8).toUpperCase()}...</span>
                    <div className="flex gap-1"><div className={`w-1 h-1 rounded-full bg-${config.color}-500`} /><div className={`w-1 h-1 rounded-full bg-${config.color}-500 animate-bounce`} style={{ animationDelay: '0.1s'}} /><div className={`w-1 h-1 rounded-full bg-${config.color}-500 animate-bounce`} style={{ animationDelay: '0.2s'}} /></div>
                </div>
            </div>
        </motion.div>
    );
};

// --- MAIN COMPONENT ---
const MemoryGalaxy = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [activePanel, setActivePanel] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [scannerData, setScannerData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isBlackHoleMode, setIsBlackHoleMode] = useState(false);
  const [init, setInit] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Effects ---
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'entries'), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rawEntries = [];
      snapshot.forEach((doc) => rawEntries.push({ id: doc.id, ...doc.data() }));
      setEntries(rawEntries);
    });
    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    if (entries.length === 0 || isBlackHoleMode || loading) return;
    const showSignal = () => {
      const randomEntry = entries[Math.floor(Math.random() * entries.length)];
      if (!randomEntry) return;
      const snippet = randomEntry.content.length > 100 ? randomEntry.content.substring(0, 100) + "..." : randomEntry.content;
      let dateStr = "Unknown Stardate";
      if (randomEntry.createdAt && randomEntry.createdAt.toDate) dateStr = randomEntry.createdAt.toDate().toLocaleDateString();
      setNotification({ date: dateStr, message: snippet });
      setTimeout(() => setNotification(null), 6000);
    };
    const signalInterval = setInterval(showSignal, 15000);
    const initialTimeout = setTimeout(showSignal, 4000);
    return () => { clearInterval(signalInterval); clearTimeout(initialTimeout); };
  }, [entries, isBlackHoleMode, loading]);

  useEffect(() => { initParticlesEngine(async (engine) => { await loadSlim(engine); }).then(() => setInit(true)); }, []);
  useEffect(() => { setIsBlackHoleMode(activePanel === 'void'); }, [activePanel]);

  const togglePanel = (panel) => setActivePanel(activePanel === panel ? null : panel);

  const handleNodeClick = (node) => {
    const foundEntry = entries.find(e => e.id === node.id);
    if (foundEntry) {
        setSelectedNode(foundEntry);
        setActivePanel(null);
        setScannerData(null);
    } else {
        setScannerData({ ...node, group: node.group || (node.emotion ? 'emotion' : 'keyword') });
        setSelectedNode(null);
    }
  };

  const particlesOptions = useMemo(() => ({
    fullScreen: { enable: false },
    background: { color: { value: "transparent" } }, 
    fpsLimit: 60,
    particles: {
      color: { value: "#ffffff" },
      move: { enable: true, speed: 0.3, direction: "none", random: true, outModes: "out" },
      number: { value: 300, density: { enable: true, area: 800 } },
      opacity: { value: { min: 0.1, max: 0.8 }, animation: { enable: true, speed: 0.5, minimumValue: 0.1, sync: false } },
      size: { value: { min: 0.5, max: 2.5 } }
    },
  }), []);

  return (
    // FIX: DEEP SPACE RADIAL GRADIENT + OVERLAYS
    <div className={`relative w-full h-full overflow-hidden transition-colors duration-1000 ${isBlackHoleMode ? 'bg-black' : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1d29] via-[#000000] to-[#000000]'}`}>
        
        {/* TEXTURE LAYERS */}
        <div className="scanlines" />
        <div className="vignette" />

        <AnimatePresence>
            {loading && <IntroSequence onComplete={() => setLoading(false)} />}
        </AnimatePresence>

        {init && <Particles id="tsparticles" options={particlesOptions} className="absolute inset-0 -z-20" />}

        <AnimatePresence>
            {isBlackHoleMode && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50">
                    <TheVoid onClose={() => togglePanel('void')} />
                </motion.div>
            )}
        </AnimatePresence>

        <motion.div 
            className={`absolute inset-0 z-0 transition-opacity duration-1000 ${isBlackHoleMode ? 'opacity-0' : 'opacity-100'}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: loading ? 0 : 1, scale: loading ? 0.5 : 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
        >
             <GalaxyGraph entries={entries} searchTerm={searchTerm} onNodeClick={handleNodeClick} />
        </motion.div>

        {!loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
                {/* Header */}
                <div className="absolute top-6 left-6 z-50 flex gap-4 items-center">
                    <h1 className="text-3xl font-bold text-white tracking-widest">PastMe</h1>
                    {!isBlackHoleMode && (
                        <input type="text" placeholder="Scan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-48 bg-blue-950/30 border border-blue-500/20 rounded-full py-1 px-4 text-blue-100 focus:outline-none focus:border-blue-400/50 transition-all backdrop-blur-sm" />
                    )}
                </div>

                {!isBlackHoleMode && <UserBadge user={user} />}

                <AnimatePresence>
                    {notification && !isBlackHoleMode && (
                        <motion.div initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }} className="absolute top-24 left-1/2 z-50 flex items-start gap-4 px-6 py-4 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl w-full max-w-2xl whitespace-normal cursor-pointer hover:bg-black/30 transition-colors" onClick={() => setNotification(null)}>
                            <span className="text-xl animate-pulse text-blue-300">📡</span>
                            <div className="flex flex-col text-left">
                                <span className="text-[10px] font-bold text-blue-400/80 uppercase tracking-widest mb-1 font-tech">Signal Received • {notification.date}</span>
                                <p className="text-sm text-blue-100/90 leading-relaxed font-light">"{notification.message}"</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {scannerData && !isBlackHoleMode && <ScannerHUD data={scannerData} onClose={() => setScannerData(null)} />}
                </AnimatePresence>

                <CommandDock activePanel={activePanel} togglePanel={togglePanel} isBlackHoleMode={isBlackHoleMode} />
            </motion.div>
        )}

        <AnimatePresence mode="wait">
            {activePanel === 'log' && <motion.div key="log" initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }} className="absolute inset-0 pointer-events-none z-40"><StarLog entries={entries} searchTerm={searchTerm} onNodeClick={handleNodeClick} onClose={() => setActivePanel(null)}/></motion.div>}
            
            {activePanel === 'journal' && !isBlackHoleMode && (
                <motion.div 
                    key="journal" 
                    initial={{ y: 200, opacity: 0, x: "-50%" }} 
                    animate={{ y: 0, opacity: 1, x: "-50%" }} 
                    exit={{ y: 200, opacity: 0, x: "-50%" }} 
                    className="absolute bottom-32 left-1/2 w-full max-w-lg z-50"
                >
                    <div className="bg-gray-900/60 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 relative shadow-2xl">
                        <Journal user={user} />
                    </div>
                </motion.div>
            )}

            {activePanel === 'identity' && !isBlackHoleMode && <motion.div key="identity" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"><div className="pointer-events-auto w-full max-w-4xl h-[80vh]"><IdentityPanel user={user} entries={entries} /></div></motion.div>}
            {activePanel === 'discover' && !isBlackHoleMode && <motion.div key="discover" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"><div className="pointer-events-auto w-full max-w-5xl h-[85vh]"><MoodExplorer entries={entries} /></div></motion.div>}
            {activePanel === 'vitals' && !isBlackHoleMode && <motion.div key="vitals" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"><div className="pointer-events-auto w-full max-w-4xl p-4"><SentimentPanel entries={entries} /></div></motion.div>}
            {activePanel === 'oracle' && !isBlackHoleMode && <motion.div key="oracle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"><div className="pointer-events-auto w-full max-w-2xl"><OraclePanel entries={entries} /></div></motion.div>}
        </AnimatePresence>

        {selectedNode && <EntryModal entry={selectedNode} onClose={() => setSelectedNode(null)} user={user} />}
    </div>
  );
};

export default MemoryGalaxy;