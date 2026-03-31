import React, { useState } from "react";
import axios from "../api/axios";
import { useAuth } from '../context/AuthContext';

export default function ItemCard({ item }) {
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(item.userRequestStatus);
  const [isFavorite, setIsFavorite] = useState(item.isFavorite);
  const [boosting, setBoosting] = useState(false);

  const { user } = useAuth();
  const ownerId = typeof item.owner === 'string' ? item.owner : item.owner?._id;
  const isOwner = user?.id === ownerId;

  const sendRequest = async () => {
    if (isOwner) return;

    try {
      setLoading(true);
      await axios.post("/requests/send", { itemId: item._id });
      setLocalStatus("pending");
      alert("Request sent successfully!");
    } catch (error) {
      const errorMsg = error.response?.data?.msg || "Failed to send request.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) return alert('Please login');
    try {
      if (!isFavorite) {
        await axios.post(`/items/favorite/${item._id}`);
        setIsFavorite(true);
      } else {
        await axios.delete(`/items/favorite/${item._id}`);
        setIsFavorite(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const boostItem = async () => {
    if (!isOwner) return alert('Only owner can boost');
    const cost = parseInt(prompt('Enter karma points to spend for boost (default 10):', '10')) || 10;
    const minutes = parseInt(prompt('Boost duration in minutes (default 60):', '60')) || 60;
    try {
      setBoosting(true);
      const res = await axios.post(`/items/boost/${item._id}`, { cost, minutes });
      alert('Boost applied until: ' + new Date(res.data.boostedUntil).toLocaleString());
    } catch (err) {
      alert(err.response?.data?.msg || 'Boost failed');
    } finally {
      setBoosting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all overflow-hidden border border-slate-200">
      <div className="relative">
        {item.image ? (
          <img src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} alt={item.title} className="h-48 w-full object-cover" />
        ) : (
          <div className="h-48 w-full bg-gradient-to-r from-slate-200 to-slate-100 flex items-center justify-center text-slate-400">No image</div>
        )}

        <div className="absolute top-3 right-3 flex gap-2">
          <button onClick={toggleFavorite} title={isFavorite ? 'Remove favorite' : 'Add favorite'} className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur flex items-center justify-center shadow-md hover:scale-105 transition-transform">
            <svg className={`w-5 h-5 ${isFavorite ? 'text-yellow-500' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.3l-6.16 3.9 1.64-7.03L2 9.24l7.19-.62L12 2l2.81 6.62L22 9.24l-5.48 4.93 1.64 7.03z"/></svg>
          </button>

          {user && user.id === (typeof item.owner === 'string' ? item.owner : item.owner?._id) && (
            <button onClick={boostItem} title="Boost with Karma" className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 2v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 8l-8 8-8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>

        <div className="absolute left-3 top-3 px-3 py-1 rounded-full bg-white/90 text-xs font-semibold text-indigo-700 shadow-sm">{item.category || 'General'}</div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{item.title || item.name}</h3>
            <p className="text-slate-500 text-sm line-clamp-2">{item.description}</p>
          </div>
          <div className="text-right">
            <div className={`text-xs font-semibold px-2 py-1 rounded-full ${item.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{item.status.toUpperCase()}</div>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <button onClick={toggleFavorite} className={`px-3 py-1 rounded text-sm font-medium ${isFavorite ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-700'}`}>
            {isFavorite ? '★ Favorited' : '☆ Favorite'}
          </button>

          {isOwner && (
            <div className="bg-slate-100 text-slate-500 text-center py-2 rounded-xl text-sm font-medium border border-dashed border-slate-300">
              You are the donor
            </div>
          )}
        </div>

        {/* --- LOGIC FOR BUTTON STATES --- */}
        {!isOwner && (localStatus === "pending" ? (
          <div className="bg-amber-50 text-amber-700 text-center py-3 rounded-xl text-sm font-bold border border-amber-200 flex items-center justify-center gap-2">
            <span className="animate-pulse">⏳</span> Pending Acceptance
          </div>
        ) : localStatus === "approved" ? (
          <div className="bg-emerald-100 text-emerald-800 text-center py-3 rounded-xl text-sm font-bold border border-emerald-200">
            ✅ Request Accepted
          </div>
        ) : (
          <button 
            onClick={sendRequest} 
            disabled={loading || item.status !== "available"}
            className={`w-full py-3 rounded-xl font-bold transition-all shadow-sm
              ${loading || item.status !== "available"
                ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
              }`}>
            {loading ? "Processing..." : "Claim Resource"}
          </button>
        ))}

        {isOwner && (
          <div className="mt-3">
            <button onClick={boostItem} disabled={boosting} className="w-full py-2 rounded-xl bg-amber-500 text-white font-semibold">{boosting ? 'Boosting...' : 'Boost with Karma'}</button>
          </div>
        )}
      </div>
    </div>
  );
}