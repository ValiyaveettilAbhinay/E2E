import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/axios';

export default function ItemDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/items/${id}`);
        setItem(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const sendRequest = async () => {
    if (!item) return;
    if (confirm('Send a request for this item?')) {
      try {
        setSending(true);
        await axios.post('/requests/send', { itemId: item._id });
        alert('Request sent');
      } catch (e) {
        alert(e.response?.data?.msg || 'Failed to send request');
      } finally {
        setSending(false);
      }
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (!item) return <div className="p-6">Item not found.</div>;

  // prefer backend-provided ownerName (robust), fallback to populated owner object or id
  const ownerName = item.ownerName || (item.owner && typeof item.owner === 'object' ? (item.owner.name || item.owner.email) : (item.owner || 'Anonymous'));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{item.title || item.name}</h1>
          <div className="text-sm text-slate-400">by <span className="font-semibold text-white">{ownerName}</span></div>
        </div>
        <Link to="/items" className="text-indigo-300">← Back to list</Link>
      </div>

      <div className="bg-slate-900 p-6 rounded-lg">
        <div className="text-slate-300 whitespace-pre-wrap">{item.description || 'No description provided.'}</div>
        <div className="mt-4 text-sm text-slate-400 flex gap-6">
          <div>Pickup: <span className="text-white font-semibold">{item.location || 'Not specified'}</span></div>
          <div>Quantity: <span className="text-white font-semibold">{item.quantity ?? 1}</span></div>
          <div>Acceptance: <span className="text-white font-semibold">{(item.userRequestStatus || item.status || '').toUpperCase()}</span></div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={sendRequest} disabled={sending || item.status !== 'available'} className={`px-4 py-2 rounded ${sending ? 'bg-gray-500' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}>{sending ? 'Sending…' : 'Request this item'}</button>
        </div>
      </div>
    </div>
  );
}
