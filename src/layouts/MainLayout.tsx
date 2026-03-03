import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '../lib/utils';

const NAV_ITEMS = [
  { to: '/register', label: '새가족 등록' },
  { to: '/update-recent', label: '최근 새가족 정보 수정' },
] as const;

/** 메인 레이아웃 — 좌측 사이드바 + 우측 콘텐츠 영역 */
export function MainLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-14 items-center border-b border-gray-200 px-5">
          <span className="text-base font-semibold tracking-tight text-[#6b8b5b]">
            새가족 시스템
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#e8f5bd] text-[#5a6f4c]'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* TODO: 사용자 정보 및 로그아웃 버튼 */}
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
