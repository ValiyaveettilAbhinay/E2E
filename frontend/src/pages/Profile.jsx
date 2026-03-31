import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return <div className="p-6">Please login to view your profile.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-700">{(user.name || '?')[0]}</div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <div className="text-slate-400">{user.email}</div>
            <div className="mt-2 text-sm text-slate-500">Location: {user.location || '—'}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-800 rounded-lg">
            <div className="text-xs text-slate-400">Karma Points</div>
            <div className="text-2xl font-bold">{user.karmaPoints || 0}</div>
          </div>

          <div className="p-4 bg-slate-800 rounded-lg">
            <div className="text-xs text-slate-400">Badges</div>
            <div className="flex gap-2 mt-2">{(user.badges || []).map(b => <span key={b} className="px-2 py-1 bg-indigo-600 rounded text-xs">{b}</span>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
