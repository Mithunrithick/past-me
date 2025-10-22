import { useState, useEffect, useRef } from 'react';
import { db } from './firebase'; // Import our db service
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = SpeechRecognition ? new SpeechRecognition() : null;

if (mic) {
  mic.continuous = false; 
  mic.interimResults = true;
  mic.lang = 'en-US';
}

function Journal({ user }) {
  const [entryText, setEntryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiReply, setAiReply] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupport, setSpeechSupport] = useState(false);
  const micRef = useRef(mic);

  useEffect(() => {
    if (micRef.current) {
      setSpeechSupport(true);
    }
  }, []);

  useEffect(() => {
    if (!micRef.current) return;
    const handleResult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setEntryText(transcript);
    };
    const handleEnd = () => setIsRecording(false);
    const handleError = (event) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };
    micRef.current.onresult = handleResult;
    micRef.current.onend = handleEnd;
    micRef.current.onerror = handleError;
  }, []); 

  const handleRecordClick = () => {
    if (isRecording) {
      micRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        micRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Mic start error:", err);
        alert("Could not start microphone. Please check permissions.");
      }
    }
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (entryText.trim() === '') return; 
    
    if (isRecording) {
      micRef.current.stop();
      setIsRecording(false);
    }

    setLoading(true);
    setAiReply('');

    try {
      const response = await fetch('/api/processEntry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: entryText }),
      });

      if (!response.ok) throw new Error('Failed to get AI analysis');
      
      const data = await response.json();
      const aiJson = JSON.parse(data.reply); 

      setAiReply(aiJson.reply);

      const entryCollection = collection(db, 'users', user.uid, 'entries');
      
      // --- UPDATE HERE: Add the sentiment score to the object ---
      await addDoc(entryCollection, {
        content: entryText,
        createdAt: serverTimestamp(),
        emotion: aiJson.emotion,
        summary: aiJson.summary,
        keywords: aiJson.keywords,
        sentiment: aiJson.sentiment_score // <-- THIS LINE IS NEW
      });
      // --- END OF UPDATE ---

      setEntryText('');
    } catch (err) {
      console.error("Error saving entry:", err);
      setAiReply(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <main className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSaveEntry}>
        <textarea
          value={entryText}
          onChange={(e) => setEntryText(e.target.value)}
          placeholder="What's on your mind? Or, click 'Record' to speak."
          className="w-full h-64 p-4 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:outline-none focus:border-blue-500"
          disabled={loading}
        />
        
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-500"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Entry'}
          </button>
          
          {speechSupport && (
            <button
              type="button" 
              onClick={handleRecordClick}
              className={`w-full font-bold py-3 px-4 rounded-lg transition duration-300 ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
          )}
        </div>
        
        {isRecording && <p className="text-center mt-4 text-blue-400">Listening...</p>}
      </form>

      {aiReply && (
        <div className="mt-8 p-4 bg-gray-800 border border-blue-500 rounded-lg">
          <p className="text-gray-400">PastMe says:</p>
          <p className="text-lg italic">{aiReply}</p>
        </div>
      )}
    </main>
  );
}

export default Journal;