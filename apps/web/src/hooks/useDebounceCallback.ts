import { useEffect, useMemo, useRef } from 'react';

export function useDebounceCallback<T extends (...args: never[]) => void>(
  callback: T,
  delay = 300,
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const debounced = useMemo(() => {
    return ((...args: never[]) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T;
  }, [delay]);

  useEffect(() => () => clearTimeout(timerRef.current), [delay]);

  return debounced;
}
