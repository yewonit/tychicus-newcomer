const BASE_URL = 'https://attendance.icoramdeo.com';

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
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

export async function loginWithToken(accessToken: string): Promise<unknown> {
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

  return res.json();
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

