import { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function Requests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('incoming');
  const [processing, setProcessing] = useState({});
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [inc, out] = await Promise.all([
        axios.get('/requests/incoming'),
        axios.get('/requests/my')
      ]);
      setIncoming(Array.isArray(inc.data) ? inc.data : []);
      setOutgoing(Array.isArray(out.data) ? out.data : []);
      setSelected(null);
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

  // show contact information: prefer phone (and offer to call), fall back to email
  const showContact = async (email, phone) => {
    if (phone) {
      const doCall = confirm(`Phone: ${phone}\n\nClick OK to call, Cancel to copy.`);
      if (doCall) {
        window.location.href = `tel:${phone}`;
      } else {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          try {
            await navigator.clipboard.writeText(phone);
            alert('Phone copied to clipboard');
          } catch (e) {
            // fallback
            alert(`Phone: ${phone}`);
          }
        } else {
          alert(`Phone: ${phone}`);
        }
      }
      return;
    }
    if (email) {
      window.location.href = `mailto:${email}`;
      return;
    }
    alert('No contact information available');
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
          <div className="flex gap-2 mb-6">
            <button onClick={() => setActiveTab('incoming')} className={`px-4 py-2 rounded-md ${activeTab === 'incoming' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800'}`}>
              Incoming <span className="ml-2 inline-block bg-slate-900/50 px-2 py-0.5 rounded text-xs font-semibold">{incoming.length}</span>
            </button>
            <button onClick={() => setActiveTab('outgoing')} className={`px-4 py-2 rounded-md ${activeTab === 'outgoing' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800'}`}>
              Outgoing <span className="ml-2 inline-block bg-slate-900/50 px-2 py-0.5 rounded text-xs font-semibold">{outgoing.length}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              {/* List column */}
              {activeTab === 'incoming' && (
                <div className="space-y-3">
                  {incoming.length === 0 ? (
                    <div className="p-6 bg-slate-900/50 rounded-lg text-slate-400">No incoming requests</div>
                  ) : (
                    incoming.map(r => (
                      <div key={r._id} onClick={() => setSelected(r)} className={`p-3 cursor-pointer rounded-lg border ${selected?._id === r._id ? 'border-indigo-500 bg-slate-900/20' : 'border-slate-700 bg-slate-900/10'} flex items-start gap-3`}>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">{(r.requester?.name || r.requester?.email || '?')[0]?.toUpperCase()}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-slate-100">{r.requester?.name || r.requester?.email}</div>
                              <div className="text-sm text-slate-400">For: <span className="font-semibold text-slate-100">{r.item?.title || r.item?.name}</span></div>
                            </div>
                            <div className="text-xs text-slate-500 text-right">
                              <div>{renderDate(r.createdAt)}</div>
                              <div className="mt-2"><span className={`px-2 py-0.5 rounded-full text-xs ${statusColor(r.status)}`}>{(r.status || 'PENDING').toUpperCase()}</span></div>
                            </div>
                          </div>

                          {r.message && <div className="mt-2 text-sm text-slate-300 truncate">"{r.message}"</div>}
                        </div>
                        <div className="text-xs">
                          <button onClick={(e) => { e.stopPropagation(); showContact(r.requester?.email, r.requester?.phone); }} className="text-xs text-indigo-300 hover:underline ml-2">Contact</button>
                          {/* show donor phone when available (incoming list shows owner contact) */}
                          {r.item?.ownerPhone ? (
                            <a onClick={(e) => e.stopPropagation()} href={`tel:${r.item.ownerPhone}`} className="text-xs text-indigo-300 hover:underline ml-2">Call donor</a>
                          ) : (
                            <span className="text-xs text-slate-500 ml-2">Phone not provided</span>
                          )}
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
                      <div key={r._id} onClick={() => setSelected(r)} className={`p-3 cursor-pointer rounded-lg border ${selected?._id === r._id ? 'border-indigo-500 bg-slate-900/20' : 'border-slate-700 bg-slate-900/10'} flex items-center gap-3`}>
                        <div className="flex-shrink-0 w-12 h-12 bg-slate-800 rounded-md overflow-hidden">
                          {r.item?.image ? <img src={r.item.image} alt="item" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400">📦</div>}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-100">{r.item?.title || r.item?.name}</div>
                          <div className="text-sm text-slate-400">Pickup: <span className="font-medium text-slate-100">{r.item?.location || 'Not specified'}</span></div>
                          <div className="text-xs text-slate-500">Requested: {renderDate(r.createdAt)}</div>
                        </div>
                        <div className="text-xs"><span className={`px-2 py-0.5 rounded-full text-xs ${statusColor(r.status)}`}>{(r.status || 'PENDING').toUpperCase()}</span></div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              {/* Detail column */}
              {selected ? (
                <div className="p-6 bg-gradient-to-br from-slate-900/30 to-slate-900/10 border border-slate-700 rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">{(selected.requester?.name || selected.requester?.email || '?')[0]?.toUpperCase()}</div>
                      <div>
                        <div className="text-xl font-bold text-slate-100">{selected.requester?.name || selected.requester?.email}</div>
                        <div className="text-sm text-slate-400">Requested: {renderDate(selected.createdAt)}</div>
                        <div className="text-sm text-slate-400">For item: <span className="font-semibold text-slate-100">{selected.item?.title || selected.item?.name}</span></div>
                      </div>
                    </div>
                    <div>
                      <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">Close</button>
                    </div>
                  </div>

                  {selected.message && <div className="mt-4 text-slate-300">Message: "{selected.message}"</div>}

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-900 rounded">
                      <div className="font-semibold text-slate-100">Pickup location</div>
                      <div className="text-slate-300 mt-1">{selected.item?.location || 'Not specified'}</div>
                      <div className="text-xs text-slate-400 mt-3">Qty requested: {selected.quantity || 1}</div>
                    </div>

                    <div className="p-4 bg-slate-900 rounded flex flex-col justify-between">
                      <div>
                        <div className="font-semibold text-slate-100">Status</div>
                        <div className="mt-2"><span className={`px-3 py-1 rounded-full ${statusColor(selected.status)}`}>{(selected.status || 'PENDING').toUpperCase()}</span></div>
                      </div>
                      <div className="mt-4 flex gap-2 justify-end">
                        {activeTab === 'incoming' && selected.status?.toLowerCase() === 'pending' && (
                          <>
                            <button onClick={() => accept(selected._id, selected.item?._id)} disabled={!!processing[selected._id]} className={`px-4 py-2 rounded-md ${processing[selected._id] ? 'bg-green-400/60' : 'bg-green-600 hover:bg-green-500'} text-white`}>{processing[selected._id] ? 'Processing…' : 'Accept'}</button>
                            <button onClick={() => reject(selected._id)} disabled={!!processing[selected._id]} className={`px-4 py-2 rounded-md ${processing[selected._id] ? 'bg-rose-400/60' : 'bg-rose-600 hover:bg-rose-500'} text-white`}>{processing[selected._id] ? 'Processing…' : 'Reject'}</button>
                          </>
                        )}

                        {activeTab === 'incoming' ? (
                          <button onClick={() => showContact(selected.requester?.email, selected.requester?.phone)} className="px-4 py-2 rounded-md bg-slate-800 text-indigo-300 hover:bg-slate-700">Contact</button>
                        ) : (
                          <button onClick={() => showContact(null, selected.item?.contactPhone || selected.item?.ownerPhone)} className="px-4 py-2 rounded-md bg-slate-800 text-indigo-300 hover:bg-slate-700">Contact</button>
                        )}

                        {/* show phone or reveal actions: prefer direct ownerPhone, else masked, else request reveal */}
                        {selected.item?.ownerPhone ? (
                          <a href={`tel:${selected.item.ownerPhone}`} className="px-4 py-2 rounded-md bg-slate-800 text-indigo-300 hover:bg-slate-700">Call donor</a>
                        ) : selected.item?.maskedPhone ? (
                          <button className="px-4 py-2 rounded-md bg-slate-800 text-indigo-300 hover:bg-slate-700">Phone: {selected.item.maskedPhone}</button>
                        ) : (
                          <button onClick={async () => {
                            if (!confirm('Request owner to reveal their phone?')) return;
                            try {
                              await axios.post('/requests/request-reveal', { requestId: selected._id });
                              alert('Reveal requested');
                              await load();
                            } catch (e) {
                              console.error(e);
                              alert('Failed to request reveal');
                            }
                          }} className="px-4 py-2 rounded-md bg-slate-800 text-indigo-300 hover:bg-slate-700">Request phone</button>
                        )}

                        {/* If owner (incoming tab) sees a revealRequested flag, show approve button */}
                        {activeTab === 'incoming' && selected.revealRequested && !selected.revealApproved && (
                          <button onClick={async () => {
                            if (!confirm('Approve reveal of your phone to this requester?')) return;
                            try {
                              await axios.post('/requests/approve-reveal', { requestId: selected._id });
                              alert('Reveal approved');
                              await load();
                            } catch (e) {
                              console.error(e);
                              alert('Failed to approve reveal');
                            }
                          }} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500">Approve reveal</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-900/50 rounded-lg text-slate-400">Select a request to view details</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
