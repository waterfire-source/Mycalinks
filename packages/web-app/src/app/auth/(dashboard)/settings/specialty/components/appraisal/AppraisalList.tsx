import { useGetSpecialty } from '@/feature/specialty/hooks/useGetSpecialty';
import { CreateSpecialtyButton } from '@/app/auth/(dashboard)/settings/specialty/components/CreateSpecialtyButton';
import { Card, Skeleton, Stack, Typography } from '@mui/material';
import { useEffect, useCallback } from 'react';
import { SpecialtyInput } from '@/app/auth/(dashboard)/settings/specialty/components/SpecialtyInput';
import { SpecialtyKind } from '@prisma/client';
import {
  CustomDndTable,
  DndColumnDef,
} from '@/components/tables/CustomDndTable';
import { useCreateOrUpdateSpecialty } from '@/feature/specialty/hooks/useCreateOrUpdateSpecialty';
import { useAlert } from '@/contexts/AlertContext';
export const AppraisalList = () => {
  const { specialties, isLoading, fetchSpecialty } = useGetSpecialty();
  const { createOrUpdateSpecialty } = useCreateOrUpdateSpecialty();
  const { setAlertState } = useAlert();

  const fetchAppraisalSpecialty = useCallback(() => {
    fetchSpecialty({ kind: SpecialtyKind.APPRAISAL });
  }, [fetchSpecialty]);

  useEffect(() => {
    fetchAppraisalSpecialty();
  }, [fetchAppraisalSpecialty]);

  const columns: DndColumnDef<(typeof specialties)[number]>[] = [
    {
      header: '鑑定結果名',
      key: 'display_name',
      render: (specialty) => (
        <SpecialtyInput
          specialty={specialty}
          fetchSpecialty={fetchAppraisalSpecialty}
          kind={SpecialtyKind.APPRAISAL}
        />
      ),
    },
  ];

  const handleRowOrderChange = async (newRows: typeof specialties) => {
    try {
      await Promise.all(
        newRows.map(async (specialty, index) => {
          await createOrUpdateSpecialty({
            id: specialty.id,
            display_name: specialty.display_name,
            kind: specialty.kind,
            order_number: index + 1,
          });
        }),
      );
      setAlertState({
        message: '鑑定結果の並び順を更新しました',
        severity: 'success',
      });
    } catch (error) {
      console.error('エラーが発生しました: ', error);
      setAlertState({
        message: 'エラーが発生しました',
        severity: 'error',
      });
    }
  };

  return (
    <Stack gap={1}>
      <Typography variant="h1">鑑定結果</Typography>
      <Card sx={{ p: 2 }}>
        <Stack width="100%" gap={1}>
          {isLoading ? (
            <Skeleton variant="rounded" height={40} />
          ) : (
            <CustomDndTable
              rows={specialties}
              columns={columns}
              rowKey={(specialty) => specialty.id}
              onRowOrderChange={handleRowOrderChange}
              withDndProvider={false}
            />
          )}
          <CreateSpecialtyButton
            fetchSpecialty={fetchAppraisalSpecialty}
            kind={SpecialtyKind.APPRAISAL}
          />
        </Stack>
      </Card>
    </Stack>
  );
};
