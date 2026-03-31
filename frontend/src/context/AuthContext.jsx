import { createContext, useContext, useEffect, useState } from "react";
import axios from "../api/axios";
import { setToken as setTokenStore } from "../api/token";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // keep the token store in sync for non-react modules
    setTokenStore(token);

    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get("/auth/me");
        setUser(res.data);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Broadcast auth changes to other tabs and listen for them
  useEffect(() => {
    const onStorage = (e) => {
      if (!e.key) return;
      if (e.key === "auth-update" || e.key === "token") {
        // update token from storage (may be null)
        setToken(localStorage.getItem("token"));
      }
    };

    window.addEventListener("storage", onStorage);

    let bc = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel("auth");
        bc.onmessage = (m) => {
          if (m?.data === "auth-update")
            setToken(localStorage.getItem("token"));
        };
      } catch (e) {
        // ignore
      }
    }

    return () => {
      window.removeEventListener("storage", onStorage);
      if (bc) bc.close();
    };
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    // notify other tabs
    localStorage.setItem("auth-update", String(Date.now()));
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        new BroadcastChannel("auth").postMessage("auth-update");
      } catch (e) {}
    }
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.setItem("auth-update", String(Date.now()));
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        new BroadcastChannel("auth").postMessage("auth-update");
      } catch (e) {}
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
