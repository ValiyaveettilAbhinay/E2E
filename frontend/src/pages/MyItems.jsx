import { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function MyItems() {
  const [data, setData] = useState({ donated: [], received: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/user/my-items');
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="page-title mb-4">My Items</h2>

      {loading ? (
        <div className="text-slate-400">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <section>
            <h3 className="text-lg font-semibold mb-3">Donated items</h3>
            {data.donated.length === 0 ? (
              <div className="text-slate-400">You haven't donated any items yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.donated.map(it => (
                  <div key={it._id} className="p-3 bg-slate-800 rounded-lg flex gap-3">
                    <div className="w-20 h-20 bg-slate-700 rounded-md overflow-hidden flex items-center justify-center">{it.image ? <img src={it.image} alt="item" className="w-full h-full object-cover" /> : '📦'}</div>
                    <div>
                      <div className="font-semibold text-slate-100">{it.title}</div>
                      <div className="text-sm text-slate-400">{it.location || 'No location'}</div>
                      <div className="text-xs text-slate-400 mt-1">Status: {it.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">Received items</h3>
            {data.received.length === 0 ? (
              <div className="text-slate-400">You haven't received any items yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.received.map(it => (
                  <div key={it._id} className="p-3 bg-slate-800 rounded-lg flex gap-3">
                    <div className="w-20 h-20 bg-slate-700 rounded-md overflow-hidden flex items-center justify-center">{it.image ? <img src={it.image} alt="item" className="w-full h-full object-cover" /> : '📦'}</div>
                    <div>
                      <div className="font-semibold text-slate-100">{it.title}</div>
                      <div className="text-sm text-slate-400">From: {it.ownerName || 'Unknown'}</div>
                      <div className="text-xs text-slate-400 mt-1">Status: {it.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
