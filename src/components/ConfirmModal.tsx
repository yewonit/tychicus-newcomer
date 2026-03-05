import { useEffect, useRef } from 'react';
import { Button } from './ui/button';

type ConfirmModalProps = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** 확인/취소를 선택할 수 있는 범용 확인 모달 */
export function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <p className="text-sm leading-relaxed text-gray-700">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            ref={cancelRef}
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            취소
          </Button>
          <Button
            size="sm"
            className="bg-red-500 text-white hover:bg-red-600"
            onClick={onConfirm}
          >
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}
