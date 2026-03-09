import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { MODAL_DURATION_MS, SEARCH_DEBOUNCE_MS } from '../lib/animation';
import { fetchOrganizations, type Organization } from '../lib/organizationApi';

type OrganizationModalProps = {
  onSelect: (id: number, name: string) => void;
  onClose: () => void;
};

/**
 * 소속(조직) 검색 모달.
 * 마운트 시 조직 목록을 불러오고, 디바운스된 키워드로 필터링하여 표시한다.
 */
export function OrganizationModal({ onSelect, onClose }: OrganizationModalProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  /* ── 데이터 로드 ── */

  useEffect(() => {
    let cancelled = false;

    fetchOrganizations()
      .then((data) => {
        if (!cancelled) setOrganizations(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── 진입 애니메이션 ── */

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    inputRef.current?.focus();
  }, []);

  /* ── ESC 닫기 ── */

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  /* ── 닫기 (퇴장 애니메이션 후 실제 언마운트) ── */

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, MODAL_DURATION_MS);
  }, [onClose]);

  const handleSelect = useCallback(
    (org: Organization) => {
      onSelect(org.id, org.name);
      handleClose();
    },
    [onSelect, handleClose],
  );

  /* ── 필터링 ── */

  const filtered = debouncedSearch.trim()
    ? organizations.filter((o) => o.name.includes(debouncedSearch.trim()))
    : [];

  const showResults = debouncedSearch.trim().length > 0;

  /* ── 렌더 ── */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dim 배경 */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        style={{
          opacity: visible ? 1 : 0,
          transitionDuration: `${MODAL_DURATION_MS}ms`,
        }}
        onClick={handleClose}
      />

      {/* 모달 패널 */}
      <div
        className="relative z-10 flex max-h-[70vh] w-full max-w-md flex-col rounded-xl bg-white shadow-2xl transition-all"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
          transitionDuration: `${MODAL_DURATION_MS}ms`,
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* 헤더 + 검색바 */}
        <div className="border-b border-gray-100 px-5 pt-5 pb-3">
          <h2 className="mb-3 text-sm font-semibold text-gray-800">소속 검색</h2>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="그룹, 순 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-[#f5f6f8] pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#3d8b6e] focus:outline-none focus:ring-1 focus:ring-[#3d8b6e]/30"
            />
          </div>
        </div>

        {/* 결과 영역 */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {loading && (
            <p className="py-8 text-center text-sm text-gray-400">불러오는 중…</p>
          )}

          {error && (
            <p className="py-8 text-center text-sm text-red-500">{error}</p>
          )}

          {!loading && !error && !showResults && (
            <p className="py-8 text-center text-sm text-gray-400">
              검색어를 입력하세요
            </p>
          )}

          {!loading && !error && showResults && filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">
              검색 결과가 없습니다
            </p>
          )}

          {!loading && showResults && filtered.length > 0 && (
            <ul>
              {filtered.map((org) => (
                <li key={org.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(org)}
                    className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition-all duration-150 hover:bg-[#e8f5bd] hover:pl-4 hover:text-[#2b5a3d] active:bg-[#d5eaa0]"
                  >
                    {highlightMatch(org.name, debouncedSearch.trim())}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 하단 닫기 */}
        <div className="border-t border-gray-100 px-5 py-3">
          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-lg py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

/** 검색 키워드 부분을 볼드 처리하여 반환한다. */
function highlightMatch(text: string, keyword: string) {
  if (!keyword) return text;

  const idx = text.indexOf(keyword);
  if (idx === -1) return text;

  return (
    <>
      {text.slice(0, idx)}
      <span className="font-semibold text-[#3d8b6e]">{keyword}</span>
      {text.slice(idx + keyword.length)}
    </>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-4 w-4 ${className ?? ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}
