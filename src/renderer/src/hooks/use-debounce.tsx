import { useRef, useEffect, useMemo } from 'react';
import debounce from 'lodash/debounce';

export function useDebounce(callback: () => void, delay = 100) {
  const ref = useRef<any>();

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = () => {
      ref.current?.();
    };

    return debounce(func, delay);
  }, []);

  return debouncedCallback;
}
