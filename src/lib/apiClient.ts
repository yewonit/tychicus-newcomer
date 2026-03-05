export const BASE_URL = 'https://attendance.icoramdeo.com';

/** 저장된 액세스 토큰을 가져온다 (localStorage → sessionStorage 순서). */
export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken');
}

/** 응답 본문에서 message 필드를 안전하게 추출한다. 파싱 실패 시 null 반환. */
export async function safeErrorMessage(res: Response): Promise<string | null> {
  try {
    const data = (await res.json()) as { message?: string };
    return data?.message ?? null;
  } catch {
    return null;
  }
}

type RequestOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  token?: string | null;
  fallbackError?: string;
};

/**
 * BASE_URL 기반의 공통 fetch 래퍼.
 * 인증 토큰이 주어지면 Authorization 헤더를 자동 첨부하고,
 * 실패 시 응답 본문의 message 또는 fallbackError를 담은 Error를 throw한다.
 */
export async function request<T>(opts: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {};

  if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const token = opts.token ?? getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${opts.path}`, {
    method: opts.method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const message = await safeErrorMessage(res);
    throw new Error(message ?? opts.fallbackError ?? '요청에 실패했습니다.');
  }

  return res.json() as Promise<T>;
}
