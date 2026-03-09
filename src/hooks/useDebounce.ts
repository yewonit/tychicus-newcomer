import { useEffect, useState } from 'react';

/**
 * 값이 변경된 뒤 지정한 지연 시간이 지나야 반영되는 디바운스 훅.
 * 검색 입력 등 사용자 입력이 끝난 뒤 처리할 때 활용한다.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
