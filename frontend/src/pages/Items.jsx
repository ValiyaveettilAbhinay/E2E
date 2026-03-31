import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

export default function Items() {
  const [itemsData, setItemsData] = useState({ items: [], page: 1, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const navigate = useNavigate();

  const fetchItems = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      if (q) params.append('q', q);
      if (category && category !== 'all') params.append('category', category);

      const res = await axios.get(`/items?${params.toString()}`);
      setItemsData(res.data);
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  // Quick search: if exactly one strong match, open details; otherwise display results
  const searchAndOpen = async () => {
    if (!q) return fetchItems(1);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('q', q);
      params.append('limit', 50);
      if (category && category !== 'all') params.append('category', category);
      const res = await axios.get(`/items?${params.toString()}`);
      const data = res.data.items || [];
      if (data.length === 1) {
        navigate(`/items/${data[0]._id}`);
        return;
      }
      // otherwise show filtered results in the list view
      setItemsData({ items: data, page: 1, total: data.length, pages: 1 });
    } catch (err) {
      console.error('Quick search failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchItems(1);
    // eslint-disable-next-line
  }, [category]);

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Available Resources</h2>
          <p className="text-slate-400 text-sm mt-1">Help your community by claiming only what you need.</p>
        </div>
        <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-300 transition-all font-medium">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') searchAndOpen(); }}
            placeholder="Search by name or description"
            className="w-full h-12 px-4 rounded-lg bg-slate-800 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
          />
          {q && (
            <button onClick={() => { setQ(''); fetchItems(1); }} title="Clear" className="h-10 w-10 rounded-md bg-slate-700 text-slate-200 hover:bg-slate-600 flex items-center justify-center">×</button>
          )}
        </div>

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="h-12 w-48 px-3 rounded-lg bg-slate-800 text-white"
        >
          <option value="all">All categories</option>
          <option value="Food">Food & Groceries</option>
          <option value="Clothing">Clothing & Accessories</option>
          <option value="Household">Household items</option>
          <option value="Other">Other / Misc</option>
        </select>

        <div className="flex gap-2">
          <button className="h-12 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500" onClick={() => fetchItems(1)}>Search</button>
          <button className="h-12 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-400" onClick={searchAndOpen}>Find</button>
          <Link to="/recommend" className="h-12 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center">Recommended</Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : itemsData.items.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-800">
          <p className="text-slate-400">No resources available at the moment.</p>
          <Link to="/post-item" className="text-indigo-400 underline mt-2 inline-block">Be the first to share!</Link>
        </div>
      ) : (
        <>
          {/* List view: show full description, donor, pickup location and acceptance/status */}
          <div className="space-y-6">
            {itemsData.items.map(item => (
              <div key={item._id} className="p-6 bg-gradient-to-br from-slate-900/40 to-slate-800/20 border border-slate-700 rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-100">{item.title || item.name}</h3>
                    <div className="mt-2 text-slate-300 whitespace-pre-wrap">{item.description || 'No description provided.'}</div>

                    <div className="mt-3 text-sm text-slate-400 flex gap-6">
                      <div>Donor: <span className="text-slate-100 font-semibold">{item.ownerName || (typeof item.owner === 'string' ? item.owner : (item.owner && (item.owner.name || item.owner.email))) || 'Anonymous'}</span></div>
                      <div>Pickup: <span className="text-slate-100 font-semibold">{item.location || 'Not specified'}</span></div>
                      <div>Quantity: <span className="text-slate-100 font-semibold">{item.quantity ?? 1}</span></div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${item.userRequestStatus ? (item.userRequestStatus.toLowerCase() === 'pending' ? 'bg-yellow-400 text-black' : item.userRequestStatus.toLowerCase() === 'approved' ? 'bg-green-600 text-white' : 'bg-slate-600 text-white') : (item.status === 'available' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white')}`}>
                      {(item.userRequestStatus || item.status || '').toUpperCase()}
                    </div>

                    <Link to={`/items/${item._id}`} className="text-indigo-300 text-sm font-medium hover:underline">View details</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: itemsData.pages }).map((_, i) => (
              <button key={i} className={`px-3 py-1 rounded ${itemsData.page === i+1 ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'}`} onClick={() => fetchItems(i+1)}>{i+1}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}