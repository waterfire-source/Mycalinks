import React, { useState } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { SquareLocationSelect } from '@/feature/square/components/SquareLocationSelect';
import { useUpdateStoreInfo } from '@/feature/store/hooks/useUpdateStoreInfo';
import { useAlert } from '@/contexts/AlertContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  storeId: number;
  currentLocationId?: string;
}

export const SquareLocationSelectModal: React.FC<Props> = ({
  isOpen,
  onClose,
  storeId,
  currentLocationId = '',
}) => {
  const [squareLocationId, setSquareLocationId] = useState(currentLocationId);
  const [isLoading, setIsLoading] = useState(false);
  const { updateStoreInfo } = useUpdateStoreInfo();
  const { setAlertState } = useAlert();

  /**
   * Squareロケーション情報を更新する
   */
  const handleUpdateSquareLocation = async () => {
    if (!squareLocationId) {
      setAlertState({
        message: 'Squareロケーションを選択してください',
        severity: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateStoreInfo({ squareLocationId: squareLocationId }, storeId);

      setAlertState({
        message: 'Squareロケーションを更新しました',
        severity: 'success',
      });
      onClose();
    } catch (error) {
      console.error('Error updating Square location:', error);
      setAlertState({
        message: 'Squareロケーションの更新に失敗しました',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * モーダルが閉じられる際にステートをリセット
   */
  const handleClose = () => {
    setSquareLocationId(currentLocationId);
    onClose();
  };

  return (
    <CustomModalWithIcon
      open={isOpen}
      onClose={handleClose}
      title="Squareロケーション設定"
      onActionButtonClick={handleUpdateSquareLocation}
      actionButtonText="更新"
      cancelButtonText="キャンセル"
      width="600px"
      loading={isLoading}
    >
      <Box sx={{ p: 2 }}>
        <Stack gap={1}>
          <Typography variant="body1">Squareロケーションを選択</Typography>
          <SquareLocationSelect
            value={squareLocationId}
            onChange={(value) => setSquareLocationId(value)}
          />
        </Stack>
      </Box>
    </CustomModalWithIcon>
  );
};
