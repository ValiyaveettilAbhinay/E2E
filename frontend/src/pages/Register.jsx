import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    try {
      setError(""); 
      await axios.post("/auth/register", { name, email, password, phone });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const goGoogle = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="min-h-screen premium-gradient flex items-center justify-center px-4 py-12">
      <div className="glass-card w-full max-w-md p-10 border-t-white/20">
        <div className="text-center mb-10">
          <img src="/logo.png" alt="App logo" className="mx-auto w-24 h-24 mb-4 object-contain" />
          <h2 className="page-title">Join Us</h2>
          <p className="text-slate-400 font-medium">Start your journey today</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Full Name</label>
            <input
              type="text"
              placeholder="Your Name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Phone</label>
            <input
              type="tel"
              placeholder="Mobile number"
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
            <input
              type="password"
              placeholder="Choose a strong password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="button mt-6" onClick={handleRegister} disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="text-center py-2">or</div>

          <button onClick={goGoogle} className="w-full flex items-center justify-center gap-3 border border-slate-700 rounded py-3">
            <img src="/google.svg" alt="Google" className="h-5" />
            <span>Continue with Google</span>
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          Already a member?{" "}
          <Link to="/login" className="text-white font-bold hover:text-indigo-400 transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}