import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  loginWithCredentials,
  loginWithToken,
  hasPermission,
  NEWCOMER_PERMISSION,
} from '../lib/authApi';

function storeTokens(
  accessToken: string,
  refreshToken: string,
  options: { autoLogin: boolean },
) {
  if (options.autoLogin) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('autoLogin', 'true');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
  } else {
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    localStorage.removeItem('autoLogin');
  }
}

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { accessToken, refreshToken } = await loginWithCredentials(email, password);
      storeTokens(accessToken, refreshToken, { autoLogin });

      const userData = await loginWithToken(accessToken);

      if (!hasPermission(userData.permissions, NEWCOMER_PERMISSION)) {
        setError('권한이 없습니다');
        return;
      }

      localStorage.setItem('userData', JSON.stringify(userData));
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

