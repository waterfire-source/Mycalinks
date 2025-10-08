import { Specialties } from '@/feature/specialty/hooks/useGetSpecialty';
import { Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useCreateOrUpdateSpecialty } from '@/feature/specialty/hooks/useCreateOrUpdateSpecialty';
import { useAlert } from '@/contexts/AlertContext';
import { DeleteButton } from '@/components/buttons/DeleteButton';
import { useDeleteSpecialty } from '@/feature/specialty/hooks/useDeleteSpecialty';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { SpecialtyKind } from '@prisma/client';
interface Props {
  specialty: Specialties[number];
  fetchSpecialty: () => void;
  kind: SpecialtyKind;
}

export const SpecialtyInput = ({ specialty, fetchSpecialty, kind }: Props) => {
  const [displayName, setDisplayName] = useState(specialty.display_name);
  const { createOrUpdateSpecialty, isLoading: isUpdating } =
    useCreateOrUpdateSpecialty();
  const { setAlertState } = useAlert();
  const title =
    kind === SpecialtyKind.APPRAISAL
      ? '鑑定結果'
      : kind === SpecialtyKind.NORMAL
      ? 'その他の特殊状態'
      : '';
  const handleUpdate = async () => {
    try {
      await createOrUpdateSpecialty({
        id: specialty.id,
        display_name: displayName,
        kind,
      });
      setAlertState({
        message: `${title}を更新しました`,
        severity: 'success',
      });
      fetchSpecialty();
    } catch (error) {
      setAlertState({
        message: `${title}を更新できませんでした`,
        severity: 'error',
      });
    }
  };
  const { deleteSpecialty, isLoading: isDeleting } = useDeleteSpecialty();
  const handleDelete = async () => {
    try {
      await deleteSpecialty({
        specialty_id: specialty.id,
      });
      setAlertState({
        message: `${title}を削除しました`,
        severity: 'success',
      });
      fetchSpecialty();
    } catch (error) {
      setAlertState({
        message: `${title}を削除できませんでした`,
        severity: 'error',
      });
    }
  };
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Stack direction="row" gap={1} width="100%">
      <TextField
        value={displayName}
        size="small"
        onChange={(e) => {
          setDisplayName(e.target.value);
        }}
        onBlur={() => {
          handleUpdate();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleUpdate();
          }
        }}
        disabled={isUpdating}
        sx={{ flex: 1 }}
      />
      <DeleteButton
        onClick={() => {
          setIsOpen(true);
        }}
        disabled={isDeleting}
      />
      <ConfirmationDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title={`${title}を削除しますか？`}
        message={`${title}を削除すると、${title}を表示することができなくなります。`}
        confirmButtonText="削除する"
        cancelButtonText="キャンセル"
      />
    </Stack>
  );
};
