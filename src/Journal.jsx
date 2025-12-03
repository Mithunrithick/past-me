import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Typewriter from 'typewriter-effect';
import { Sparkles, Mic, Square } from 'lucide-react'; // Added icons

// Browser compatibility check
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function Journal({ user }) {
  const [entryText, setEntryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiReply, setAiReply] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupport, setSpeechSupport] = useState(false);
  const micRef = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      setSpeechSupport(true);
      const mic = new SpeechRecognition();
      mic.continuous = true; // FIX: Keep listening
      mic.interimResults = true;
      mic.lang = 'en-US';
      
      mic.onresult = (event) => {
        const results = Array.from(event.results);
        const latestResult = results[results.length - 1];
        if (latestResult.isFinal) {
           const transcript = latestResult[0].transcript;
           setEntryText(prev => prev + ' ' + transcript);
        }
      };

      mic.onend = () => { /* Optional: handle auto-stop */ };
      mic.onerror = (event) => {
        console.error("Speech error", event.error);
        setIsRecording(false);
      };
      
      micRef.current = mic;
    }
  }, []);

  const handleRecordClick = () => {
    if (!micRef.current) return;
    if (isRecording) {
      micRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        micRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Mic start error:", err);
      }
    }
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (entryText.trim() === '') return;
    
    if (isRecording && micRef.current) {
      micRef.current.stop();
      setIsRecording(false);
    }

    setLoading(true);
    setAiReply(''); 

    try {
      // Calls your existing Vercel function
      const response = await fetch('/api/processEntry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: entryText }),
      });

      if (!response.ok) throw new Error('Failed to get AI analysis');

      const data = await response.json();
      
      // Clean up markdown if present
      const cleanJsonString = data.reply.replace(/```json|```/g, '').trim();
      let aiJson;
      try {
          aiJson = JSON.parse(cleanJsonString);
      } catch (e) {
          aiJson = { reply: cleanJsonString, emotion: "Neutral", summary: "Log Entry", keywords: [] };
      }

      setAiReply(aiJson.reply);

      await addDoc(collection(db, 'users', user.uid, 'entries'), {
        content: entryText,
        createdAt: serverTimestamp(),
        emotion: aiJson.emotion || "Neutral",
        summary: aiJson.summary || "",
        keywords: aiJson.keywords || [],
        sentiment: aiJson.sentiment_score || 0 
      });
      
      setEntryText('');
    } catch (err) {
      console.error("Error saving entry:", err);
      setAiReply(`System Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 h-full relative">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/10 pb-3">
        <h2 className="text-xl font-bold text-white tracking-widest flex items-center gap-2 font-tech">
            <Sparkles className="text-blue-400" size={18} />
            LOG ENTRY
        </h2>
        <div className="text-[12px] text-blue-400 font-tech">
            {new Date().toLocaleDateString()}
        </div>
      </div>

      <form onSubmit={handleSaveEntry} className="flex-1 flex flex-col relative">
        <textarea
          value={entryText}
          onChange={(e) => setEntryText(e.target.value)}
          placeholder="Log your thoughts to the stars..."
          // GLASS STYLING: bg-black/20 allowing stars to show through
          className="w-full flex-1 min-h-[200px] p-4 bg-black/20 backdrop-blur-sm border border-blue-500/20 rounded-xl text-blue-100 text-lg focus:outline-none focus:border-blue-400/80 placeholder-blue-500/30 resize-none custom-scrollbar transition-all font-sans leading-relaxed"
          disabled={loading}
        />

        <div className="flex gap-4 mt-4">
           {/* Upload Button */}
           <button
             type="submit"
             className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_rgba(37,99,235,0.7)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm font-tech"
             disabled={loading}
           >
             {loading ? 'Transmitting...' : 'Upload to Galaxy'}
           </button>
           
           {/* Mic Button - Restored */}
           {speechSupport && (
             <button
               type="button"
               onClick={handleRecordClick}
               className={`px-4 rounded-xl font-bold transition-all border flex items-center justify-center gap-2 ${
                 isRecording
                   ? 'bg-red-500/20 border-red-500 text-red-100 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                   : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
               }`}
             >
               {isRecording ? <Square size={18} /> : <Mic size={20} />}
             </button>
           )}
        </div>
      </form>

      {/* AI Reply Area - Sci-Fi Terminal Style */}
      {aiReply && (
        <div className="mt-4 p-4 bg-black/60 border-l-2 border-purple-500 rounded-r-xl backdrop-blur-md shadow-lg">
          <p className="text-purple-400 text-[10px] mb-2 uppercase tracking-[0.2em] font-tech flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
            Incoming Transmission
          </p>
          <div className="text-purple-100 text-sm font-light leading-relaxed font-tech">
            <Typewriter
              onInit={(typewriter) => {
                typewriter.changeDelay(20).typeString(aiReply).start();
              }}
              options={{ cursor: ' █' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Journal;