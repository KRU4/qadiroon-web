import { usePublicDataContext } from "../../context/PublicDataContext";

interface Props {
  slotCode: string;
  width?: number;
  height?: number;
}

export function AdSlotPlaceholder({ slotCode, width, height }: Props) {
  const { getAd } = usePublicDataContext();
  const ad = getAd(slotCode);

  if (ad && ad.image_url) {
    return (
      <div className="flex justify-center">
        <a href={ad.link_url || "#"} target={ad.link_url ? "_blank" : undefined} rel="noreferrer">
          <img
            src={ad.image_url}
            alt={ad.label || slotCode}
            style={{ width: ad.width || width || 300, height: ad.height || height || 250 }}
            className="object-contain mx-auto"
          />
        </a>
      </div>
    );
  }

  const w = width || 728;
  const h = height || 90;

  return (
    <div
      className="mx-auto border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50/50 text-center"
      style={{ maxWidth: w, height: h, fontFamily: "Cairo, sans-serif" }}
    >
      <p className="text-xs text-gray-400 font-mono">{slotCode}</p>
      <p className="text-[10px] text-gray-400 mt-1">{w} × {h}</p>
      <p className="text-[10px] text-gray-300 mt-0.5">إعلان مباشر / Google AdSense</p>
    </div>
  );
}
