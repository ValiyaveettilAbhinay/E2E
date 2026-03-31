import { Link, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const [incomingCount, setIncomingCount] = useState(0);
  const [outgoingCount, setOutgoingCount] = useState(0);
  const [incomingPreview, setIncomingPreview] = useState([]);
  const [outgoingPreview, setOutgoingPreview] = useState([]);
  const [loadingReq, setLoadingReq] = useState(false);
  const { user, logout } = useAuth();

  const linkClass = path =>
    `block px-3 py-2 rounded-lg transition-colors duration-200 ease-in-out text-sm font-medium ${
      pathname === path
        ? 'bg-indigo-600 text-white shadow-md'
        : 'text-slate-300 hover:text-white hover:bg-slate-800'
    }`;

  const loadRequests = async () => {
    setLoadingReq(true);
    try {
      const [incRes, outRes] = await Promise.all([
        axios.get('/requests/incoming'),
        axios.get('/requests/my')
      ]);

      const inc = Array.isArray(incRes.data) ? incRes.data : [];
      const out = Array.isArray(outRes.data) ? outRes.data : [];

      setIncomingCount(inc.length);
      setOutgoingCount(out.length);
      setIncomingPreview(inc.slice(0,3));
      setOutgoingPreview(out.slice(0,3));
    } catch (e) {
      console.error('Failed to load requests', e);
    } finally {
      setLoadingReq(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // optionally poll every 30s
    const id = setInterval(loadRequests, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">

      {/* Sidebar */}
      <aside className="w-72 p-6 flex flex-col bg-gradient-to-b from-[#0f1724] to-[#0b1220] shadow-xl border-r border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15 8H9L12 2Z" fill="white" opacity="0.95"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-extrabold leading-tight">Food and Resource Sharing</h1>
            <div className="text-sm text-slate-200 mt-1">{user ? `Hello, ${user.name}` : 'Welcome'}</div>
            <div className="text-xs text-slate-400">Share · Reuse · Rediscover</div>
          </div>
        </div>

        <nav className="space-y-2 mb-4">
          <Link className={linkClass("/dashboard")} to="/dashboard">Dashboard</Link>
          <Link className={linkClass("/items")} to="/items">Items</Link>
          <Link className={linkClass("/add-item")} to="/add-item">Add Item</Link>
          <Link className={linkClass("/recommend")} to="/recommend">Recommended</Link>
        </nav>

        {/* Requests box with counts and small preview */}
        <div className="p-4 rounded-xl bg-gradient-to-tr from-slate-800/60 to-slate-900/40 backdrop-blur border border-slate-700 shadow-inner transform transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-indigo-400 to-pink-500 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none"><path d="M20 2H4a2 2 0 00-2 2v14l4-2 4 2 4-2 4 2V4a2 2 0 00-2-2z" fill="currentColor"/></svg>
              </div>
              <div>
                <div className="text-sm text-slate-200 font-semibold">Requests</div>
                <div className="text-xs text-slate-400">Incoming • Outgoing</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button onClick={loadRequests} title="Refresh requests" aria-label="Refresh requests" className={`w-10 h-10 rounded-full flex items-center justify-center ${loadingReq ? 'bg-slate-700' : 'bg-slate-800/40'} hover:bg-slate-800 transform hover:scale-105 transition ring-offset-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}>
                  {/* improved circular refresh icon */}
                  <svg className={`w-5 h-5 text-slate-200 ${loadingReq ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M21 12a9 9 0 10-2.64 6.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 3v6h-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {incomingCount > 0 && !loadingReq && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-rose-500 text-white shadow">{incomingCount}</span>
                )}
              </div>
              <Link to="/requests" className="text-indigo-300 text-sm font-semibold">Manage</Link>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700 flex flex-col items-start gap-1">
              <div className="text-slate-400 text-xs">Incoming</div>
              <div className="text-white font-bold text-lg flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 shadow-sm animate-pulse">{loadingReq ? '…' : incomingCount}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700 flex flex-col items-start gap-1">
              <div className="text-slate-400 text-xs">Outgoing</div>
              <div className="text-white font-bold text-lg flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-sm">{loadingReq ? '…' : outgoingCount}</span>
              </div>
            </div>
          </div>

          {/* Compact footer instead of detailed previews */}
          <div className="mt-4 text-xs text-slate-400">
            <div className="flex items-center justify-between">
              <div>Quick overview — open Manage for details</div>
              <Link to="/requests" className="text-indigo-300 text-sm font-semibold">Open</Link>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
          }}
          className="mt-auto text-left text-rose-400 hover:text-rose-300 flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Logout
        </button>
      </aside>

      {/* Page Content */}
      <main className="flex-1 p-8 max-w-7xl mx-auto">
        {children}
      </main>

      {/* Floating mobile Requests button (visible on small screens only) */}
      <Link to="/requests" className="fixed bottom-6 right-6 md:hidden bg-indigo-600 text-white p-3 rounded-full shadow-lg flex items-center gap-2">
        <span className="text-lg">💬</span>
      </Link>
    </div>
  );
}
