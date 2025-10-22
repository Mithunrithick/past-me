import { useState, useEffect } from 'react';
import { db } from './firebase';
// Import functions to edit and delete documents
import {
  collection, query, orderBy, onSnapshot,
  doc, deleteDoc, updateDoc, serverTimestamp
} from "firebase/firestore";
import {
  BarChart, Bar, LineChart, Line, CartesianGrid,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ReferenceLine
} from 'recharts';

// --- Separate component for each Timeline Entry ---
function TimelineEntry({ entry, onEdit, onDelete, onReflect }) {
  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        {/* Entry Details */}
        <div>
          <p className="text-sm text-gray-400 mb-1">
            {new Date(entry.createdAt?.toDate()).toLocaleString()}
            {entry.updatedAt && <em className="text-xs ml-2 text-gray-500">(edited)</em>}
          </p>
          <p className="font-semibold">{entry.summary}</p>
          <p className="italic text-gray-300">"{entry.content}"</p>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-col gap-2 ml-2 flex-shrink-0">
          <button
            onClick={() => onEdit(entry)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(entry)}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Delete
          </button>
          <button
            onClick={() => onReflect(entry)}
            className="text-xs text-purple-400 hover:text-purple-300"
          >
            Reflect
          </button>
        </div>
      </div>
      {/* Emotion Tag */}
      <span className="text-xs font-medium bg-blue-600 text-white px-2 py-0.5 rounded-full mt-1 inline-block">
        {entry.emotion}
      </span>

      {/* Reflection Display Area */}
      {entry.reflectionLoading && <p className="text-sm text-gray-400 mt-3">Getting reflection...</p>}
      {entry.reflectionError && <p className="text-sm text-red-400 mt-3">Error: {entry.reflectionError}</p>}
      {entry.reflectionQuestion && (
        <div className="mt-3 pt-3 border-t border-gray-600">
          <p className="text-sm text-purple-300">{entry.reflectionQuestion}</p>
        </div>
      )}
    </div>
  );
}
// --- END OF TimelineEntry Component ---


function Dashboard({ user }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEntries, setFilteredEntries] = useState([]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editText, setEditText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Effect to fetch all entries
  useEffect(() => {
    const userEntriesCollection = collection(db, 'users', user.uid, 'entries');
    const q = query(userEntriesCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newEntries = [];
      querySnapshot.forEach((doc) => {
        newEntries.push({
          id: doc.id,
          ...doc.data(),
          reflectionLoading: false,
          reflectionQuestion: null,
          reflectionError: null,
        });
      });
      setEntries(newEntries);
      // Preserve search term when new data comes in
      if (searchTerm === '') {
        setFilteredEntries(newEntries);
      } else {
        // Re-apply search filter if needed
         const lowerCaseSearch = searchTerm.toLowerCase();
         const newlyFiltered = newEntries.filter(entry => {
            const contentMatch = entry.content.toLowerCase().includes(lowerCaseSearch);
            const summaryMatch = entry.summary.toLowerCase().includes(lowerCaseSearch);
            const emotionMatch = entry.emotion.toLowerCase().includes(lowerCaseSearch);
            const keywordsMatch = entry.keywords && Array.isArray(entry.keywords) &&
              entry.keywords.some(keyword =>
                keyword.toLowerCase().includes(lowerCaseSearch)
              );
            return contentMatch || summaryMatch || emotionMatch || keywordsMatch;
         });
         setFilteredEntries(newlyFiltered);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid, searchTerm]); // Add searchTerm dependency here

  // Effect to run search (simplified as filtering happens in fetch effect now)
  // useEffect(() => {
  //   if (searchTerm === '') {
  //     setFilteredEntries(entries);
  //   } else {
  //     const lowerCaseSearch = searchTerm.toLowerCase();
  //     const newFilteredEntries = entries.filter(entry => {
  //       const contentMatch = entry.content.toLowerCase().includes(lowerCaseSearch);
  //       const summaryMatch = entry.summary.toLowerCase().includes(lowerCaseSearch);
  //       const emotionMatch = entry.emotion.toLowerCase().includes(lowerCaseSearch);
  //       const keywordsMatch = entry.keywords && Array.isArray(entry.keywords) &&
  //         entry.keywords.some(keyword =>
  //           keyword.toLowerCase().includes(lowerCaseSearch)
  //         );
  //       return contentMatch || summaryMatch || emotionMatch || keywordsMatch;
  //     });
  //     setFilteredEntries(newFilteredEntries);
  //   }
  // }, [searchTerm, entries]);

  // --- START OF HELPER FUNCTIONS (Correctly placed INSIDE the component) ---
  const getMoodData = () => {
    const moodCounts = {};
    for (const entry of entries) {
      const mood = entry.emotion || 'unknown';
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    }
    return Object.entries(moodCounts).map(([name, value]) => ({ name, value }));
  };

  const getSentimentData = () => {
    return entries
      .filter(entry => entry.sentiment !== undefined)
      .map(entry => ({
        date: new Date(entry.createdAt?.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sentiment: entry.sentiment,
      }))
      .reverse();
  };

  const getKeywordData = () => {
    const keywordCounts = {};
    for (const entry of entries) {
      if (entry.keywords && Array.isArray(entry.keywords)) {
        entry.keywords.forEach(keyword => {
          const lowerCaseKeyword = keyword.toLowerCase();
          keywordCounts[lowerCaseKeyword] = (keywordCounts[lowerCaseKeyword] || 0) + 1;
        });
      }
    }
    return Object.entries(keywordCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };
  // --- END OF HELPER FUNCTIONS ---

  // --- START OF EDIT/DELETE/REFLECT HANDLERS ---
  const handleDeleteClick = (entry) => {
    setSelectedEntry(entry);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedEntry) {
      const entryRef = doc(db, 'users', user.uid, 'entries', selectedEntry.id);
      await deleteDoc(entryRef);
      setIsDeleteModalOpen(false);
      setSelectedEntry(null);
    }
  };

  const handleEditClick = (entry) => {
    setSelectedEntry(entry);
    setEditText(entry.content);
    setIsEditModalOpen(true);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!selectedEntry || editText.trim() === '') return;
    setIsSaving(true);

    try {
      const response = await fetch('/api/processEntry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editText }),
      });
      if (!response.ok) throw new Error('Failed to re-analyze entry');

      const data = await response.json();
      const aiJson = JSON.parse(data.reply);

      const entryRef = doc(db, 'users', user.uid, 'entries', selectedEntry.id);
      await updateDoc(entryRef, {
        content: editText,
        summary: aiJson.summary,
        emotion: aiJson.emotion,
        keywords: aiJson.keywords,
        sentiment: aiJson.sentiment_score,
        updatedAt: serverTimestamp()
      });

      setIsEditModalOpen(false);
      setSelectedEntry(null);
      setEditText('');

    } catch (err) {
      console.error("Error updating entry:", err);
      alert("Failed to update entry. Please try again.");
    }
    setIsSaving(false);
  };

  const handleGetReflection = async (entryToReflect) => {
    if (entryToReflect.reflectionLoading || entryToReflect.reflectionQuestion) return;

    const updateEntryState = (entryId, updates) => {
        // Use functional update to ensure correct state based on previous state
        setFilteredEntries(prevEntries =>
            prevEntries.map(e => e.id === entryId ? { ...e, ...updates } : e)
        );
        // Also update the main entries state if needed, though filteredEntries is what's displayed
        setEntries(prevEntries =>
             prevEntries.map(e => e.id === entryId ? { ...e, ...updates } : e)
        );
    };


    updateEntryState(entryToReflect.id, { reflectionLoading: true, reflectionError: null });

    try {
      const response = await fetch('/api/getReflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryText: entryToReflect.content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get reflection');
      }

      const data = await response.json();
      updateEntryState(entryToReflect.id, {
        reflectionLoading: false,
        reflectionQuestion: data.question
      });

    } catch (err) {
      console.error("Error getting reflection:", err);
      updateEntryState(entryToReflect.id, {
        reflectionLoading: false,
        reflectionError: err.message
      });
    }
  };
  // --- END OF HANDLERS ---

  const moodData = getMoodData();
  const sentimentData = getSentimentData();
  const keywordData = getKeywordData();

  if (loading) {
    return <div className="p-10">Loading entries...</div>
  }

  return (
    <>
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* --- Column 1 (Wider): Memory Timeline --- */}
        <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Timeline</h2>
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2"> {/* Added pr-2 for scrollbar */}
            {filteredEntries.length === 0 ? (
              <p className="text-gray-400">{searchTerm ? 'No entries match your search.' : 'No entries yet.'}</p>
            ) : (
              filteredEntries.map(entry => (
                <TimelineEntry
                  key={entry.id}
                  entry={entry}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onReflect={handleGetReflection}
                />
              ))
            )}
          </div>
        </div>

        {/* --- Column 2 (Narrower): Insights Sidebar --- */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* Sentiment Trend */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Sentiment Trend</h2>
            <div style={{ width: '100%', height: 300 }}>
              {sentimentData.length < 2 ? <p className="text-gray-400">Not enough data for a trend.</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sentimentData}>
                    <defs>
                      <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                        <stop offset={gradientOffset(sentimentData)} stopColor="#22c55e" stopOpacity={0.8}/>
                        <stop offset={gradientOffset(sentimentData)} stopColor="#ef4444" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis domain={[-1, 1]} stroke="#9ca3af" />
                    <Tooltip
                      wrapperClassName="!bg-gray-700 !border-none rounded-lg shadow-lg"
                      contentStyle={{ backgroundColor: 'transparent', border: 'none' }}
                      labelStyle={{ color: '#fff' }}
                      itemStyle={{ color: '#a78bfa' }}
                    />
                    <Legend />
                    <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
                    <Area type="monotone" dataKey="sentiment" stroke="#a78bfa" fill="url(#colorSentiment)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Mood Chart */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Your Moods</h2>
            <div style={{ width: '100%', height: 300 }}>
              {moodData.length === 0 ? <p className="text-gray-400">No mood data yet.</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moodData}>
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" allowDecimals={false} />
                    <Tooltip
                      wrapperClassName="!bg-gray-700 !border-none rounded-lg shadow-lg"
                      contentStyle={{ backgroundColor: 'transparent', border: 'none' }}
                      labelStyle={{ color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Keyword Cloud */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Your Top Keywords</h2>
            {keywordData.length === 0 ? <p className="text-gray-400">No keywords found yet.</p> : (
              <div className="flex flex-wrap gap-2">
                {keywordData.map(keyword => (
                  <button
                    key={keyword.name}
                    onClick={() => setSearchTerm(keyword.name)}
                    className="bg-gray-700 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-full transition duration-300"
                  >
                    {keyword.name} ({keyword.value})
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* --- Modals --- */}
      {isEditModalOpen && selectedEntry && ( /* Edit Modal */
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Edit Entry</h2>
            <form onSubmit={saveEdit}>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full h-64 p-4 bg-gray-700 border border-gray-600 rounded-lg text-white text-lg focus:outline-none focus:border-blue-500"
                disabled={isSaving}
              />
              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500"
                  disabled={isSaving}
                >
                  {isSaving ? 'Re-analyzing & Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isDeleteModalOpen && selectedEntry && ( /* Delete Modal */
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Are you sure?</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this entry? This action cannot be undone.
              <em className="block bg-gray-700 p-2 rounded mt-2 text-sm italic">"{selectedEntry.summary}"</em>
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- Gradient Offset Calculation (Needs to be defined) ---
const gradientOffset = (data) => {
  if (!data || data.length === 0) return 0.5;
  const dataMin = Math.min(...data.map(i => i.sentiment));
  const dataMax = Math.max(...data.map(i => i.sentiment));

  if (dataMax <= 0) return 0; // All negative
  if (dataMin >= 0) return 1; // All positive

  // Ensure denominator is not zero
  const range = dataMax - dataMin;
  if (range === 0) return 0.5; // If min and max are the same (e.g., all 0)

  return dataMax / range;
};


export default Dashboard;