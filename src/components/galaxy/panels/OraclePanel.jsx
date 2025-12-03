import React, { useState } from 'react';
import Typewriter from 'typewriter-effect';

const SpeakIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>;

const OraclePanel = ({ onClose, entries }) => {
  const [oracleQuery, setOracleQuery] = useState('');
  const [oracleResponse, setOracleResponse] = useState('');
  const [oracleLoading, setOracleLoading] = useState(false);

  const handleAskOracle = async (e) => {
    e.preventDefault();
    if (!oracleQuery.trim()) return;
    setOracleLoading(true);
    setOracleResponse(''); 
    const contextData = entries.slice(0, 50).map(e => `Date: ${new Date(e.createdAt?.toDate()).toLocaleDateString()} | Emotion: ${e.emotion} | Content: ${e.content}`).join('\n\n');
    try {
      const response = await fetch('/api/askOracle', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: oracleQuery, context: contextData }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setOracleResponse(data.answer);
    } catch (err) { setOracleResponse(`Error: ${err.message}`); }
    setOracleLoading(false);
  };

  const speakOracle = () => {
    if (!oracleResponse) return;
    const utterance = new SpeechSynthesisUtterance(oracleResponse);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural'));
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-full max-w-xl z-40 animate-fade-in-up">
        <div className="bg-purple-950/90 backdrop-blur-2xl border border-purple-500/50 rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4 border-b border-purple-500/30 pb-2">
            <h2 className="text-lg font-bold text-purple-200 flex items-center gap-2">🔮 Oracle Link</h2>
            <button onClick={onClose} className="text-purple-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleAskOracle} className="flex gap-2 mb-4">
            <input type="text" placeholder="Query the stars..." value={oracleQuery} onChange={(e) => setOracleQuery(e.target.value)} className="flex-1 bg-black/40 border border-purple-500/30 rounded-xl py-2 px-4 text-purple-100 focus:outline-none focus:border-purple-400" />
            <button type="submit" disabled={oracleLoading} className="bg-purple-600 text-white font-bold py-2 px-6 rounded-xl disabled:opacity-50">{oracleLoading ? "..." : "Ask"}</button>
        </form>
        {oracleResponse && (
            <div className="bg-black/40 p-4 rounded-xl border border-purple-500/20 max-h-48 overflow-y-auto glass-scroll">
                <div className="text-purple-100 font-serif leading-relaxed">
                    <button onClick={speakOracle} className="float-right text-purple-400 hover:text-white ml-2"><SpeakIcon /></button>
                    <Typewriter key={oracleResponse} onInit={(typewriter) => { typewriter.changeDelay(15).typeString(oracleResponse).start(); }} options={{ cursor: ' ✨' }} />
                </div>
            </div>
        )}
        </div>
    </div>
  );
};

export default OraclePanel;