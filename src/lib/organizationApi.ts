import { request } from './apiClient';

/** 서버 응답 원본 타입 (snake_case) */
type OrganizationRaw = {
  id: number;
  name: string;
  upper_organization_id: number | null;
  is_deleted: boolean;
};

/** 클라이언트에서 사용하는 조직 타입 */
export type Organization = {
  id: number;
  name: string;
};

/** '~국_~~그룹_~~순' 패턴에 매칭되는지 확인한다. */
const ORG_NAME_PATTERN = /^.+국_.+그룹_.+순$/;

type OrganizationsResponse = {
  data: OrganizationRaw[];
} | OrganizationRaw[];

/** 응답이 배열인 경우와 { data: [...] } 래핑인 경우를 모두 처리한다. */
function unwrapList(res: OrganizationsResponse): OrganizationRaw[] {
  return Array.isArray(res) ? res : res.data;
}

/**
 * 조직 목록을 조회한 뒤, '국_그룹_순' 패턴만 필터링하고
 * '_' 를 공백으로 치환하여 반환한다.
 */
export async function fetchOrganizations(): Promise<Organization[]> {
  const res = await request<OrganizationsResponse>({
    method: 'GET',
    path: '/api/organizations',
    fallbackError: '소속 목록을 불러오지 못했습니다.',
  });

  const raw = unwrapList(res);

  return raw
    .filter((o) => !o.is_deleted && ORG_NAME_PATTERN.test(o.name))
    .map((o) => ({
      id: o.id,
      name: o.name.replace(/_/g, ' '),
    }));
}
