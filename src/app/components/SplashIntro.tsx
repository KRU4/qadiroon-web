import { useState, useEffect, useMemo } from "react";

interface SplashIntroProps {
 onComplete: () => void;
}

export function SplashIntro({ onComplete }: SplashIntroProps) {
 const particles = useMemo(
  () =>
   Array.from({ length: 18 }, (_, i) => ({
    width: Math.random() * 80 + 20,
    height: Math.random() * 80 + 20,
    left: Math.random() * 100,
    top: Math.random() * 100,
    bg: i % 3 === 0 ? "#7AC143" : i % 3 === 1 ? "#F6B512" : "#ffffff",
    delay: Math.random() * 3,
    duration: Math.random() * 4 + 4,
   })),
  [],
 );

 const [phase, setPhase] = useState<"enter" | "show" | "tagline" | "exit">("enter");

 useEffect(() => {
  // Phase timeline
  const t1 = setTimeout(() => setPhase("show"),  400);  // logo builds up
  const t2 = setTimeout(() => setPhase("tagline"), 1800); // tagline fades in
  const t3 = setTimeout(() => setPhase("exit"),   3400); // start exit
  const t4 = setTimeout(() => onComplete(),     4200); // unmount

  return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
 }, [onComplete]);

 return (
  <div
   dir="rtl"
   className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
   style={{
    background: "linear-gradient(160deg, #0d3a6e 0%, #0f5aa6 40%, #1a6fc4 70%, #0a2a50 100%)",
    transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
    opacity: phase === "exit" ? 0 : 1,
    transform: phase === "exit" ? "scale(1.04)" : "scale(1)",
   }}
  >
   {/* Animated background particles */}
   <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {particles.map((p, i) => (
     <div
      key={i}
      className="absolute rounded-full opacity-10 animate-float-particle"
      style={{
       width: `${p.width}px`,
       height: `${p.height}px`,
       left: `${p.left}%`,
       top: `${p.top}%`,
       background: p.bg,
       animationDelay: `${p.delay}s`,
       animationDuration: `${p.duration}s`,
      }}
     />
    ))}
   </div>

   {/* Grid lines overlay */}
   <div
    className="absolute inset-0 pointer-events-none opacity-5"
    style={{
     backgroundImage:
      "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
     backgroundSize: "60px 60px",
    }}
   />

   {/* Glow ring behind logo */}
   <div
    className="absolute"
    style={{
     width: "320px",
     height: "320px",
     borderRadius: "50%",
     background: "radial-gradient(circle, rgba(122,193,67,0.15) 0%, rgba(22,115,184,0.08) 50%, transparent 70%)",
     transform: "translate(-50%, -50%)",
     left: "50%",
     top: "50%",
     animation: "pulseGlow 2.5s ease-in-out infinite",
    }}
   />

   {/* === LOGO SVG (Brand recreation) === */}
   <div
    className="relative flex flex-col items-center"
    style={{
     opacity: phase === "enter" ? 0 : 1,
     transform: phase === "enter" ? "scale(0.7) translateY(30px)" : "scale(1) translateY(0)",
     transition: "opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
    }}
   >
    {/* SVG Icon — Qadiroon figure */}
    <svg
     viewBox="0 0 200 220"
     width="180"
     height="198"
     fill="none"
     xmlns="http://www.w3.org/2000/svg"
     style={{ filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.3))" }}
    >
     {/* Head (circle) */}
     <circle cx="115" cy="40" r="20" fill="#1673B8" />

     {/* Star */}
     <polygon
      points="153,8 156,18 167,18 158,24 161,34 153,28 145,34 148,24 139,18 150,18"
      fill="#F6B512"
     />

     {/* Green arc (body left) */}
     <path
      d="M 80 60 Q 30 90 50 150 Q 70 200 100 195 Q 80 160 90 120 Z"
      fill="#7AC143"
     />

     {/* Blue arc (body right/arm) */}
     <path
      d="M 100 55 Q 145 70 160 110 Q 175 145 150 175 Q 130 145 115 120 Q 100 100 100 80 Z"
      fill="#1673B8"
     />

     {/* Inner lighter blue detail */}
     <path
      d="M 105 65 Q 140 85 148 120 Q 135 100 120 90 Q 110 82 108 72 Z"
      fill="#2d8de0"
      opacity="0.7"
     />
    </svg>

    {/* Arabic Logo Text */}
    <div className="mt-2 text-center">
     <div
      className="font-black leading-tight tracking-wide"
      style={{
       fontFamily: "Cairo, sans-serif",
       fontSize: "clamp(36px, 7vw, 56px)",
       color: "#ffffff",
       textShadow: "0 4px 24px rgba(0,0,0,0.3)",
       letterSpacing: "2px",
      }}
     >
      قادرون
     </div>
    </div>

    {/* Sub text */}
    <div
     className="mt-1 font-bold tracking-widest"
     style={{
      fontFamily: "Cairo, sans-serif",
      fontSize: "clamp(14px, 2.5vw, 20px)",
      color: "#7AC143",
      textShadow: "0 2px 12px rgba(122,193,67,0.4)",
      letterSpacing: "3px",
      transition: "opacity 0.8s ease, transform 0.8s ease",
      opacity: phase === "tagline" || phase === "exit" ? 1 : 0,
      transform: phase === "tagline" || phase === "exit" ? "translateY(0)" : "translateY(10px)",
     }}
    >
     للفئات الخاصة
    </div>

    {/* Tagline below */}
    <div
     className="mt-5 text-center max-w-xs"
     style={{
      fontFamily: "Cairo, sans-serif",
      fontSize: "clamp(12px, 1.8vw, 16px)",
      color: "rgba(255,255,255,0.65)",
      lineHeight: "1.8",
      transition: "opacity 1s ease 0.2s, transform 1s ease 0.2s",
      opacity: phase === "tagline" || phase === "exit" ? 1 : 0,
      transform: phase === "tagline" || phase === "exit" ? "translateY(0)" : "translateY(16px)",
     }}
    >
     المنصة الإعلامية المتخصصة للفئات الخاصة ومجتمعها
    </div>

    {/* Decorative colored dots line */}
    <div
     className="flex items-center gap-2 mt-6"
     style={{
      transition: "opacity 1s ease 0.4s",
      opacity: phase === "tagline" || phase === "exit" ? 1 : 0,
     }}
    >
     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#7AC143" }} />
     <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#F6B512" }} />
     <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#1673B8", border: "2px solid white" }} />
    </div>
   </div>

   {/* Bottom loading bar */}
   <div
    className="absolute bottom-0 left-0 right-0"
    style={{
     opacity: phase === "exit" ? 0 : 1,
     transition: "opacity 0.5s ease",
    }}
   >
    <div
     className="h-1 rounded-full"
     style={{
      background: "linear-gradient(90deg, #1673B8, #7AC143, #F6B512)",
      animation: "loadBar 3.4s linear forwards",
     }}
    />
   </div>

   <style>{`
    @keyframes pulseGlow {
     0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
     50% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
    }

    @keyframes loadBar {
     0% { width: 0%; }
     100% { width: 100%; }
    }

    .animate-float-particle {
     animation: floatParticle var(--dur, 6s) ease-in-out infinite var(--delay, 0s);
    }

    @keyframes floatParticle {
     0%, 100% { transform: translateY(0) scale(1); }
     50% { transform: translateY(-30px) scale(1.1); }
    }
   `}</style>
  </div>
 );
}
