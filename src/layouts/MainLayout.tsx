import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '../lib/utils';

const NAV_ITEMS = [
  { to: '/register', label: '새가족 등록', icon: RegisterIcon },
  { to: '/update-recent', label: '최근 새가족\n정보 수정', icon: EditIcon },
] as const;

/** 메인 레이아웃 — 좌측 아이콘 사이드바 + 콘텐츠 영역 */
export function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f2f5]">
      {/* ── 사이드바 ── */}
      <aside className="flex w-[88px] shrink-0 flex-col items-center bg-[#2b3a4e] py-6">
        <nav className="flex flex-1 flex-col items-center gap-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group flex w-[72px] flex-col items-center gap-1.5 rounded-lg px-1 py-3 transition-colors',
                  isActive
                    ? 'bg-[#3d8b6e] text-white'
                    : 'text-[#8a9bae] hover:bg-white/10 hover:text-white',
                )
              }
            >
              <Icon />
              <span className="whitespace-pre-wrap text-center text-[10px] font-medium leading-tight">
                {label}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ── 콘텐츠 영역 ── */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
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
