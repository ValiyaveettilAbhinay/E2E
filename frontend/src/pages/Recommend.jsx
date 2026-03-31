import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from 'react-router-dom';

export default function Recommended() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const search = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (name) params.append('q', name);
      params.append('limit', 50);
      const res = await axios.get(`/items?${params.toString()}`);
      let data = res.data.items || [];
      if (location) {
        const locLower = location.toLowerCase().trim();
        data = data.filter(i => (i.location || '').toLowerCase().includes(locLower));
      }
      setItems(data);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { search(); }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="page-title text-indigo-400">Smart Picks</h2>
      <p className="text-slate-400 mb-4">Search for an item and optionally a pickup location.</p>

      <div className="mb-4 space-y-3">
        <div>
          <label className="text-sm text-slate-300">Item name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') search(); }}
            placeholder="e.g., rice, bread, jacket"
            className="input w-full mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-slate-300">Pickup location</label>
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') search(); }}
            placeholder="City, neighborhood or area"
            className="input w-full mt-1"
          />
        </div>

        <div>
          <button onClick={search} className="button w-full py-3">Search</button>
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-8">Loading…</div>
      ) : (
        <div className="space-y-4">
          {items.length > 0 ? (
            items.map(i => (
              <div key={i._id} className="card flex items-center justify-between border-l-4 border-l-indigo-500 p-4 gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold truncate">{i.title || i.name || '(no title)'}</h3>
                  <p className="text-sm text-slate-500 truncate">{i.location ? `${i.location} • ${i.title || i.name}` : `${i.title || i.name}`}</p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => navigate(`/items/${i._id}`)} className="ml-4 py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-500 whitespace-nowrap">View Details →</button>
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center py-10 text-slate-500">No items found. Try a different combination.</div>
          )}
        </div>
      )}
    </div>
  );
}