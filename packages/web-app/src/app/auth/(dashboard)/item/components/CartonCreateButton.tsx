import { createClientAPI, CustomError } from '@/api/implement';
import { useCheckBoxInfo } from '@/app/auth/(dashboard)/stock/hooks/useCheckBoxInfo';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { Box, Typography } from '@mui/material';
import { MycaPosApiClient } from 'api-generator/client';
import { useState } from 'react';

type Dialogs = 'create' | 'edit' | undefined;

type Props = { itemId: number };

export const CartonCreateButton = ({ itemId }: Props) => {
  const { store } = useStore();
  const { itemInfo, productType } = useCheckBoxInfo({ itemId, enabled: true });
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();

  const [loading, setLoading] = useState(false);
  const [whichDialogIsOpen, setWhichDialogIsOpen] =
    useState<Dialogs>(undefined);
  const [boxCountPerCarton, setBoxCountPerCarton] = useState(1);

  const apiClient = createClientAPI();

  const mycaPosApiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });

  const onClose = () => setWhichDialogIsOpen(undefined);

  const onClickButton = () => {
    itemInfo?.carton_item_id
      ? setWhichDialogIsOpen('edit')
      : setWhichDialogIsOpen('create');
  };

  const buttonText = itemInfo?.carton_item_id
    ? 'カートン内ボックス数変更'
    : 'カートンマスタを作成';

  const handleCreateCarton = async () => {
    try {
      setLoading(true);
      const res = await mycaPosApiClient.item.createCartonItem({
        storeId: store.id,
        itemId: itemId,
        requestBody: { box_pack_count: boxCountPerCarton },
      });

      if (res instanceof CustomError) throw res;

      setAlertState({
        message: 'カートンの作成に成功しました',
        severity: 'success',
      });
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCarton = async () => {
    try {
      setLoading(true);
      if (!itemInfo?.carton_item_id) return;
      const res = await apiClient.item.update({
        storeID: store.id,
        itemID: itemInfo?.carton_item_id,
        body: { box_pack_count: boxCountPerCarton },
      });

      if (res instanceof CustomError) throw res;

      setAlertState({
        message: 'カートン数の変更に成功しました',
        severity: 'success',
      });
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    productType === 'BOX' && (
      <Box
        sx={{
          mt: '20px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <SecondaryButton onClick={onClickButton}>{buttonText}</SecondaryButton>
        <ConfirmationDialog
          open={whichDialogIsOpen === 'create'}
          onClose={onClose}
          title="カートンマスタを作成"
          onCancel={onClose}
          confirmButtonLoading={loading}
          onConfirm={handleCreateCarton}
          confirmButtonText="作成する"
          content={
            <Box>
              <Typography sx={{ fontWeight: 'bold', mb: '40px' }}>
                このボックスに紐付けられたカートン管理用の商品マスタを作成しますか？
              </Typography>
              <NumericTextField
                value={boxCountPerCarton}
                min={1}
                onChange={(e) => setBoxCountPerCarton(e)}
                suffixSx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}
                startSuffix="1カートン"
                endSuffix="ボックス入り"
              />
            </Box>
          }
        />
        <ConfirmationDialog
          open={whichDialogIsOpen === 'edit'}
          onClose={onClose}
          title="カートン内ボックス数変更"
          onConfirm={handleEditCarton}
          confirmButtonLoading={loading}
          confirmButtonText="変更する"
          content={
            <Box>
              <NumericTextField
                value={boxCountPerCarton}
                min={1}
                onChange={(e) => setBoxCountPerCarton(e)}
                suffixSx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}
                startSuffix="1カートン"
                endSuffix="ボックス入り"
              />
            </Box>
          }
        />
      </Box>
    )
  );
};
