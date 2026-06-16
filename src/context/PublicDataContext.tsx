import { createContext, useContext, type ReactNode } from "react";
import { usePublicData } from "../hooks/usePublicData";
import type { AdSlot, BlogRecord, LandingData, NavbarItem } from "../lib/api";

interface PublicDataContextValue {
  navbar: NavbarItem[];
  ads: AdSlot[];
  landing: LandingData;
  blogs: BlogRecord[];
  getAd: (slotCode: string) => AdSlot | undefined;
  loading: boolean;
  refresh: () => Promise<void>;
}

const PublicDataContext = createContext<PublicDataContextValue>({
  navbar: [],
  ads: [],
  landing: {
    hero_title: "",
    hero_subtitle: "",
    stats: [],
    breaking_ticker: "",
    spotlight: [],
    about_content: "",
  },
  blogs: [],
  getAd: () => undefined,
  loading: true,
  refresh: async () => {},
});

export function PublicDataProvider({ children }: { children: ReactNode }) {
  const data = usePublicData();
  return (
    <PublicDataContext.Provider value={data}>{children}</PublicDataContext.Provider>
  );
}

export function usePublicDataContext() {
  return useContext(PublicDataContext);
}
