import { useEffect, useRef } from "react";
import { useAnimationContext } from "../../../context/AnimationContext";

type AnimationVariant = "news" | "service" | "header";

const STAGGER_MS: Record<AnimationVariant, number> = {
  news: 100,
  service: 80,
  header: 0,
};

export function useScrollAnimation(variant: AnimationVariant = "news") {
  const containerRef = useRef<HTMLDivElement>(null);

  const { enabled } = useAnimationContext();

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const elements = container.querySelectorAll<HTMLElement>(".animate-on-scroll");

    if (prefersReducedMotion) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const index = Number(el.dataset.staggerIndex ?? 0);
          const delay = index * STAGGER_MS[variant];

          setTimeout(() => {
            el.classList.add("is-visible");
            el.style.willChange = "auto";
          }, delay);

          observer.unobserve(el);
        });
      },
      { threshold: 0.1 },
    );

    elements.forEach((el) => {
      el.classList.add(`animate-${variant}`);
      el.style.willChange = "transform, opacity";
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [variant, enabled]);

  return containerRef;
}
