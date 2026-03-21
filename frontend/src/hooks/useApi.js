import { useState } from "react";

export default function useApi(apiFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const call = async (...args) => {
    try {
      setLoading(true);
      setError("");
      const res = await apiFn(...args);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, call };
}
