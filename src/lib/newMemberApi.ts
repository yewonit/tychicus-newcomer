import { request } from './apiClient';

/** 서버 응답 원본 타입 */
export type NewMemberRaw = {
  userId: number;
  name: string;
  nameSuffix: string | null;
  phoneNumber: string | null;
  gender: 'M' | 'F';
  email: string | null;
  birthDate: string | null;
  isNewMember: boolean;
  isLongTermAbsentee: boolean;
  registrationDate: string;
  roleId: number;
  roleName: string;
  organizationId: number | null;
  organizationName: string | null;
};

/** 화면에서 사용하는 새가족 타입 */
export type NewMember = {
  userId: number;
  name: string;
  gender: string;
  birthDate: string;
  phoneNumber: string;
  organizationId: number | null;
  organizationName: string;
};

type NewMembersResponse = {
  data: NewMemberRaw[];
};

/** gender 코드를 한글로 변환한다. */
function formatGender(code: 'M' | 'F'): string {
  return code === 'M' ? '남' : '여';
}

/** 전화번호를 000-0000-0000 형식으로 변환한다. */
function formatPhone(raw: string | null): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 11) return raw;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/** 조직명의 '_' 를 공백으로 치환한다. */
function formatOrgName(name: string | null): string {
  return name ? name.replace(/_/g, ' ') : '';
}

/** 최근 새가족 목록을 조회한다. */
export async function fetchNewMembers(): Promise<NewMember[]> {
  const res = await request<NewMembersResponse>({
    method: 'GET',
    path: '/api/users/new-members',
    fallbackError: '새가족 목록을 불러오지 못했습니다.',
  });

  return res.data.map((m) => ({
    userId: m.userId,
    name: m.name,
    gender: formatGender(m.gender),
    birthDate: m.birthDate ?? '',
    phoneNumber: formatPhone(m.phoneNumber),
    organizationId: m.organizationId,
    organizationName: formatOrgName(m.organizationName),
  }));
}
