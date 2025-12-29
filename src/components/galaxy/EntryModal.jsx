import React, { useState } from 'react';
import { doc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../../firebase';
import { rateLimitedFetch, debounce } from '../../utils/apiCache'; 

const EntryModal = ({ entry, onClose, user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [reflection, setReflection] = useState(null);
    const [reflectLoading, setReflectLoading] = useState(false);

    const handleDeleteEntry = async () => {
        if (window.confirm("Are you sure?")) {
            try {
                await deleteDoc(doc(db, 'users', user.uid, 'entries', entry.id));
                onClose();
            } catch (err) { alert("Error: " + err.message); }
        }
    };

    const handleStartEdit = () => { setEditContent(entry.content); setIsEditing(true); };

    const handleSaveEdit = async () => {
        if (!editContent.trim()) return;
        setIsSavingEdit(true);
        try {
            const data = await rateLimitedFetch('/api/processEntry', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: editContent }),
            });
            const aiJson = JSON.parse(data.reply);
            const entryRef = doc(db, 'users', user.uid, 'entries', entry.id);
            await updateDoc(entryRef, {
                content: editContent, summary: aiJson.summary, emotion: aiJson.emotion,
                keywords: aiJson.keywords, sentiment: aiJson.sentiment_score, updatedAt: serverTimestamp()
            });
            onClose(); // Close to refresh or you'd need to update local state too
        } catch (err) { alert("Failed to update memory."); }
        setIsSavingEdit(false);
    };

    const handleReflect = async () => {
        setReflectLoading(true);
        try {
            const data = await rateLimitedFetch('/api/getReflection', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entryText: entry.content }),
            });
            setReflection(data.question);
        } catch (err) { setReflection("Connection error."); }
        setReflectLoading(false);
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900/95 border border-blue-500/30 rounded-2xl p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto glass-scroll">
                <div className="absolute top-4 right-4 flex gap-3">
                    {!isEditing && (
                        <>
                            <button onClick={handleStartEdit} className="text-blue-400 hover:text-white text-sm uppercase border border-blue-500/30 px-3 py-1 rounded hover:bg-blue-900/50">Edit</button>
                            <button onClick={handleDeleteEntry} className="text-red-400 hover:text-white text-sm uppercase border border-red-500/30 px-3 py-1 rounded hover:bg-red-900/50">Delete</button>
                        </>
                    )}
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-xl pl-4">✕</button>
                </div>
                <div className="mb-6 pr-32">
                    <h2 className="text-3xl font-bold text-white">{new Date(entry.createdAt?.toDate()).toLocaleDateString()}</h2>
                    <span className="inline-block mt-2 bg-pink-500/10 text-pink-300 border border-pink-500/30 px-3 py-1 rounded-full text-sm uppercase tracking-wider">{entry.emotion || "Unknown"}</span>
                </div>
                {isEditing ? (
                    <div className="flex flex-col gap-4">
                        <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full h-64 p-4 bg-black/30 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-400" />
                        <div className="flex justify-end gap-3"><button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button><button onClick={handleSaveEdit} disabled={isSavingEdit} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold">{isSavingEdit ? "Saving..." : "Save Changes"}</button></div>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 p-4 bg-blue-900/10 border-l-4 border-blue-500 rounded-r-lg"><p className="text-blue-200 italic font-light">"{entry.summary}"</p></div>
                        <div className="mb-8 text-gray-200 leading-relaxed text-lg font-light">{entry.content}</div>
                        <div className="border-t border-gray-800 pt-6">
                            {!reflection ? (
                                <button onClick={handleReflect} disabled={reflectLoading} className="w-full py-4 rounded-xl border border-purple-500/30 bg-purple-900/10 text-purple-300 hover:bg-purple-900/30 transition-all font-mono text-sm uppercase tracking-[0.2em]">{reflectLoading ? "Connecting..." : "✨ Request Cosmic Reflection"}</button>
                            ) : (
                                <div className="bg-purple-950/40 border border-purple-500/40 p-6 rounded-xl shadow-inner"><p className="text-xs text-purple-400 uppercase tracking-widest mb-3">Cosmic Insight:</p><p className="text-purple-100 font-serif text-xl italic">{reflection}</p></div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EntryModal;