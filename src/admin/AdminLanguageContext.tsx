import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { t, type AdminLang, type TranslationKey } from "./i18n";

interface AdminLanguageContextValue {
  lang: AdminLang;
  setLang: (lang: AdminLang) => void;
  tr: (key: TranslationKey) => string;
  dir: "ltr" | "rtl";
}

const AdminLanguageContext = createContext<AdminLanguageContextValue>({
  lang: "en",
  setLang: () => {},
  tr: (key) => t("en", key),
  dir: "ltr",
});

const STORAGE_KEY = "qadiroon_admin_lang";

export function AdminLanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "ar" ? "ar" : "en";
  });

  const setLang = (next: AdminLang) => {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const tr = (key: TranslationKey) => t(lang, key);
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <AdminLanguageContext.Provider value={{ lang, setLang, tr, dir }}>
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminI18n() {
  return useContext(AdminLanguageContext);
}
