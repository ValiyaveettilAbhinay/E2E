import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);

  const [missingResult, setMissingResult] = useState(null);
  const [migrateResult, setMigrateResult] = useState(null);
  const [runningMissing, setRunningMissing] = useState(false);
  const [runningMigrate, setRunningMigrate] = useState(false);

  useEffect(() => {
    axios.get("/admin/users").then(res => setUsers(res.data)).catch(() => {});
    axios.get("/admin/items").then(res => setItems(res.data)).catch(() => {});
  }, []);

  const fetchMissingPhones = async () => {
    setRunningMissing(true);
    setMissingResult(null);
    try {
      const res = await axios.get('/admin/missing-phones');
      setMissingResult(res.data);
    } catch (e) {
      setMissingResult({ error: e.response?.data?.msg || 'Failed' });
    } finally {
      setRunningMissing(false);
    }
  };

  const runMigrate = async () => {
    if (!confirm('This will copy owner phone into item.contactPhone for items missing it. Continue?')) return;
    setRunningMigrate(true);
    setMigrateResult(null);
    try {
      const res = await axios.post('/admin/migrate-item-phones');
      setMigrateResult(res.data);
      // refresh items
      const it = await axios.get('/admin/items');
      setItems(it.data);
    } catch (e) {
      setMigrateResult({ error: e.response?.data?.msg || 'Migration failed' });
    } finally {
      setRunningMigrate(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>

      <div className="mb-6">
        <h3 className="font-semibold">Users</h3>
        {users.length === 0 ? <p className="text-sm text-slate-400">No users yet</p> : (
          <div className="space-y-1">
            {users.map(u => (
              <div key={u._id} className="text-sm">{u.email} {u.phone ? `• ${u.phone}` : '• (no phone)'}</div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="font-semibold">Items</h3>
        {items.length === 0 ? <p className="text-sm text-slate-400">No items yet</p> : (
          <div className="space-y-1">
            {items.map(i => (
              <div key={i._id} className="text-sm">{i.title} {i.contactPhone ? `• ${i.contactPhone}` : '• (no contact)'}</div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="font-semibold">Migration Tools</h3>
        <div className="flex gap-3">
          <button disabled={runningMissing} onClick={fetchMissingPhones} className="button">
            {runningMissing ? 'Checking...' : 'List users missing phone'}
          </button>

          <button disabled={runningMigrate} onClick={runMigrate} className="button">
            {runningMigrate ? 'Migrating...' : 'Migrate item contact phones'}
          </button>
        </div>

        {missingResult && (
          <div className="mt-4 bg-slate-800 p-4 rounded">
            <div className="font-medium">Missing phones: {missingResult.count}</div>
            <div className="text-sm mt-2 space-y-1">
              {missingResult.users && missingResult.users.map(u => (
                <div key={u._id}>{u.name} — {u.email}</div>
              ))}
            </div>
          </div>
        )}

        {migrateResult && (
          <div className="mt-4 bg-slate-800 p-4 rounded">
            {migrateResult.error ? (
              <div className="text-red-400">{migrateResult.error}</div>
            ) : (
              <div>
                <div>Updated: {migrateResult.updated}</div>
                <div>Total items inspected: {migrateResult.total}</div>
                <div>Skipped: {migrateResult.skippedCount}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
