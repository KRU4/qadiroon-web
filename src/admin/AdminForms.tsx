import { useEffect, useState } from "react";
import { api, type FormRecord, type FormField } from "../lib/api";
import { useAdminI18n } from "./AdminLanguageContext";

export function AdminForms() {
  const { tr } = useAdminI18n();
  const [forms, setForms] = useState<FormRecord[]>([]);
  const [name, setName] = useState("");

  const load = () => api.forms.list().then(setForms);
  useEffect(() => { load(); }, []);

  const create = async () => {
    const fields: FormField[] = [
      { id: "1", type: "text", label: "Name", required: true },
      { id: "2", type: "email", label: "Email", required: true },
      { id: "3", type: "textarea", label: "Message", required: true },
    ];
    await api.forms.create({ name, fields });
    setName("");
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{tr("forms")}</h1>
      <div className="flex gap-2">
        <input placeholder={tr("formName")} value={name} onChange={(e) => setName(e.target.value)} className="border rounded px-3 py-2 flex-1" />
        <button onClick={create} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">{tr("add")}</button>
      </div>
      <div className="space-y-2">
        {forms.map((f) => (
          <div key={f.id} className="bg-white border rounded-lg p-4">
            <p className="font-semibold">{f.name}</p>
            <p className="text-xs text-gray-500 mt-1" dir="ltr">Embed: {`{{form:${f.embed_code}}}`}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
