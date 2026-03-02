import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithToken, refreshAccessToken } from '../lib/authApi';

type CheckState = 'idle' | 'checking' | 'success' | 'error';

type TokenStorage = 'local' | 'session' | null;

function getStoredTokens(): { accessToken: string | null; refreshToken: string | null; storage: TokenStorage } {
  const localAccess = localStorage.getItem('accessToken');
  const localRefresh = localStorage.getItem('refreshToken');

  if (localAccess && localRefresh) {
    return { accessToken: localAccess, refreshToken: localRefresh, storage: 'local' };
  }

  const sessionAccess = sessionStorage.getItem('accessToken');
  const sessionRefresh = sessionStorage.getItem('refreshToken');

  if (sessionAccess && sessionRefresh) {
    return { accessToken: sessionAccess, refreshToken: sessionRefresh, storage: 'session' };
  }

  return { accessToken: null, refreshToken: null, storage: null };
}

function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('autoLogin');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
}

export function RootPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<CheckState>('idle');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setState('checking');
      setMessage(null);

      const { accessToken, refreshToken, storage } = getStoredTokens();

      if (!accessToken) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const userData = await loginWithToken(accessToken);
        if (cancelled) return;
        localStorage.setItem('userData', JSON.stringify(userData));
        setState('success');
        setMessage('자동 로그인에 성공했습니다.');
        return;
      } catch {
        if (!refreshToken || !storage) {
          clearTokens();
          navigate('/login', { replace: true });
          return;
        }
      }

      // try refresh
      try {
        const refreshed = await refreshAccessToken(refreshToken!);

        if (cancelled) return;

        if (storage === 'local') {
          localStorage.setItem('accessToken', refreshed.accessToken);
          localStorage.setItem('refreshToken', refreshed.refreshToken);
        } else if (storage === 'session') {
          sessionStorage.setItem('accessToken', refreshed.accessToken);
          sessionStorage.setItem('refreshToken', refreshed.refreshToken);
        }

        const userData = await loginWithToken(refreshed.accessToken);
        if (cancelled) return;
        localStorage.setItem('userData', JSON.stringify(userData));

        setState('success');
        setMessage('토큰을 갱신하고 자동 로그인에 성공했습니다.');
      } catch (err) {
        if (cancelled) return;
        clearTokens();
        setState('error');
        setMessage(
          err instanceof Error
            ? err.message
            : '자동 로그인에 실패했습니다. 다시 로그인해 주세요.',
        );
        navigate('/login', { replace: true });
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#E8F5BD_0%,#C7EABB_30%,#A2CB8B_100%)] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white/90 p-8 shadow-[0_24px_40px_rgba(0,0,0,0.12)]">
        <h1 className="mb-4 text-center text-lg font-semibold tracking-tight text-[#6b8b5b]">
          새가족 시스템
        </h1>
        <p className="mb-2 text-center text-sm text-[#7f9470]">
          {state === 'checking' && '자동 로그인 중입니다...'}
          {state === 'success' && (message ?? '로그인되었습니다.')}
        </p>
        {state === 'error' && message ? (
          <p className="text-center text-xs text-red-500">{message}</p>
        ) : null}
      </div>
    </div>
  );
}

