import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: authLogin } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // use AuthContext login so all tabs get notified and user is fetched
      authLogin(token);
      navigate('/dashboard');
    }
    // eslint-disable-next-line
  }, []);

  const login = async (e) => {
    if(e) e.preventDefault();
    setLoading(true);
    setError(""); 
    try {
      const res = await axios.post("/auth/login", { email, password });
      // use AuthContext to set token and notify other tabs
      authLogin(res.data.token);
      navigate("/dashboard"); 
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.msg || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const goGoogle = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const requestReset = async () => {
    setResetStatus('');
    try {
      await axios.post('/auth/forgot-password', { email: resetEmail });
      setResetStatus('If that email exists you will receive a reset link');
    } catch (e) {
      setResetStatus('Failed to request reset');
    }
  };

  return (
    <div className="min-h-screen premium-gradient flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-md p-10 border-t-white/20">
        <div className="text-center mb-10">
          <img src="/assets/logo.png" alt="App logo" className="mx-auto w-24 h-24 mb-4 object-contain" />
          <h2 className="page-title">Welcome Back</h2>
          <p className="text-slate-400 font-medium">Elevate your sharing experience</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-6 text-center animate-pulse">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
            <input
              type="email"
              placeholder="name@domain.com"
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && login()}
            />
          </div>

          <button 
            className={`button mt-4 ${loading ? "opacity-50 cursor-wait" : ""}`} 
            onClick={login}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>

          <div className="text-center py-2">or</div>

          <button onClick={goGoogle} className="w-full flex items-center justify-center gap-3 border border-slate-700 rounded py-3">
            <img src="/google.svg" alt="Google" className="h-5" />
            <span>Continue with Google</span>
          </button>

          <div className="text-center mt-2">
            <button onClick={() => setShowReset(true)} className="text-sm text-slate-400 hover:text-white">Forgot password?</button>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          New to the platform?{" "}
          <Link to="/register" className="text-white font-bold hover:text-indigo-400 transition-colors">
            Join Now
          </Link>
        </p>
      </div>

      {/* Reset modal */}
      {showReset && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowReset(false)} />
          <div className="relative bg-slate-900 rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-bold mb-2">Reset your password</h3>
            <p className="text-xs text-slate-400 mb-4">Enter your email and we'll send a reset link (if configured).</p>
            <input value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="input mb-3" placeholder="your@email.com" />
            <div className="flex gap-2">
              <button onClick={requestReset} className="button">Send link</button>
              <button onClick={() => setShowReset(false)} className="w-full text-slate-400 text-sm hover:text-white">Cancel</button>
            </div>
            {resetStatus && <div className="text-xs text-slate-300 mt-3">{resetStatus}</div>}
          </div>
        </div>
      )}
    </div>
  );
}