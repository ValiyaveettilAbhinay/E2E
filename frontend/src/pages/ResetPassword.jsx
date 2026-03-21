import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from '../api/axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setEmail(emailParam);
  }, [emailParam]);

  const submit = async (e) => {
    if (e) e.preventDefault();
    setStatus('');
    if (!token || !email) return setStatus('Invalid reset link');
    if (!password || password.length < 6) return setStatus('Password must be at least 6 characters');
    if (password !== confirm) return setStatus('Passwords do not match');

    setLoading(true);
    try {
      await axios.post('/auth/reset-password', { token, email, password });
      setStatus('Password reset successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (e) {
      setStatus(e.response?.data?.msg || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen premium-gradient flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-md p-10 border-t-white/20">
        <h2 className="page-title text-center">Reset Password</h2>
        <p className="text-center text-slate-400 mb-6">Enter a new password for <strong>{email}</strong></p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">New password</label>
            <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Confirm password</label>
            <input type="password" className="input" value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>

          <button className={`button mt-2 ${loading ? 'opacity-50 cursor-wait' : ''}`} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          {status && <div className="text-center text-sm text-slate-300 mt-3">{status}</div>}

          <p className="text-center text-sm text-slate-500 mt-4">
            Remembered? <Link to="/login" className="text-white font-bold">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
