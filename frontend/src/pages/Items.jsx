import { useEffect, useState, useMemo } from "react";
import axios from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

export default function Items() {
  const [itemsData, setItemsData] = useState({ items: [], page: 1, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const navigate = useNavigate();
  const [expandedGroups, setExpandedGroups] = useState({});

  // Group similar items (by normalized name + location + category) so duplicates from different donors can be managed together
  const groupedItems = useMemo(() => {
    const map = new Map();
    (itemsData.items || []).forEach(item => {
      // Prefer server-provided groupKey when available for robust grouping, otherwise compute locally
      const key = item.groupKey || (() => {
        const name = (item.title || item.name || "").toLowerCase().replace(/[^\w\s]/g, "").trim();
        const loc = (item.location || "").toLowerCase().trim();
        const cat = (item.category || "").toLowerCase().trim();
        return `${name}||${loc}||${cat}`;
      })();
      const arr = map.get(key) || [];
      arr.push(item);
      map.set(key, arr);
    });

    return Array.from(map.entries()).map(([key, items]) => {
      const totalQty = items.reduce((s, it) => s + (Number(it.quantity) || 1), 0);
      const donors = Array.from(new Set(items.map(it => it.ownerName || (typeof it.owner === 'string' ? it.owner : (it.owner && it.owner.name)) || 'Anonymous')));
      const sample = items[0] || {};
      return {
        key,
        title: sample.title || sample.name || 'Untitled',
        location: sample.location || 'Not specified',
        category: sample.category || 'Other',
        totalQty,
        donors,
        items
      };
    });
  }, [itemsData.items]);

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
            {groupedItems.map(group => (
              <div key={group.key} className="p-6 bg-gradient-to-br from-slate-900/40 to-slate-800/20 border border-slate-700 rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-100">{group.title}</h3>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {group.donors.slice(0,3).map((d, i) => (
                          <div key={i} title={d} className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-white border-2 border-slate-800">{(d || 'A')[0].toUpperCase()}</div>
                        ))}
                        {group.donors.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-semibold text-white border-2 border-slate-800">+{group.donors.length - 3}</div>
                        )}
                      </div>
                      <div className="text-slate-300">Category: <span className="text-slate-100 font-semibold">{group.category}</span></div>
                    </div>

                    <div className="mt-3 text-slate-300 whitespace-pre-wrap">{group.items[0]?.description || 'No description provided.'}</div>

                    <div className="mt-3 text-sm text-slate-400 flex gap-6 items-center">
                      <div>Donors: <span className="text-slate-100 font-semibold">{group.donors.length}</span></div>
                      <div>Total Qty: <span className="text-slate-100 font-semibold">{group.totalQty}</span></div>
                      <div>Pickup: <span className="text-slate-100 font-semibold">{group.location}</span></div>
                    </div>
                    {/* show first few donor names for clarity */}
                    <div className="mt-2 text-xs text-slate-400">
                      {group.donors.slice(0,5).map((d, idx) => (
                        <span key={idx} className="inline-block mr-2 px-2 py-0.5 bg-slate-800 rounded">{d}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="text-xs text-slate-400">Posts</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setExpandedGroups(prev => ({ ...prev, [group.key]: !prev[group.key] }))} className="px-3 py-1 rounded bg-slate-700 text-sm text-slate-200">{expandedGroups[group.key] ? 'Hide posts' : `View ${group.items.length} posts`}</button>
                      <Link to={`/items/${group.items[0]._id}`} className="text-indigo-300 text-sm font-medium hover:underline">View details</Link>
                    </div>
                  </div>
                </div>

                {expandedGroups[group.key] && (
                  <div className="mt-4 space-y-3 border-t border-slate-800 pt-4">
                    {group.items.map(item => (
                      <div key={item._id} className="flex items-center justify-between p-3 bg-slate-900/30 rounded">
                        <div className="text-sm text-slate-300">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-700 flex items-center justify-center text-sm font-semibold text-white">{((item.ownerName || (item.owner && item.owner.name) || 'A')[0] || '?').toUpperCase()}</div>
                            <div>
                              <div className="text-slate-100 font-semibold">{item.ownerName || (item.owner && item.owner.name) || 'Anonymous'}</div>
                              <div className="text-xs text-slate-400">{item.owner && item.owner.email ? <a className="underline text-slate-300" href={`mailto:${item.owner.email}`}>{item.owner.email}</a> : 'No contact'}</div>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-slate-400">Qty: {item.quantity ?? 1} · Pickup: {item.location || 'N/A'} · Status: {(item.userRequestStatus || item.status || '').toUpperCase()}</div>
                          <div className="text-xs text-slate-400">Posted: {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}</div>
                        </div>
                        <div>
                          <Link to={`/items/${item._id}`} className="text-indigo-300 text-sm font-medium hover:underline">Open</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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