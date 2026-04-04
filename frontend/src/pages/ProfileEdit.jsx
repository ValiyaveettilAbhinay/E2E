import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ProfileEdit() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [location, setLocation] = useState(user?.location || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setLocation(user?.location || '');
    setPhone(user?.phone || '');
  }, [user]);

  const save = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.put('/auth/me', { name, location, phone });
      // no need to update token; reload user by navigating to profile
      navigate('/profile');
    } catch (e) {
      setError(e.response?.data?.msg || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        {error && <div className="text-red-400 mb-3">{error}</div>}
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400">Full name</label>
            <input className="input" value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-400">Location</label>
            <input className="input" value={location} onChange={e=>setLocation(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-400">Phone</label>
            <input className="input" value={phone} onChange={e=>setPhone(e.target.value)} />
          </div>

          <div className="flex gap-2 mt-4">
            <button className="button" onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            <button className="w-full text-slate-400 text-sm hover:text-white" onClick={() => navigate('/profile')}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
