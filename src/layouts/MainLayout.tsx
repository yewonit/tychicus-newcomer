import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '../lib/utils';

const NAV_ITEMS = [
  { to: '/register', label: '새가족 등록', icon: RegisterIcon },
  { to: '/update-recent', label: '최근 새가족 정보 수정', icon: EditIcon },
] as const;

/** 메인 레이아웃 — 좌측 아이콘 사이드바 + 상단 헤더 + 콘텐츠 영역 */
export function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f2f5]">
      {/* ── 사이드바 ── */}
      <aside className="flex w-[72px] shrink-0 flex-col items-center bg-[#2b3a4e] py-6">
        <nav className="flex flex-1 flex-col items-center gap-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group flex w-14 flex-col items-center gap-1 rounded-lg px-1 py-2.5 transition-colors',
                  isActive
                    ? 'bg-[#3d8b6e] text-white'
                    : 'text-[#8a9bae] hover:bg-white/10 hover:text-white',
                )
              }
            >
              <Icon />
              <span className="text-[10px] font-medium leading-tight">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ── 오른쪽 영역 (헤더 + 콘텐츠) ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 상단 헤더 */}
        <header className="flex h-14 shrink-0 items-center border-b border-gray-200 bg-white px-6">
          <div className="relative w-full max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="검색"
              className="h-9 w-full rounded-lg border border-gray-200 bg-[#f5f6f8] pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#3d8b6e] focus:outline-none focus:ring-1 focus:ring-[#3d8b6e]/30"
            />
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ── 아이콘 컴포넌트 ── */

function RegisterIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM3 20a6 6 0 0 1 12 0v1H3v-1Z"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-4 w-4', className)}
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
