import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { api } from "../lib/api";

export function AdminLogin() {
  const [email, setEmail] = useState("admin@qadiroon.com");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [needs2fa, setNeeds2fa] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.login(email, password, totpCode || undefined);
      if (res.requires2fa) {
        setNeeds2fa(true);
        return;
      }
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4" dir="ltr">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl"
      >
        <h1 className="text-2xl font-bold text-white mb-1">Qadiroon Admin</h1>
        <p className="text-gray-400 text-sm mb-8">Sign in to manage content</p>
        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <label className="block text-sm text-gray-300 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
          required
        />
        <label className="block text-sm text-gray-300 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
          required
        />
        {needs2fa && (
          <>
            <label className="block text-sm text-gray-300 mb-1">2FA Code</label>
            <input
              type="text"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
              placeholder="000000"
              maxLength={6}
            />
          </>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50"
        >
          {loading ? "Signing in..." : needs2fa ? "Verify" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
