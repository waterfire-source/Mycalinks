import PrimaryButton from '@/components/buttons/PrimaryButton';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import { useStore } from '@/contexts/StoreContext';
import { useGetSpecialty } from '@/feature/specialty/hooks/useGetSpecialty';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  IconButton,
  Stack,
  TextField,
  Typography,
  Button,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { useCreateOrUpdateSpecialty } from '@/feature/specialty/hooks/useCreateOrUpdateSpecialty';
import { useDeleteSpecialty } from '@/feature/specialty/hooks/useDeleteSpecialty';
import { useAlert } from '@/contexts/AlertContext';

type SpecialtyListItem = { id: string; name: string; specialtyId?: number };

type Props = { open: boolean; onClose: () => void };

export const AppraisalSettingModal = ({ open, onClose }: Props) => {
  const { store } = useStore();
  const { specialties, fetchSpecialty } = useGetSpecialty();
  const { createOrUpdateSpecialty } = useCreateOrUpdateSpecialty();
  const { deleteSpecialty } = useDeleteSpecialty();
  const { setAlertState } = useAlert();

  const [specialtyList, setSpecialtyList] = useState<SpecialtyListItem[]>([]);
  const [isOpenConfirmDialog, setIsOpenConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const syncSpecialty = () => {
    setSpecialtyList(
      specialties.map((s) => ({
        id: uuidV4(),
        name: s.display_name,
        specialtyId: s.id,
      })),
    );
  };

  const addSpecialty = () => {
    setSpecialtyList((prev) => {
      return [...prev, { id: uuidV4(), name: '新規特殊状態' }];
    });
  };

  const deleteSpecialtyList = (id: string) => {
    setSpecialtyList((prev) => prev.filter((s) => s.id !== id));
  };

  const editSpecialty = (
    id: string,
    property: keyof SpecialtyListItem,
    value: string,
  ) => {
    setSpecialtyList((prev) => {
      return prev.map((s) => (s.id === id ? { ...s, [property]: value } : s));
    });
  };

  const onConfirm = async () => {
    try {
      setIsLoading(true);
      // specialties内にあるが、specialtyListにない要素（削除対象）
      const specialtyToDelete = specialties.filter(
        (s) => !specialtyList.some((l) => l.specialtyId === s.id),
      );

      // specialtyListにあるかつspecialtyIdがない要素（作成対象）
      const specialtyToCreate = specialtyList.filter((s) => !s.specialtyId);

      // specialtiesにあるかつspecialtyListにある要素で名前が変更された要素（更新対象）
      const specialtyToUpdate = specialtyList.filter((s) => {
        if (!s.specialtyId) return false;
        const original = specialties.find((orig) => orig.id === s.specialtyId);
        return original && original.display_name !== s.name;
      });

      // 削除処理
      for (const specialty of specialtyToDelete) {
        await deleteSpecialty({ specialty_id: specialty.id });
      }

      // 作成・更新処理（一つのAPIで処理）
      const specialtyToCreateOrUpdate = [...specialtyToCreate, ...specialtyToUpdate];
      for (const specialty of specialtyToCreateOrUpdate) {
        await createOrUpdateSpecialty({
          id: specialty.specialtyId, // undefined なら作成、値があれば更新
          display_name: specialty.name,
          kind: 'APPRAISAL',
        });
      }

      // 再同期
      await fetchSpecialty({ kind: 'APPRAISAL' });
      setIsOpenConfirmDialog(false);
    } catch (err) {
      setAlertState({
        message: '特殊状態の更新に失敗しました。',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialty({ kind: 'APPRAISAL' });
  }, [store.id]);

  useEffect(() => {
    syncSpecialty();
  }, [specialties]);

  return (
    <CustomModalWithHeader
      open={open}
      onClose={onClose}
      title="鑑定設定"
      width="300px"
    >
      <Stack>
        <Stack
          direction="row"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography fontWeight="bold">特殊状態</Typography>
          <Button size="small" onClick={syncSpecialty}>
            リセットする
          </Button>
        </Stack>

        <Stack
          width="100%"
          spacing={1}
          mb={1}
          maxHeight="250px"
          sx={{ overflow: 'auto' }}
        >
          {specialtyList.map((s) => (
            <Box
              key={s.id}
              gap={1}
              width="100%"
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <TextField
                value={s.name}
                onChange={(e) => editSpecialty(s.id, 'name', e.target.value)}
                size="small"
                sx={{
                  flex: 1,
                  '& .MuiInputBase-input': {
                    padding: 0,
                    pl: 1,
                    height: 30,
                    boxSizing: 'border-box',
                  },
                }}
              />
              <IconButton
                onClick={() => deleteSpecialtyList(s.id)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Stack>
        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          size="small"
          onClick={addSpecialty}
        >
          追加
        </Button>
        <PrimaryButton
          sx={{ mt: 1 }}
          onClick={() => setIsOpenConfirmDialog(true)}
          loading={isLoading}
        >
          更新
        </PrimaryButton>
      </Stack>

      {isOpenConfirmDialog && (
        <ConfirmationDialog
          open={isOpenConfirmDialog}
          onClose={() => setIsOpenConfirmDialog(false)}
          title="本当に特殊状態を更新しますか？"
          message="現在設定されている特殊状態を反映します。ここにない特殊状態は削除されます。本当によろしいですか？"
          onConfirm={onConfirm}
          confirmButtonText="更新する"
        />
      )}
    </CustomModalWithHeader>
  );
};
