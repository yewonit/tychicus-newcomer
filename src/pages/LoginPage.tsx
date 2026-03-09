import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  loginWithCredentials,
  loginWithToken,
  refreshAccessToken,
  hasPermission,
  NEWCOMER_PERMISSION,
} from '../lib/authApi';

function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('autoLogin');
  localStorage.removeItem('userData');
}

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Step 1 + 2-1: 페이지 진입 시 자동 로그인 시도.
   * localStorage에 토큰이 있고 autoLogin 플래그가 true일 때만 실행한다.
   *
   * 흐름:
   *   loginWithToken(accessToken)
   *     → 성공: 권한 확인 → /register
   *     → 실패: refreshAccessToken(refreshToken)
   *       → 성공: 새 토큰 저장 → /register
   *       → 실패: 토큰 전부 삭제 → /login 유지
   */
  useEffect(() => {
    let cancelled = false;

    async function tryAutoLogin() {
      const storedAccess = localStorage.getItem('accessToken');
      const storedRefresh = localStorage.getItem('refreshToken');
      const isAutoLogin = localStorage.getItem('autoLogin') === 'true';

      if (!storedAccess || !storedRefresh || !isAutoLogin) return;

      setLoading(true);

      try {
        const userData = await loginWithToken(storedAccess);
        if (cancelled) return;

        if (!hasPermission(userData.permissions, NEWCOMER_PERMISSION)) {
          clearTokens();
          setError('권한이 없습니다');
          setLoading(false);
          return;
        }

        localStorage.setItem('userData', JSON.stringify(userData));
        navigate('/register', { replace: true });
        return;
      } catch {
        if (cancelled) return;
      }

      try {
        const refreshed = await refreshAccessToken(storedRefresh);
        if (cancelled) return;

        localStorage.setItem('accessToken', refreshed.accessToken);
        localStorage.setItem('refreshToken', refreshed.refreshToken);

        navigate('/register', { replace: true });
      } catch {
        if (cancelled) return;
        clearTokens();
        setLoading(false);
      }
    }

    void tryAutoLogin();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  /**
   * Step 2-2: 폼 제출 — credential 로그인.
   * loginWithCredentials로 토큰을 받아오고,
   * 자동로그인이 체크되어 있으면 토큰을 localStorage에 저장한 뒤 /register로 이동한다.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { accessToken, refreshToken } = await loginWithCredentials(email, password);

      if (autoLogin) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('autoLogin', 'true');
      }

      navigate('/register', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#E8F5BD_0%,#C7EABB_30%,#A2CB8B_100%)] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white/90 p-8 shadow-[0_24px_40px_rgba(0,0,0,0.12)]">
        <h1 className="mb-8 text-center text-lg font-semibold tracking-tight text-[#6b8b5b]">
          로그인
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm text-[#9faf93]">
              아이디
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full border-0 border-b border-[#d5e4c7] bg-transparent px-0 text-sm text-[#5a6f4c] placeholder:text-[#d5e4c7] focus:border-[#9fbf8c] focus:outline-none"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm text-[#9faf93]">
              패스워드
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 w-full border-0 border-b border-[#d5e4c7] bg-transparent px-0 text-sm text-[#5a6f4c] placeholder:text-[#d5e4c7] focus:border-[#9fbf8c] focus:outline-none"
              placeholder="패스워드를 입력하세요"
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[#7f9470]">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={autoLogin}
                onChange={(e) => setAutoLogin(e.target.checked)}
                className="h-3.5 w-3.5 rounded border border-[#b8cba9] text-[#8eb176] focus:ring-0"
              />
              <span>자동로그인</span>
            </label>
          </div>

          {error ? <p className="text-xs text-red-500">{error}</p> : null}

          <Button
            type="submit"
            className="mt-2 h-10 w-full rounded-full bg-[#8eb176] text-sm font-medium text-white shadow-[0_4px_0_rgba(0,0,0,0.12)] hover:bg-[#7aa065]"
            disabled={loading}
          >
            {loading ? '확인 중…' : '확인'}
          </Button>
        </form>
      </div>
    </div>
  );
}
