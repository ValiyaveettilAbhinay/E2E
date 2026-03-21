import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function AddItem() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState('Food');
  const navigate = useNavigate();
  
  const categories = ['Food', 'Tool', 'Clothing', 'Household', 'Other'];

  const submit = async () => {
    try {
      await axios.post("/items", { name, location, category });
      alert("Item added successfully!");
      navigate("/items"); // Redirect to the list after adding
    } catch (err) {
      console.error("Error adding item", err);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="card w-full max-w-lg">
        <h2 className="page-title text-center">Share a Resource</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Item Name</label>
            <input
              placeholder="e.g., Fresh Bread or Rice Bags"
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="input">
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Pickup Location</label>
            <input
              placeholder="e.g., Downtown Community Center"
              className="input"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>

          <button className="button mt-2 shadow-lg shadow-indigo-500/20" onClick={submit}>
            Post Item
          </button>
          
          <button 
            className="w-full text-slate-400 text-sm hover:text-white transition"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}