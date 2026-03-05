import { useCallback, useState } from 'react';
import { Button } from '../components/ui/button';
import { ConfirmModal } from '../components/ConfirmModal';
import { registerNewcomers, type NewcomerPayload } from '../lib/newcomerApi';

/* ── 타입 ── */

type NewcomerRow = {
  id: string;
  name: string;
  gender: '' | '남' | '여';
  birthDay: string;
  phone: string;
  phoneUnknown: boolean;
  organizationId: number | null;
  organizationName: string;
};

/* ── 유틸 ── */

let nextId = 0;
function createRow(): NewcomerRow {
  nextId += 1;
  return {
    id: String(nextId),
    name: '',
    gender: '',
    birthDay: '',
    phone: '',
    phoneUnknown: false,
    organizationId: null,
    organizationName: '',
  };
}

function createInitialRows(count: number): NewcomerRow[] {
  return Array.from({ length: count }, () => createRow());
}

/** 000-0000-0000 형식으로 변환한다. */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function isValidPhone(value: string): boolean {
  return /^\d{3}-\d{4}-\d{4}$/.test(value);
}

/** 행에 사용자가 입력한 데이터가 하나라도 있는지 확인한다. */
function hasData(row: NewcomerRow): boolean {
  return (
    row.name.trim() !== '' ||
    row.gender !== '' ||
    row.birthDay !== '' ||
    row.phone !== '' ||
    row.organizationId !== null
  );
}

/* ── 컬럼 헤더 정의 ── */

const COLUMNS = [
  { key: 'name', label: '이름', width: 'w-[130px]' },
  { key: 'gender', label: '성별', width: 'w-[90px]' },
  { key: 'birthDay', label: '생일', width: 'w-[150px]' },
  { key: 'phone', label: '핸드폰번호', width: 'w-[260px]' },
  { key: 'organization', label: '소속', width: 'w-[170px]' },
] as const;

/* ── 페이지 컴포넌트 ── */

const INITIAL_ROW_COUNT = 3;

export function RegisterPage() {
  const [rows, setRows] = useState<NewcomerRow[]>(() => createInitialRows(INITIAL_ROW_COUNT));
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* ── 행 조작 ── */

  const updateRow = useCallback((id: string, patch: Partial<NewcomerRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, createRow()]);
  }, []);

  const requestRemove = useCallback(
    (id: string) => {
      const row = rows.find((r) => r.id === id);
      if (row && hasData(row)) {
        setDeleteTarget(id);
      } else {
        setRows((prev) => prev.filter((r) => r.id !== id));
      }
    },
    [rows],
  );

  const confirmRemove = useCallback(() => {
    if (!deleteTarget) return;
    setRows((prev) => prev.filter((r) => r.id !== deleteTarget));
    setDeleteTarget(null);
  }, [deleteTarget]);

  /* ── 등록 ── */

  const handleSubmit = async () => {
    setSubmitError(null);

    const filledRows = rows.filter((r) => r.name.trim() !== '');

    if (filledRows.length === 0) {
      setSubmitError('등록할 새가족 정보를 입력해 주세요.');
      return;
    }

    for (const row of filledRows) {
      if (row.gender === '') {
        setSubmitError(`"${row.name}" 행의 성별을 선택해 주세요.`);
        return;
      }
      if (!row.phoneUnknown && row.phone !== '' && !isValidPhone(row.phone)) {
        setSubmitError(`"${row.name}" 행의 핸드폰번호 형식이 올바르지 않습니다.`);
        return;
      }
    }

    const payload: NewcomerPayload[] = filledRows.map((r) => ({
      name: r.name.trim(),
      gender: r.gender as '남' | '여',
      birthDay: r.birthDay,
      phone: r.phoneUnknown ? '' : r.phone,
      organizationId: r.organizationId,
    }));

    setSubmitting(true);
    try {
      await registerNewcomers(payload);
      setRows(createInitialRows(INITIAL_ROW_COUNT));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── 렌더 ── */

  return (
    <div className="flex h-full flex-col">
      {/* 페이지 제목 */}
      <h1 className="mb-4 text-lg font-semibold text-gray-800">새가족 등록</h1>

      {/* 테이블 영역 */}
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
          {/* 삭제 버튼 열 */}
          <span className="w-10 shrink-0" />
        </div>

        {/* 행 목록 */}
        <div className="divide-y divide-gray-100">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex items-center px-4 py-2 transition-colors hover:bg-gray-50/60"
            >
              {/* 이름 */}
              <div className={`${COLUMNS[0].width} shrink-0 px-1`}>
                <input
                  type="text"
                  placeholder="이름 입력"
                  value={row.name}
                  onChange={(e) => updateRow(row.id, { name: e.target.value })}
                  className="h-9 w-full rounded-md border border-gray-200 bg-white px-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:border-[#3d8b6e] focus:outline-none focus:ring-1 focus:ring-[#3d8b6e]/30"
                />
              </div>

              {/* 성별 */}
              <div className={`${COLUMNS[1].width} shrink-0 px-1`}>
                <select
                  value={row.gender}
                  onChange={(e) =>
                    updateRow(row.id, { gender: e.target.value as NewcomerRow['gender'] })
                  }
                  className="h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-700 focus:border-[#3d8b6e] focus:outline-none focus:ring-1 focus:ring-[#3d8b6e]/30"
                >
                  <option value="" disabled>
                    선택
                  </option>
                  <option value="남">남</option>
                  <option value="여">여</option>
                </select>
              </div>

              {/* 생일 */}
              <div className={`${COLUMNS[2].width} shrink-0 px-1`}>
                <input
                  type="date"
                  value={row.birthDay}
                  onChange={(e) => updateRow(row.id, { birthDay: e.target.value })}
                  className="h-9 w-full rounded-md border border-gray-200 bg-white px-2.5 text-sm text-gray-700 focus:border-[#3d8b6e] focus:outline-none focus:ring-1 focus:ring-[#3d8b6e]/30"
                />
              </div>

              {/* 핸드폰번호 */}
              <div className={`${COLUMNS[3].width} shrink-0 px-1`}>
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    placeholder="010-0000-0000"
                    value={row.phone}
                    disabled={row.phoneUnknown}
                    onChange={(e) => updateRow(row.id, { phone: formatPhone(e.target.value) })}
                    className="h-9 w-full rounded-md border border-gray-200 bg-white px-2.5 text-sm text-gray-700 placeholder:text-gray-300 disabled:bg-gray-100 disabled:text-gray-400 focus:border-[#3d8b6e] focus:outline-none focus:ring-1 focus:ring-[#3d8b6e]/30"
                  />
                  <label className="flex shrink-0 cursor-pointer items-center gap-1 text-[11px] text-gray-500 select-none">
                    <input
                      type="checkbox"
                      checked={row.phoneUnknown}
                      onChange={(e) =>
                        updateRow(row.id, {
                          phoneUnknown: e.target.checked,
                          phone: e.target.checked ? '' : row.phone,
                        })
                      }
                      className="h-3.5 w-3.5 rounded border-gray-300 text-[#3d8b6e] focus:ring-[#3d8b6e]/30"
                    />
                    번호모름
                  </label>
                </div>
              </div>

              {/* 소속 */}
              <div className={`${COLUMNS[4].width} shrink-0 px-1`}>
                <div className="flex items-center gap-1.5">
                  <span className="flex-1 truncate rounded-md border border-gray-200 bg-gray-50 px-2.5 py-[7px] text-sm text-gray-400">
                    {row.organizationName || '미선택'}
                  </span>
                  {/* TODO: 소속 검색 모달 연결 */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 shrink-0 px-3 text-xs"
                    onClick={() => {
                      // TODO: 소속 검색 모달 열기
                    }}
                  >
                    검색
                  </Button>
                </div>
              </div>

              {/* 삭제 */}
              <div className="w-10 shrink-0 pl-1">
                <button
                  type="button"
                  onClick={() => requestRemove(row.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label="행 삭제"
                >
                  <MinusIcon />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 행이 하나도 없을 때 */}
        {rows.length === 0 && (
          <div className="flex items-center justify-center py-10 text-sm text-gray-400">
            등록할 행이 없습니다. 아래 버튼으로 행을 추가하세요.
          </div>
        )}
      </div>

      {/* 하단 액션 */}
      <div className="mt-4 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={addRow} className="gap-1 text-xs">
          <PlusIcon />
          행 추가
        </Button>

        <div className="flex items-center gap-3">
          {submitError && <p className="text-xs text-red-500">{submitError}</p>}
          <Button
            className="h-10 rounded-lg bg-[#3d8b6e] px-6 text-sm font-medium text-white shadow-sm hover:bg-[#34765d]"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? '등록 중…' : '등록'}
          </Button>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {deleteTarget !== null && (
        <ConfirmModal
          message="데이터가 있습니다. 그래도 삭제할까요?"
          onConfirm={confirmRemove}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

/* ── 아이콘 ── */

function MinusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM6.75 9.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
    </svg>
  );
}
