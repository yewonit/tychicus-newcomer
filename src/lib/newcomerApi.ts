import { request } from './apiClient';

export type NewcomerPayload = {
  name: string;
  gender: '남' | '여';
  birthDay: string;
  phone: string;
  organizationId: number | null;
};

type BatchResponse = {
  [key: string]: unknown;
};

/** 새가족 목록을 일괄 등록한다. */
export async function registerNewcomers(users: NewcomerPayload[]): Promise<BatchResponse> {
  return request<BatchResponse>({
    method: 'POST',
    path: '/api/users/batch',
    body: { users },
    fallbackError: '등록에 실패했습니다.',
  });
}
