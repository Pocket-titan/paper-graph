import React, { useRef, useState, useEffect } from 'react';

function useInterval(callback: Function, delay: number | null) {
  const savedCallback = useRef<Function | null>(null);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      (savedCallback as any).current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export function useClock({ delay }: { delay: number }) {
  let [time, setTime] = useState(0);
  let [isRunning, setIsRunning] = useState(true);

  useInterval(() => setTime(time + 1), isRunning ? delay : null);

  return [time, () => setIsRunning(false), () => setIsRunning(true)] as [number, () => void, () => void];
}
