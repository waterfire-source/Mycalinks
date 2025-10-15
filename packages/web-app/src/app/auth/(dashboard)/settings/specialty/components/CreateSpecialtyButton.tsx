import SecondaryButton from '@/components/buttons/SecondaryButton';
import { SpecialtyKind } from '@prisma/client';
import { useAlert } from '@/contexts/AlertContext';
import { useCreateOrUpdateSpecialty } from '@/feature/specialty/hooks/useCreateOrUpdateSpecialty';
interface Props {
  fetchSpecialty: () => void;
  kind: SpecialtyKind;
}
export const CreateSpecialtyButton = ({ fetchSpecialty, kind }: Props) => {
  const { createOrUpdateSpecialty, isLoading } = useCreateOrUpdateSpecialty();
  const { setAlertState } = useAlert();
  const title =
    kind === SpecialtyKind.APPRAISAL
      ? '鑑定結果'
      : kind === SpecialtyKind.NORMAL
      ? 'その他の特殊状態'
      : '';
  const createAppraisal = async () => {
    try {
      await createOrUpdateSpecialty({
        id: undefined,
        display_name: `${title}(名前を変更してください)`,
        kind,
      });
      fetchSpecialty();
      setAlertState({
        message: `${title}を作成しました`,
        severity: 'success',
      });
    } catch (error) {
      setAlertState({
        message: `${title}を作成できませんでした`,
        severity: 'error',
      });
    }
  };
  return (
    <SecondaryButton onClick={createAppraisal} loading={isLoading}>
      特殊状態を追加
    </SecondaryButton>
  );
};
