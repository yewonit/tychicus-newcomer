import { useEffect, useState } from 'react';
import { fetchNewMembers, type NewMember } from '../lib/newMemberApi';

/* ── 컬럼 정의 ── */

const COLUMNS = [
  { key: 'name', label: '이름', width: 'w-[120px]' },
  { key: 'gender', label: '성별', width: 'w-[70px]' },
  { key: 'birthDate', label: '생일', width: 'w-[130px]' },
  { key: 'phoneNumber', label: '핸드폰번호', width: 'w-[150px]' },
  { key: 'organizationName', label: '소속', width: 'w-[200px]' },
] as const;

/** 최근 새가족 정보 수정 페이지 */
export function UpdateRecentPage() {
  const [members, setMembers] = useState<NewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchNewMembers()
      .then((data) => {
        if (!cancelled) setMembers(data);
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

  /* ── 렌더 ── */

  return (
    <div className="flex h-full flex-col">
      <h1 className="mb-4 text-lg font-semibold text-gray-800">최근 새가족 정보 수정</h1>

      <div className="flex-1 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        {/* 헤더 */}
        <div className="flex items-center border-b border-gray-200 bg-[#f5f7fa] px-4 py-2.5">
          {COLUMNS.map((col) => (
            <span
              key={col.key}
              className={`${col.width} shrink-0 px-2 text-xs font-semibold text-gray-500`}
            >
              {col.label}
            </span>
          ))}
          {/* 수정 버튼 열 */}
          <span className="w-10 shrink-0" />
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            불러오는 중…
          </div>
        )}

        {/* 에러 */}
        {!loading && error && (
          <div className="flex items-center justify-center py-16 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && !error && members.length === 0 && (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            최근 등록된 새가족이 없습니다.
          </div>
        )}

        {/* 행 목록 */}
        {!loading && !error && members.length > 0 && (
          <div className="divide-y divide-gray-100">
            {members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center px-4 py-2.5 transition-colors hover:bg-gray-50/60"
              >
                <div className={`${COLUMNS[0].width} shrink-0 px-2 text-sm text-gray-800`}>
                  {member.name}
                </div>
                <div className={`${COLUMNS[1].width} shrink-0 px-2 text-sm text-gray-600`}>
                  {member.gender}
                </div>
                <div className={`${COLUMNS[2].width} shrink-0 px-2 text-sm text-gray-600`}>
                  {member.birthDate}
                </div>
                <div className={`${COLUMNS[3].width} shrink-0 px-2 text-sm text-gray-600`}>
                  {member.phoneNumber || '-'}
                </div>
                <div className={`${COLUMNS[4].width} shrink-0 truncate px-2 text-sm text-gray-600`}>
                  {member.organizationName || '-'}
                </div>

                {/* 수정 버튼 */}
                <div className="w-10 shrink-0 pl-1">
                  <button
                    type="button"
                    onClick={() => {
                      // TODO: 수정 모달 열기
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-[#e8f5bd] hover:text-[#3d8b6e]"
                    aria-label="수정"
                  >
                    <EditIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 아이콘 ── */

function EditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
      />
    </svg>
  );
}
