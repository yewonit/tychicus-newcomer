const BASE_URL = 'https://attendance.icoramdeo.com';

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

/** GET /auth/login 응답 타입 — 사용자 정보 및 권한 목록 */
type UserInfoResponse = {
  permissions: string[];
  [key: string]: unknown;
};

export async function loginWithCredentials(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const message = await safeErrorMessage(res);
    throw new Error(message ?? '로그인에 실패했습니다.');
  }

  return res.json();
}

/** 액세스 토큰으로 사용자 정보와 권한 목록을 조회한다. */
export async function loginWithToken(accessToken: string): Promise<UserInfoResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const message = await safeErrorMessage(res);
    throw new Error(message ?? '토큰 검증에 실패했습니다.');
  }

  return res.json() as Promise<UserInfoResponse>;
}

/** 새가족 페이지 접근에 필요한 권한 코드 */
export const NEWCOMER_PERMISSION = 'NEWCOMER_PAGE_CONTROL';

/** 권한 목록에 특정 코드가 포함되어 있는지 확인한다. */
export function hasPermission(permissions: string[], code: string): boolean {
  return permissions.includes(code);
}

export async function refreshAccessToken(refreshToken: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    const message = await safeErrorMessage(res);
    throw new Error(message ?? '토큰 갱신에 실패했습니다.');
  }

  return res.json();
}

async function safeErrorMessage(res: Response): Promise<string | null> {
  try {
    const data = (await res.json()) as { message?: string };
    return data?.message ?? null;
  } catch {
    return null;
  }
}

