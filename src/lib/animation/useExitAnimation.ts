import { type CSSProperties, useCallback, useRef, useState } from 'react';
import { EXIT_DURATION_MS, EXIT_TRANSLATE_X } from './constants';

type UseExitAnimationOptions = {
  /** 개별 아이템의 퇴장 애니메이션이 끝났을 때 호출된다. 실제 상태 제거를 여기서 처리한다. */
  onComplete: (id: string) => void;
  durationMs?: number;
};

/**
 * 리스트 아이템의 퇴장(exit) 애니메이션을 관리하는 훅.
 *
 * 사용법:
 * ```ts
 * const exit = useExitAnimation({
 *   onComplete: (id) => setItems(prev => prev.filter(i => i.id !== id)),
 * });
 *
 * // 퇴장 트리거
 * exit.trigger(['id-1', 'id-2']);
 *
 * // 스타일 바인딩
 * <div style={exit.getStyle(item.id)}>...</div>
 *
 * // 퇴장 중 여부
 * exit.isExiting(item.id)
 * ```
 */
export function useExitAnimation(options: UseExitAnimationOptions) {
  const { onComplete, durationMs = EXIT_DURATION_MS } = options;
  const [exitingSet, setExitingSet] = useState<Set<string>>(new Set());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  /** 지정한 ID들의 퇴장 애니메이션을 시작한다. */
  const trigger = useCallback(
    (ids: string[]) => {
      setExitingSet((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.add(id));
        return next;
      });

      ids.forEach((id) => {
        if (timers.current.has(id)) return;
        const timer = setTimeout(() => {
          setExitingSet((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          timers.current.delete(id);
          onComplete(id);
        }, durationMs);
        timers.current.set(id, timer);
      });
    },
    [durationMs, onComplete],
  );

  const isExiting = useCallback((id: string) => exitingSet.has(id), [exitingSet]);

  /** 퇴장 여부에 따라 적절한 인라인 스타일을 반환한다. */
  const getStyle = useCallback(
    (id: string): CSSProperties =>
      exitingSet.has(id)
        ? {
            opacity: 0,
            transform: `translateX(${EXIT_TRANSLATE_X}px)`,
            maxHeight: 0,
            paddingTop: 0,
            paddingBottom: 0,
            overflow: 'hidden',
            transitionDuration: `${durationMs}ms`,
          }
        : {
            opacity: 1,
            transform: 'translateX(0)',
            maxHeight: '200px',
            transitionDuration: `${durationMs}ms`,
          },
    [exitingSet, durationMs],
  );

  return { trigger, isExiting, getStyle } as const;
}
