import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { api, type UserRecord } from "../lib/api";
import { useOutletContext } from "react-router";
import type { AuthUser } from "../lib/api";

export function AdminUsers() {
  const { user } = useOutletContext<{ user: AuthUser }>();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "employee" });

  if (user.role !== "admin") return <Navigate to="/admin/dashboard" replace />;

  const load = () => api.users.list().then(setUsers);
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <div className="bg-white rounded-xl border p-4 mb-6 grid grid-cols-2 gap-3">
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border rounded px-3 py-2" />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border rounded px-3 py-2" />
        <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="border rounded px-3 py-2" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="border rounded px-3 py-2">
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={() => api.users.create(form).then(() => { setForm({ name: "", email: "", password: "", role: "employee" }); load(); })} className="col-span-2 bg-blue-600 text-white px-4 py-2 rounded-lg">Create User</button>
      </div>
      <table className="w-full bg-white rounded-xl border text-sm">
        <thead><tr className="border-b bg-gray-50"><th className="p-3 text-left">Name</th><th className="p-3 text-left">Email</th><th className="p-3">Role</th><th></th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="p-3">{u.name}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3 text-center">{u.role}</td>
              <td className="p-3 text-right"><button className="text-red-600" onClick={() => api.users.delete(u.id).then(load)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
