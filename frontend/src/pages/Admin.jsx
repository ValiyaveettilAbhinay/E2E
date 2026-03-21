import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get("/admin/users").then(res => setUsers(res.data));
    axios.get("/admin/items").then(res => setItems(res.data));
  }, []);

  return (
    <div>
      <h2>Admin Panel</h2>

      <h3>Users</h3>
      {users.map(u => (
        <p key={u._id}>{u.email}</p>
      ))}

      <h3>Items</h3>
      {items.map(i => (
        <p key={i._id}>{i.title}</p>
      ))}
    </div>
  );
}
