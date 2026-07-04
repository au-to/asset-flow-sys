import { useEffect, useMemo, useRef } from 'react';

export function useDebounceCallback<T extends (...args: never[]) => void>(
  callback: T,
  delay = 300,
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const debounced = useMemo(() => {
    let timer: ReturnType<typeof setTimeout>;
    return ((...args: never[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => callbackRef.current(...args), delay);
    }) as T;
  }, [delay]);

  useEffect(() => () => clearTimeout(undefined), []);

  return debounced;
}
