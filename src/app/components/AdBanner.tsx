import { useRef, useState, useEffect, type MouseEvent, type CSSProperties } from "react";
import { useIsMobile } from "./ui/use-mobile";
import { usePublicDataContext } from "../../context/PublicDataContext";
import type { AdSlot } from "../../lib/api";

export interface AdSlotData {
  slotCode: string;
  label: string;
  image?: string;
  link?: string;
  width: number;
  height: number;
  active: boolean;
  expiresAt?: string;
}

export const AD_SLOTS: AdSlotData[] = [
  { slotCode: "TOP_BANNER", label: "إعلان أعلى الصفحة", width: 728, height: 90, active: false },
  { slotCode: "LEFT_EDGE_TOP", label: "الجانب الأيسر - أعلى", width: 160, height: 200, active: false },
  { slotCode: "LEFT_EDGE_MID", label: "الجانب الأيسر - وسط", width: 160, height: 200, active: false },
  { slotCode: "RIGHT_EDGE_TOP", label: "الجانب الأيمن - أعلى", width: 160, height: 200, active: false },
  { slotCode: "RIGHT_EDGE_MID", label: "الجانب الأيمن - وسط", width: 160, height: 200, active: false },
  { slotCode: "SIDEBAR_300x600", label: "إعلان جانبي", width: 300, height: 600, active: false },
  { slotCode: "BETWEEN_NEWS_BOX_1", label: "إعلان بين الأخبار", width: 728, height: 90, active: false },
  { slotCode: "BETWEEN_NEWS_BOX_2", label: "إعلان 300×250 - ١", width: 300, height: 250, active: false },
  { slotCode: "BETWEEN_NEWS_BOX_3", label: "إعلان 300×250 - ٢", width: 300, height: 250, active: false },
  { slotCode: "HERO_TICKER", label: "شريط الأخبار العاجلة", width: 728, height: 40, active: false },
];

export function getActiveAd(slotCode: string, apiAds?: AdSlot[]): AdSlotData | undefined {
  const fromApi = apiAds?.find((a) => a.slot_code === slotCode);
  if (fromApi) {
    if (!fromApi.image_url) return undefined;
    return {
      slotCode: fromApi.slot_code,
      label: fromApi.label,
      image: fromApi.image_url,
      link: fromApi.link_url,
      width: fromApi.width,
      height: fromApi.height,
      active: true,
    };
  }
  const ad = AD_SLOTS.find((s) => s.slotCode === slotCode);
  if (!ad || !ad.active) return undefined;
  if (ad.expiresAt && new Date(ad.expiresAt) < new Date()) return undefined;
  return ad;
}

interface AdBannerProps {
  slotCode?: string;
  width?: number;
  height?: number;
  type?: "leaderboard" | "halfpage" | "rectangle";
  label?: string;
  darkMode?: boolean;
  variant?: "flat" | "3d";
  staggerIndex?: number;
}

function Ad3DInner({
  width,
  height,
  label,
  image,
  darkMode,
  onMouseMove,
  onMouseLeave,
  style,
}: {
  width: number;
  height: number;
  label: string;
  image?: string;
  darkMode?: boolean;
  onMouseMove: (e: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`ad-3d-box rounded-xl overflow-hidden border ${
        darkMode ? "border-gray-600 bg-gray-800" : "border-gray-200 bg-white"
      }`}
      style={{ width: "100%", maxWidth: width, minHeight: height, ...style }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {image ? (
        <a href="#" className="block w-full h-full">
          <img src={image} alt={label} className="w-full h-full object-cover" />
        </a>
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <span
            className="text-xs font-semibold mb-1 px-3 py-0.5 rounded-full"
            style={{
              backgroundColor: "#F6B512",
              color: "#1a1a2e",
              fontFamily: "Cairo, sans-serif",
            }}
          >
            {label}
          </span>
          <p
            className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-400"}`}
            style={{ fontFamily: "Cairo, sans-serif" }}
          >
            {width} × {height}
          </p>
        </div>
      )}
    </div>
  );
}

export function AdBanner({
  slotCode,
  width,
  height,
  type,
  label = "إعلان",
  darkMode,
  variant = "flat",
  staggerIndex = 0,
}: AdBannerProps) {
  const { getAd } = usePublicDataContext();
  const apiAd = slotCode ? getAd(slotCode) : undefined;
  const ad = apiAd?.image_url
    ? {
        slotCode: apiAd.slot_code,
        label: apiAd.label,
        image: apiAd.image_url,
        link: apiAd.link_url,
        width: apiAd.width,
        height: apiAd.height,
        active: true,
      }
    : slotCode
      ? getActiveAd(slotCode)
      : undefined;
  let resolvedWidth = ad?.width ?? width ?? 300;
  let resolvedHeight = ad?.height ?? height ?? 250;

  if (type === "leaderboard") {
    resolvedWidth = 728;
    resolvedHeight = 90;
  } else if (type === "halfpage") {
    resolvedWidth = 300;
    resolvedHeight = 600;
  } else if (type === "rectangle") {
    resolvedWidth = 300;
    resolvedHeight = 250;
  }

  if (slotCode && (!ad || !ad.image)) {
    return (
      <div className="flex flex-col items-center justify-center mx-auto" data-slot={slotCode}>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50/50 text-center"
          style={{ width: "100%", maxWidth: resolvedWidth, minHeight: resolvedHeight || 90, fontFamily: "Cairo, sans-serif" }}
        >
          <p className="text-xs text-gray-400 font-mono">{slotCode}</p>
          <p className="text-[10px] text-gray-400 mt-1">{resolvedWidth} × {resolvedHeight}</p>
          <p className="text-[10px] text-gray-300 mt-0.5">إعلان مباشر / Google AdSense</p>
        </div>
      </div>
    );
  }
  const resolvedLabel = ad?.label ?? label;
  const image = ad?.image;

  const boxRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (variant !== "3d" || !boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(
      `rotateY(${x * -10}deg) rotateX(${y * 6}deg) translateZ(20px)`,
    );
  };

  const handleMouseLeave = () => setTransform("");

  if (variant === "3d") {
    return (
      <div
        className="ad-3d-perspective mx-auto"
        style={{
          transform: staggerIndex % 2 === 0 ? "translateY(0)" : "translateY(16px)",
        }}
      >
        <div ref={boxRef} style={{ transform }}>
          <Ad3DInner
            width={resolvedWidth}
            height={resolvedHeight}
            label={resolvedLabel}
            image={image}
            darkMode={darkMode}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: transform || undefined,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="ad-slot flex flex-col items-center justify-center rounded-xl border-2 border-dashed text-center mx-auto"
      data-slot={slotCode}
      data-label={resolvedLabel}
      style={{ width: "100%", maxWidth: resolvedWidth, minHeight: resolvedHeight }}
    >
      {image ? (
        <a href={ad?.link ?? "#"} className="block w-full h-full rounded-xl overflow-hidden">
          <img
            src={image}
            alt={resolvedLabel}
            className="w-full h-full object-cover"
            style={{ minHeight: resolvedHeight }}
          />
        </a>
      ) : (
        <div
          className={`flex flex-col items-center justify-center w-full h-full rounded-xl ${
            darkMode ? "bg-gray-800 border-gray-600" : "bg-gray-50 border-gray-200"
          }`}
          style={{ minHeight: resolvedHeight }}
        >
          <div
            className="text-xs font-semibold mb-1 px-3 py-0.5 rounded-full"
            style={{
              backgroundColor: "#F6B512",
              color: "#1a1a2e",
              fontFamily: "Cairo, sans-serif",
            }}
          >
            {resolvedLabel}
          </div>
          <p
            className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-400"}`}
            style={{ fontFamily: "Cairo, sans-serif" }}
          >
            {resolvedWidth} × {resolvedHeight}
          </p>
          <p
            className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-300"}`}
            style={{ fontFamily: "Cairo, sans-serif" }}
          >
            Google AdSense / إعلان مباشر
          </p>
        </div>
      )}
    </div>
  );
}

interface EdgeMarqueeProps {
  side: "left" | "right";
  darkMode?: boolean;
}

export function EdgeMarquee({ side, darkMode }: EdgeMarqueeProps) {
  const { ads } = usePublicDataContext();
  const [showEdges, setShowEdges] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1280px)");
    const update = () => setShowEdges(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const prefix = side === "left" ? "LEFT_EDGE" : "RIGHT_EDGE";
  const edgeAds = ads
    .filter((s) => s.slot_code.startsWith(prefix) && s.image_url)
    .map((s) => ({
      slotCode: s.slot_code,
      label: s.label,
      image: s.image_url,
      link: s.link_url,
      width: s.width,
      height: s.height,
      active: true,
    }));

  const staticAds = AD_SLOTS.filter(
    (s) => s.slotCode.startsWith(prefix) && getActiveAd(s.slotCode),
  );

  const mergedAds = edgeAds.length > 0 ? edgeAds : staticAds;

  if (!showEdges || mergedAds.length === 0) return null;

  const items = [...mergedAds, ...mergedAds];

  return (
    <div
      className="hidden xl:block flex-shrink-0 overflow-hidden"
      style={{ width: "160px" }}
      data-slot={`${prefix}_MARQUEE`}
      data-label={side === "left" ? "الجانب الأيسر" : "الجانب الأيمن"}
    >
      <div className="edge-marquee-track flex flex-col gap-4">
        {items.map((ad, i) => (
          <a
            key={`${ad.slotCode}-${i}`}
            href={ad.link ?? "#"}
            className={`block rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-shadow ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            {ad.image ? (
              <img
                src={ad.image}
                alt={ad.label}
                className="w-full object-cover"
                style={{ height: ad.height }}
              />
            ) : (
              <div
                className={`flex items-center justify-center text-xs p-2 text-center ${
                  darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
                }`}
                style={{ height: ad.height, fontFamily: "Cairo, sans-serif" }}
              >
                {ad.label}
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

interface AdBanner3DGroupProps {
  slotCodes: string[];
  darkMode?: boolean;
}

export function AdBanner3DGroup({ slotCodes, darkMode }: AdBanner3DGroupProps) {
  const isMobile = useIsMobile();
  const activeAds = slotCodes
    .map((code) => getActiveAd(code))
    .filter((ad): ad is AdSlotData => !!ad);

  if (activeAds.length === 0) return null;

  if (isMobile) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 px-1">
        {activeAds.map((ad) => (
          <AdBanner
            key={ad.slotCode}
            slotCode={ad.slotCode}
            width={ad.width}
            height={ad.height}
            darkMode={darkMode}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center items-end gap-6 py-4">
      {activeAds.map((ad, i) => (
        <AdBanner
          key={ad.slotCode}
          slotCode={ad.slotCode}
          width={ad.width}
          height={ad.height}
          darkMode={darkMode}
          variant="3d"
          staggerIndex={i}
        />
      ))}
    </div>
  );
}
