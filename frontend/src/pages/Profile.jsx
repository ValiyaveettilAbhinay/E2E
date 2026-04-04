import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return <div className="p-6">Please login to view your profile.</div>;

  const sharedCount = user.sharedCount || ((user.sharedFoodCount || 0) + (user.sharedToolCount || 0)) || 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="glass-card p-6 md:flex md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-3xl font-extrabold text-white shadow-lg">
            {(user.name || '?').slice(0,1).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold leading-tight">{user.name}</h2>
            <div className="text-sm text-slate-300">{user.email}</div>
            <div className="mt-2 text-sm text-slate-400">{user.location || 'Location not set'}</div>
            <div className="mt-1 text-sm">
              {user.phone ? (
                <a href={`tel:${user.phone}`} className="text-indigo-300 hover:underline">{user.phone}</a>
              ) : (
                <span className="text-slate-500">Phone not provided</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <Link to="/profile/edit" className="inline-flex items-center gap-2 px-4 py-2 min-h-[42px] rounded-md bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-0.5 whitespace-nowrap">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M16.5 3.5a2.1 2.1 0 113 3L8 19l-4 1 1-4 11.5-12.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="font-medium">Edit Profile</span>
          </Link>

          <Link to="/add-item" className="inline-flex items-center gap-2 px-4 py-2 min-h-[42px] rounded-md bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-sm hover:shadow-lg transition-transform transform hover:-translate-y-0.5 whitespace-nowrap">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="font-medium">Add Item</span>
          </Link>

          <button onClick={logout} className="inline-flex items-center gap-2 px-4 py-2 min-h-[42px] rounded-md bg-rose-600 hover:bg-rose-500 text-white shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-0.5 whitespace-nowrap">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 rounded-lg">
          <div className="text-xs text-slate-400 uppercase">Karma Points</div>
          <div className="text-2xl font-bold mt-1">{user.karmaPoints || 0}</div>
          <div className="text-sm text-slate-400 mt-2">Points earned by sharing resources</div>
        </div>

        <div className="p-4 bg-slate-900 rounded-lg">
          <div className="text-xs text-slate-400 uppercase">This month</div>
          <div className="text-2xl font-bold mt-1">{user.monthlyPoints || 0}</div>
          <div className="text-sm text-slate-400 mt-2">Points earned this month</div>
        </div>

        <div className="p-4 bg-slate-900 rounded-lg">
          <div className="text-xs text-slate-400 uppercase">Shared</div>
          <div className="text-2xl font-bold mt-1">{sharedCount}</div>
          <div className="text-sm text-slate-400 mt-2">Total posts merged from your contributions</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-900 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">Badges</div>
            <div className="text-xs text-slate-500">{(user.badges || []).length} earned</div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(user.badges || []).length === 0 ? (
              <div className="text-sm text-slate-500">No badges yet — share items to earn badges.</div>
            ) : (
              (user.badges || []).map(b => (
                <span key={b} className="px-3 py-1 rounded-full bg-indigo-600/90 text-white text-sm shadow-sm">{b}</span>
              ))
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-900 rounded-lg">
          <div className="text-sm text-slate-400">Contact & Settings</div>
          <div className="mt-3">
            <div className="text-sm text-slate-200">Email</div>
            <div className="text-sm text-slate-400">{user.email}</div>
          </div>
          <div className="mt-3">
            <div className="text-sm text-slate-200">Phone</div>
            <div className="text-sm text-slate-400">
              {user.phone ? (
                <a className="text-indigo-300 hover:underline" href={`tel:${user.phone}`}>{user.phone}</a>
              ) : (
                <span className="text-slate-500">Not provided</span>
              )}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Link to="/profile/edit" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-0.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M16.5 3.5a2.1 2.1 0 113 3L8 19l-4 1 1-4 11.5-12.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-sm">Update</span>
            </Link>
            <Link to="/my-items" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 shadow-sm">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-sm">My Items</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-900 rounded-lg">
        <div className="text-sm text-slate-400">Activity</div>
        <div className="mt-3 text-sm text-slate-300">Recent activity will appear here — requests, accepts and shares.</div>
      </div>
    </div>
  );
}
