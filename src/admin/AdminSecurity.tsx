import { useEffect, useState } from "react";
import { api, type AuditRecord } from "../lib/api";
import { useAdminI18n } from "./AdminLanguageContext";

export function AdminSecurity() {
  const { tr } = useAdminI18n();
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [otpauth, setOtpauth] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.audit.list().then(setLogs);
  }, []);

  const setup2fa = async () => {
    const r = await api.twoFa.setup();
    setOtpauth(r.otpauth);
    setMsg(tr("scanQr"));
  };

  const enable2fa = async () => {
    await api.twoFa.enable(code);
    setMsg(tr("twoFaEnabled"));
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{tr("security")}</h1>
      <div className="bg-white border rounded-xl p-5 max-w-lg space-y-3">
        <h2 className="font-semibold">{tr("twoFactor")}</h2>
        <p className="text-sm text-gray-500">{tr("twoFactorDesc")}</p>
        <button onClick={setup2fa} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">{tr("setup2fa")}</button>
        {otpauth && <p className="text-xs break-all font-mono bg-gray-50 p-2 rounded" dir="ltr">{otpauth}</p>}
        <input placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} className="border rounded px-3 py-2 w-40" />
        <button onClick={enable2fa} className="border px-4 py-2 rounded-lg text-sm ms-2">{tr("enable2fa")}</button>
        <button onClick={() => api.twoFa.disable()} className="text-red-600 text-sm block">{tr("disable2fa")}</button>
        {msg && <p className="text-sm text-green-600">{msg}</p>}
      </div>
      <div className="bg-white border rounded-xl p-5">
        <h2 className="font-semibold mb-4">{tr("auditLog")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-start"><th className="p-2">User</th><th className="p-2">Action</th><th className="p-2">Date</th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b">
                  <td className="p-2">{l.user_name}</td>
                  <td className="p-2">{l.action}</td>
                  <td className="p-2 text-gray-500">{l.created_at?.slice(0, 16)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
