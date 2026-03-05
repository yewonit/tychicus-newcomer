import { request } from './apiClient';

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

/** GET /auth/login 응답 타입 — 사용자 정보 및 권한 목록 */
type UserInfoResponse = {
  permissions: string[];
  [key: string]: unknown;
};

/** 이메일/패스워드로 로그인한다. */
export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return request<LoginResponse>({
    method: 'POST',
    path: '/auth/login',
    body: { email, password },
    token: null,
    fallbackError: '로그인에 실패했습니다.',
  });
}

/** 액세스 토큰으로 사용자 정보와 권한 목록을 조회한다. */
export async function loginWithToken(accessToken: string): Promise<UserInfoResponse> {
  return request<UserInfoResponse>({
    method: 'GET',
    path: '/auth/login',
    token: accessToken,
    fallbackError: '토큰 검증에 실패했습니다.',
  });
}

/** 리프레시 토큰으로 새 액세스 토큰을 발급받는다. */
export async function refreshAccessToken(refreshToken: string): Promise<LoginResponse> {
  return request<LoginResponse>({
    method: 'POST',
    path: '/auth/refresh',
    body: { refreshToken },
    token: null,
    fallbackError: '토큰 갱신에 실패했습니다.',
  });
}

/** 새가족 페이지 접근에 필요한 권한 코드 */
export const NEWCOMER_PERMISSION = 'NEWCOMER_PAGE_CONTROL';

/** 권한 목록에 특정 코드가 포함되어 있는지 확인한다. */
export function hasPermission(permissions: string[], code: string): boolean {
  return permissions.includes(code);
}
