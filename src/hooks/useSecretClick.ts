import { useState, useCallback, useRef } from 'react';

interface UseSecretClickOptions {
  requiredClicks?: number;
  timeWindowMs?: number;
  initialState?: boolean;
  onTrigger?: (nextState: boolean) => void;
}

export function useSecretClick({
  requiredClicks = 5,
  timeWindowMs = 2000,
  initialState = false,
  onTrigger,
}: UseSecretClickOptions = {}) {
  const [isActive, setIsActive] = useState<boolean>(initialState);
  const clickTimestampsRef = useRef<number[]>([]);
  const [clickCountProgress, setClickCountProgress] = useState<number>(0);

  const registerClick = useCallback(() => {
    const now = Date.now();
    // Filter out clicks outside the time window
    const recentClicks = [...clickTimestampsRef.current, now].filter(
      (timestamp) => now - timestamp <= timeWindowMs
    );
    clickTimestampsRef.current = recentClicks;
    setClickCountProgress(recentClicks.length);

    if (recentClicks.length >= requiredClicks) {
      setIsActive((prev) => {
        const next = !prev;
        if (onTrigger) onTrigger(next);
        return next;
      });
      clickTimestampsRef.current = [];
      setClickCountProgress(0);
    }
  }, [requiredClicks, timeWindowMs, onTrigger]);

  const toggle = useCallback(() => {
    setIsActive((prev) => {
      const next = !prev;
      if (onTrigger) onTrigger(next);
      return next;
    });
    clickTimestampsRef.current = [];
    setClickCountProgress(0);
  }, [onTrigger]);

  const deactivate = useCallback(() => {
    setIsActive(false);
    if (onTrigger) onTrigger(false);
    clickTimestampsRef.current = [];
    setClickCountProgress(0);
  }, [onTrigger]);

  return {
    isActive,
    registerClick,
    toggle,
    deactivate,
    clickCountProgress,
    requiredClicks,
  };
}
