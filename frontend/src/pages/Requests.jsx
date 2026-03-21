import { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function Requests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const inc = await axios.get('/requests/incoming');
        const out = await axios.get('/requests/my');
        setIncoming(inc.data);
        setOutgoing(out.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const accept = async (reqId, itemId) => {
    if (!confirm('Accept this request?')) return;
    try {
      await axios.post('/requests/accept', { requestId: reqId, itemId });
      setIncoming(prev => prev.filter(r => r._id !== reqId));
      alert('Accepted');
    } catch (e) {
      alert('Accept failed');
    }
  };

  const reject = async (reqId) => {
    if (!confirm('Reject this request?')) return;
    try {
      await axios.post('/requests/reject', { requestId: reqId });
      setIncoming(prev => prev.filter(r => r._id !== reqId));
      alert('Rejected');
    } catch (e) {
      alert('Reject failed');
    }
  };

  return (
    <div className="min-h-[80vh]">
      <h2 className="page-title mb-4">Requests</h2>
      {loading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-4">
            <h3 className="font-bold mb-2">Incoming Requests</h3>
            {incoming.length === 0 ? <p className="text-slate-400">No incoming requests</p> : (
              incoming.map(r => (
                <div key={r._id} className="border-b py-2 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{r.requester.name || r.requester.email}</div>
                    <div className="text-sm text-slate-400">For: {r.item.title || r.item.name}</div>
                    <div className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => accept(r._id, r.item._id)} className="px-3 py-1 bg-green-600 text-white rounded">Accept</button>
                    <button onClick={() => reject(r._id)} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card p-4">
            <h3 className="font-bold mb-2">Outgoing Requests</h3>
            {outgoing.length === 0 ? <p className="text-slate-400">No outgoing requests</p> : (
              outgoing.map(r => (
                <div key={r._id} className="border-b py-2">
                  <div className="font-semibold">{r.item.title || r.item.name}</div>
                  <div className="text-xs text-slate-500">Status: {r.status}</div>
                  <div className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
