import { useGetRelationToStore } from '@/app/auth/(dashboard)/store-shipment/hooks/useGetRelationToStore';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { PATH } from '@/constants/paths';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { MenuItem, Select, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Props = { isOpen: boolean; onClose: () => void };

export const CreateShipmentModal = ({ isOpen, onClose }: Props) => {
  const { store } = useStore();
  const { push } = useRouter();
  const { setAlertState } = useAlert();
  const { fetchRelationToStore, storeRelations } = useGetRelationToStore();

  const [selectedStoreId, setSelectedStoreId] = useState<number>(0);

  const pushRegisterPage = () => {
    if (selectedStoreId === 0)
      return setAlertState({
        message: '出荷先を選択して下さい',
        severity: 'error',
      });
    push(PATH.STORESHIPMENT.create(selectedStoreId));
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchRelationToStore();
  }, [store.id, isOpen]);

  return (
    <ConfirmationDialog
      title="出荷先を選択"
      onClose={onClose}
      open={isOpen}
      onConfirm={pushRegisterPage}
      confirmButtonText="出荷内容を登録する"
      content={
        <>
          <Typography>
            選択肢にない場合は状態等の紐付けが完了していない可能性があります。先に状態等の紐付けを行なって下さい
          </Typography>
          <Stack sx={{ width: '100%', mt: '10px' }}>
            <Select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(Number(e.target.value))}
            >
              <MenuItem value={0}>出荷先を選択</MenuItem>
              {storeRelations?.map((r) => (
                <MenuItem key={r.to_store_id} value={r.to_store_id}>
                  {r.to_store.display_name}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </>
      }
    />
  );
};
