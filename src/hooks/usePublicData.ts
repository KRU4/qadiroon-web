import { useEffect, useState } from "react";
import { api, type AdSlot, type BlogRecord, type LandingData, type NavbarItem } from "../lib/api";

export const emptyLanding: LandingData = {
  hero_title: "",
  hero_subtitle: "",
  stats: [
    { value: "", label: "" },
    { value: "", label: "" },
    { value: "", label: "" },
  ],
  breaking_ticker: "",
  spotlight: [],
  about_content: "",
};

export function usePublicData() {
  const [navbar, setNavbar] = useState<NavbarItem[]>([]);
  const [ads, setAds] = useState<AdSlot[]>([]);
  const [landing, setLanding] = useState<LandingData>(emptyLanding);
  const [blogs, setBlogs] = useState<BlogRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    return Promise.all([
      api.publicNavbar(),
      api.publicAds(),
      api.publicLanding(),
      api.publicBlogs(),
    ])
      .then(([nav, adList, landingData, blogList]) => {
        setNavbar(nav);
        setAds(adList);
        setLanding({
          ...emptyLanding,
          ...landingData,
          stats: landingData.stats?.length === 3 ? landingData.stats : emptyLanding.stats,
          spotlight: landingData.spotlight ?? [],
        });
        setBlogs(blogList);
      })
      .catch(() => {});
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const getAd = (slotCode: string) => ads.find((a) => a.slot_code === slotCode);

  return { navbar, ads, landing, blogs, getAd, loading, refresh };
}
