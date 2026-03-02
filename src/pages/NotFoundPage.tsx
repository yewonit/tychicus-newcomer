import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#E8F5BD_0%,#C7EABB_30%,#A2CB8B_100%)] px-4">
      <div className="w-full max-w-md space-y-4 rounded-3xl bg-white/90 p-8 text-center shadow-[0_24px_40px_rgba(0,0,0,0.12)]">
        <p className="text-sm font-medium tracking-tight text-[#8b9f7b]">404</p>
        <h1 className="text-lg font-semibold tracking-tight text-[#6b8b5b]">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-sm text-[#7f9470]">
          주소가 잘못되었거나, 더 이상 존재하지 않는 페이지입니다.
        </p>
        <Link
          to="/"
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#8eb176] px-6 text-sm font-medium text-white shadow-[0_4px_0_rgba(0,0,0,0.12)] hover:bg-[#7aa065]"
        >
          메인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

