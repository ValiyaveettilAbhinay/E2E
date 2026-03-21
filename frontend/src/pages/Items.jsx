import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";
import ItemCard from "../components/ItemCard"; // 1. Import the component we updated

export default function Items() {
  const [itemsData, setItemsData] = useState({ items: [], page: 1, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true); // 2. Add loading state
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

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

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line
  }, []);

  // Re-fetch when category changes so filters apply immediately
  useEffect(() => {
    // don't auto-fetch on initial render if you prefer; this runs after mount too but that's fine
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

      <div className="mb-6 flex gap-3 items-center">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') fetchItems(1); }}
          placeholder="Search by name or description"
          className="input flex-1 h-11"
        />

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="input w-40 h-11"
        >
          <option value="all">All Categories</option>
          <option value="Food">Food</option>
          <option value="Clothing">Clothing</option>
          <option value="Household">Household</option>
          <option value="Other">Other</option>
        </select>

        <button className="button h-11 flex items-center justify-center px-4" onClick={() => fetchItems(1)}>Search</button>
        <Link to="/recommend" className="button h-11 flex items-center justify-center px-4">Recommended</Link>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {itemsData.items.map(item => (
              <div key={item._id}>
                {/* Ensure the item name/title is visible in the list — ItemCard already shows it */}
                <ItemCard item={item} />
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