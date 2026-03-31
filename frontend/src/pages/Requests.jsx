import { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function Requests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('incoming');
  const [processing, setProcessing] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [inc, out] = await Promise.all([
        axios.get('/requests/incoming'),
        axios.get('/requests/my')
      ]);
      setIncoming(Array.isArray(inc.data) ? inc.data : []);
      setOutgoing(Array.isArray(out.data) ? out.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const setProc = (id, val) => setProcessing(prev => ({ ...prev, [id]: val }));

  const accept = async (reqId, itemId) => {
    if (!confirm('Accept this request?')) return;
    setProc(reqId, true);
    try {
      await axios.post('/requests/accept', { requestId: reqId, itemId });
      // refresh lists so frontend matches backend state (other pending requests will be cleared)
      await load();
      alert('Request accepted');
    } catch (e) {
      console.error(e);
      alert('Accept failed');
    } finally {
      setProc(reqId, false);
    }
  };

  const reject = async (reqId) => {
    if (!confirm('Reject this request?')) return;
    setProc(reqId, true);
    try {
      await axios.post('/requests/reject', { requestId: reqId });
      // remove locally for snappy UI; also safe to reload
      setIncoming(prev => prev.filter(r => r._id !== reqId));
      alert('Request rejected');
    } catch (e) {
      console.error(e);
      alert('Reject failed');
    } finally {
      setProc(reqId, false);
    }
  };

  const renderDate = (d) => new Date(d).toLocaleString();

  const statusColor = (status) => {
    if (!status) return 'bg-slate-600 text-white';
    if (status.toLowerCase() === 'accepted') return 'bg-green-600 text-white';
    if (status.toLowerCase() === 'rejected') return 'bg-rose-600 text-white';
    if (status.toLowerCase() === 'pending') return 'bg-yellow-500 text-black';
    return 'bg-slate-600 text-white';
  };

  return (
    <div className="min-h-[80vh]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="page-title">Requests</h2>
        <div className="flex items-center gap-3">
          <button onClick={refresh} disabled={refreshing} title="Refresh" className={`w-9 h-9 rounded-full flex items-center justify-center ${refreshing ? 'bg-slate-700' : 'bg-slate-800/40'} hover:bg-slate-800 transition`}>
            <svg className={`w-4 h-4 text-slate-200 ${refreshing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none"><path d="M21 10v6h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 14v-6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 10a9 9 0 10-3.2 6.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading requests…</div>
      ) : (
        <div>
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button onClick={() => setActiveTab('incoming')} className={`px-4 py-2 rounded-md ${activeTab === 'incoming' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800'}`}>
              Incoming ({incoming.length})
            </button>
            <button onClick={() => setActiveTab('outgoing')} className={`px-4 py-2 rounded-md ${activeTab === 'outgoing' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800'}`}>
              Outgoing ({outgoing.length})
            </button>
          </div>

          <div>
            {activeTab === 'incoming' && (
              <div className="space-y-3">
                {incoming.length === 0 ? (
                  <div className="p-6 bg-slate-900/50 rounded-lg text-slate-400">No incoming requests</div>
                ) : (
                  incoming.map(r => (
                    <div key={r._id} className="p-4 bg-gradient-to-br from-slate-900/40 to-slate-900/20 border border-slate-700 rounded-lg flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-white">{(r.requester?.name || r.requester?.email || '?')[0]?.toUpperCase()}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{r.requester?.name || r.requester?.email}</div>
                            <div className="text-sm text-slate-400">For: <span className="font-semibold">{r.item?.title || r.item?.name}</span></div>
                          </div>
                          <div className="text-xs text-slate-500">{renderDate(r.createdAt)}</div>
                        </div>

                        <div className="mt-2 flex items-center gap-3">
                          <div className="text-sm text-slate-300">Pickup: <span className="font-medium text-slate-100">{r.item?.location || 'Not specified'}</span></div>
                          <div className="ml-auto flex items-center gap-2">
                            <button onClick={() => accept(r._id, r.item?._id)} disabled={!!processing[r._id]} className={`px-3 py-1 rounded-md ${processing[r._id] ? 'bg-green-400/60' : 'bg-green-600 hover:bg-green-500'} text-white`}> {processing[r._id] ? 'Processing…' : 'Accept'}</button>
                            <button onClick={() => reject(r._id)} disabled={!!processing[r._id]} className={`px-3 py-1 rounded-md ${processing[r._id] ? 'bg-rose-400/60' : 'bg-rose-600 hover:bg-rose-500'} text-white`}> {processing[r._id] ? 'Processing…' : 'Reject'}</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'outgoing' && (
              <div className="space-y-3">
                {outgoing.length === 0 ? (
                  <div className="p-6 bg-slate-900/50 rounded-lg text-slate-400">No outgoing requests</div>
                ) : (
                  outgoing.map(r => (
                    <div key={r._id} className="p-4 bg-gradient-to-br from-slate-900/40 to-slate-900/20 border border-slate-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{r.item?.title || r.item?.name}</div>
                          <div className="text-sm text-slate-400">Pickup: <span className="font-medium text-slate-100">{r.item?.location || 'Not specified'}</span></div>
                          <div className="text-xs text-slate-500 mt-1">Requested: {renderDate(r.createdAt)}</div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className={`px-3 py-1 rounded-full text-xs ${statusColor(r.status)}`}>{r.status}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
