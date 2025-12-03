import React, { useState, useEffect } from 'react';

const IdentityPanel = ({ onClose, entries }) => {
    const [identityData, setIdentityData] = useState(null);
    const [identityLoading, setIdentityLoading] = useState(false);

    useEffect(() => {
        const handleAnalyzeIdentity = async () => {
            setIdentityLoading(true);
            if (entries.length === 0) {
                setIdentityData({ archetype: "Empty", summary: "Please write at least one journal entry first." });
                setIdentityLoading(false);
                return;
            }
            const contextData = entries.slice(0, 30).map(e => `${e.emotion}: ${e.summary}`).join('\n');
            try {
               const response = await fetch('/api/analyzeIdentity', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context: contextData }),
              });
              const data = await response.json();
              if (!response.ok) throw new Error(data.error || "Server Error");
              setIdentityData(data);
            } catch (err) { 
                console.error("Frontend Error:", err); 
                setIdentityData({ archetype: "Error", summary: `Technical details: ${err.message}`}); 
            }
            setIdentityLoading(false);
          }
          
          handleAnalyzeIdentity();
    }, [entries]);

    return (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-full max-w-lg z-40 animate-fade-in-up">
            <div className="bg-indigo-950/90 backdrop-blur-2xl border border-indigo-500/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(99,102,241,0.4)] relative min-h-[300px]">
                <button onClick={onClose} className="absolute top-4 right-4 text-indigo-400 hover:text-white">✕</button>
                <h2 className="text-lg font-bold text-indigo-200 mb-4 uppercase tracking-widest">Cosmic Identity</h2>
                {identityLoading ? (
                    <div className="flex items-center justify-center h-40 text-indigo-300 animate-pulse">Scanning Psyche...</div>
                ) : identityData ? (
                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="text-xs text-indigo-400 uppercase">Archetype</p>
                            <h3 className="text-3xl font-bold text-white drop-shadow-glow">{identityData.archetype}</h3>
                            <p className="text-indigo-300 text-sm mt-1">Element: {identityData.element}</p>
                        </div>
                        <div className="flex justify-center gap-2">
                            {identityData.traits?.map(t => <span key={t} className="px-3 py-1 bg-indigo-500/20 rounded-full text-xs border border-indigo-500/40 text-indigo-200">{t}</span>)}
                        </div>
                        <div className="bg-black/40 p-4 rounded-xl border border-indigo-500/20">
                            <p className="text-sm text-indigo-100 italic">"{identityData.summary}"</p>
                        </div>
                        <div className="text-center border-t border-indigo-500/30 pt-4">
                            <p className="text-xs text-indigo-400 uppercase mb-1">Mantra</p>
                            <p className="text-lg font-serif text-white">{identityData.mantra}</p>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default IdentityPanel;