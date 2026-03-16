import { useCallback, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { OrganizationModal } from './OrganizationModal';
import { MODAL_DURATION_MS } from '../lib/animation';
import { updateMember, type NewMember, type UpdateMemberPayload } from '../lib/newMemberApi';

type EditMemberModalProps = {
  member: NewMember;
  /** 수정 성공 시 변경된 데이터를 전달한다. */
  onSaved: (updated: NewMember) => void;
  onClose: () => void;
};

/** 000-0000-0000 형식으로 변환한다. */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function isValidPhone(value: string): boolean {
  return /^\d{3}-\d{4}-\d{4}$/.test(value);
}

/** 화면 표시용 성별('남'/'여')을 API 코드('M'/'F')로 변환한다. */
function toGenderCode(label: string): 'M' | 'F' {
  return label === '여' ? 'F' : 'M';
}

/** API 코드('M'/'F')를 화면 표시용 성별('남'/'여')로 변환한다. */
function toGenderLabel(code: 'M' | 'F'): string {
  return code === 'F' ? '여' : '남';
}

/** 새가족 정보 수정 모달 */
export function EditMemberModal({ member, onSaved, onClose }: EditMemberModalProps) {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState(member.name);
  const [gender, setGender] = useState<'M' | 'F'>(toGenderCode(member.gender));
  const [birthDate, setBirthDate] = useState(member.birthDate);
  const [phone, setPhone] = useState(member.phoneNumber);
  const [phoneUnknown, setPhoneUnknown] = useState(false);
  const [orgId, setOrgId] = useState<number | null>(member.organizationId);
  const [orgName, setOrgName] = useState(member.organizationName);
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !orgModalOpen) handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, MODAL_DURATION_MS);
  }, [onClose]);

  const handleSave = async () => {
    setError(null);

    if (!name.trim()) {
      setError('이름을 입력해 주세요.');
      return;
    }
    if (!phoneUnknown && phone !== '' && !isValidPhone(phone)) {
      setError('핸드폰번호 형식이 올바르지 않습니다.');
      return;
    }

    const payload: UpdateMemberPayload = {
      name: name.trim(),
      gender,
      birthDate,
      phone: phoneUnknown ? '' : phone,
      organizationId: orgId,
    };

    setSaving(true);
    try {
      await updateMember(member.userId, payload);
      onSaved({
        ...member,
        name: payload.name,
        gender: toGenderLabel(payload.gender),
        birthDate: payload.birthDate,
        phoneNumber: payload.phone,
        organizationId: payload.organizationId,
        organizationName: orgName,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 placeholder:text-gray-300 focus:border-[#3d8b6e] focus:outline-none focus:ring-1 focus:ring-[#3d8b6e]/30';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Dim */}
        <div
          className="absolute inset-0 bg-black/50 transition-opacity"
          style={{ opacity: visible ? 1 : 0, transitionDuration: `${MODAL_DURATION_MS}ms` }}
          onClick={handleClose}
        />

        {/* 패널 */}
        <div
          className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-2xl transition-all"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
            transitionDuration: `${MODAL_DURATION_MS}ms`,
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* 헤더 */}
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-800">새가족 정보 수정</h2>
            <p className="mt-0.5 text-xs text-gray-400">{member.name}님의 정보를 수정합니다.</p>
          </div>

          {/* 폼 */}
          <div className="space-y-4 px-6 py-5">
            {/* 이름 + 성별 */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-gray-500">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="이름 입력"
                />
              </div>
              <div className="w-24">
                <label className="mb-1 block text-xs font-medium text-gray-500">성별</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'M' | 'F')}
                  className={inputClass}
                >
                  <option value="M">남</option>
                  <option value="F">여</option>
                </select>
              </div>
            </div>

            {/* 생일 */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">생일</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* 핸드폰번호 */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">핸드폰번호</label>
              <div className="flex items-center gap-3">
                <input
                  type="tel"
                  placeholder="010-0000-0000"
                  value={phone}
                  disabled={phoneUnknown}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className={`flex-1 ${inputClass} disabled:bg-gray-100 disabled:text-gray-400`}
                />
                <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-gray-500 select-none">
                  <input
                    type="checkbox"
                    checked={phoneUnknown}
                    onChange={(e) => {
                      setPhoneUnknown(e.target.checked);
                      if (e.target.checked) setPhone('');
                    }}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-[#3d8b6e] focus:ring-[#3d8b6e]/30"
                  />
                  번호모름
                </label>
              </div>
            </div>

            {/* 소속 */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">소속</label>
              <div className="flex items-center gap-2">
                <span
                  className={`flex-1 truncate rounded-lg border border-gray-200 px-3 py-2.5 text-sm ${
                    orgName ? 'bg-white text-gray-700' : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  {orgName || '미선택'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 shrink-0 px-4 text-xs"
                  onClick={() => setOrgModalOpen(true)}
                >
                  검색
                </Button>
              </div>
            </div>

            {/* 에러 */}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          {/* 푸터 */}
          <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
            <Button variant="outline" size="sm" onClick={handleClose}>
              취소
            </Button>
            <Button
              size="sm"
              className="bg-[#3d8b6e] text-white hover:bg-[#34765d]"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? '저장 중…' : '저장'}
            </Button>
          </div>
        </div>
      </div>

      {/* 소속 검색 모달 (중첩) */}
      {orgModalOpen && (
        <OrganizationModal
          onSelect={(id, selectedName) => {
            setOrgId(id);
            setOrgName(selectedName);
            setOrgModalOpen(false);
          }}
          onClose={() => setOrgModalOpen(false)}
        />
      )}
    </>
  );
}
