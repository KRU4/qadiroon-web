import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface AnimationContextValue {
  enabled: boolean;
  enable: () => void;
}

const AnimationContext = createContext<AnimationContextValue>({
  enabled: false,
  enable: () => {},
});

export function useAnimationContext() {
  return useContext(AnimationContext);
}

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const enable = useCallback(() => setEnabled(true), []);

  return (
    <AnimationContext.Provider value={{ enabled, enable }}>
      {children}
    </AnimationContext.Provider>
  );
}
