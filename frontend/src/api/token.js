// Small token store used so non-react modules (like axios) can get the current token
// AuthContext updates this store whenever the token changes.
let _token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

export function setToken(token) {
  _token = token;
  try {
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('token', token);
      else localStorage.removeItem('token');
    }
  } catch (e) {
    // ignore
  }
}

export function getToken() {
  // prefer in-memory value but fall back to localStorage for robustness
  return _token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
}
