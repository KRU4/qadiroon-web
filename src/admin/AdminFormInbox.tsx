import { useEffect, useState } from "react";
import { api, type FormSubmission } from "../lib/api";
import { useAdminI18n } from "./AdminLanguageContext";

export function AdminFormInbox() {
  const { tr } = useAdminI18n();
  const [items, setItems] = useState<FormSubmission[]>([]);

  const load = () => api.forms.submissions().then(setItems);
  useEffect(() => { load(); }, []);

  const exportCsv = async () => {
    const res = await api.forms.exportCsv();
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "submissions.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{tr("inbox")}</h1>
        <button onClick={exportCsv} className="border px-4 py-2 rounded-lg text-sm">{tr("exportCsv")}</button>
      </div>
      <div className="space-y-2">
        {items.map((s) => (
          <div key={s.id} className={`bg-white border rounded-lg p-4 ${s.is_read ? "" : "border-blue-300"}`}>
            <div className="flex justify-between">
              <p className="font-semibold">{s.form_name}</p>
              <span className="text-xs text-gray-500">{s.created_at?.slice(0, 16)}</span>
            </div>
            <pre className="text-xs mt-2 text-gray-600 whitespace-pre-wrap">{s.data}</pre>
            {!s.is_read && (
              <button className="text-blue-600 text-xs mt-2" onClick={() => api.forms.markRead(s.id).then(load)}>
                {tr("markRead")}
              </button>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-gray-500 text-sm">{tr("inboxEmpty")}</p>}
      </div>
    </div>
  );
}
