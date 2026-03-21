import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function Recommended() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get("/items/recommend")
      .then(res => {
        const data = res.data.items || res.data || [];
        setItems(data);
      })
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="page-title text-indigo-400">Recommended for You</h2>
      <p className="text-slate-400 mb-8">Based on your location and past activity.</p>
      
      <div className="space-y-4">
        {items.length > 0 ? (
          items.map(i => (
            <div key={i._id} className="card flex items-center justify-between border-l-4 border-l-indigo-500 p-4 gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate">{i.title || i.name || '(no title)'}</h3>
                <p className="text-sm text-slate-500 truncate">{i.location ? `${i.location} • ${i.title || i.name}` : `${i.title || i.name}`}</p>
              </div>

              <button className="ml-4 py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-500 whitespace-nowrap">View Details →</button>
            </div>
          ))
        ) : (
          <div className="card text-center py-10 text-slate-500">
            No recommendations found yet. Start exploring!
          </div>
        )}
      </div>
    </div>
  );
}