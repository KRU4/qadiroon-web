import { useEffect, useState, type FormEvent } from "react";
import { api, type FormField } from "../../lib/api";

export function FormEmbed({ embedCode }: { embedCode: string }) {
  const [form, setForm] = useState<{ name: string; fields: FormField[] } | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.publicForm(embedCode).then((f) => setForm({ name: f.name, fields: f.fields }));
  }, [embedCode]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await api.submitForm(embedCode, { ...values, _honeypot: "" });
    setDone(true);
  };

  if (!form) return null;
  if (done) return <p className="text-green-600 text-sm p-4">شكراً! تم إرسال رسالتك.</p>;

  return (
    <form onSubmit={submit} className="space-y-3 p-4 border rounded-xl bg-white" dir="rtl">
      <h3 className="font-bold">{form.name}</h3>
      <input type="text" name="_honeypot" className="hidden" tabIndex={-1} autoComplete="off" />
      {form.fields.map((f) => (
        <div key={f.id}>
          <label className="text-sm font-semibold">{f.label}</label>
          {f.type === "textarea" ? (
            <textarea
              required={f.required}
              value={values[f.id] || ""}
              onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          ) : (
            <input
              type={f.type === "email" ? "email" : "text"}
              required={f.required}
              value={values[f.id] || ""}
              onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          )}
        </div>
      ))}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
        إرسال
      </button>
    </form>
  );
}
