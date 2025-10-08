import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { GenreHandleSelect } from '@/feature/purchaseTable/component/GenreHandleSelect';
import { PurchaseTableResponse } from '@/feature/purchaseTable/hooks/usePurchaseTable';
import { useUpDatePurchaseTable } from '@/feature/purchaseTable/hooks/useUpDatePurchaseTable';
import {
  Checkbox,
  FormControlLabel,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  purchaseTableId: number;
  genreHandle: string | null;
  displayOnApp: boolean;
  fetchPurchaseTable: (
    take?: number,
    skip?: number,
  ) => Promise<PurchaseTableResponse | undefined>;
}
export const PublishNotificationModal = ({
  isOpen,
  onClose,
  genreHandle,
  purchaseTableId,
  displayOnApp,
  fetchPurchaseTable,
}: Props) => {
  const [selectedGenreHandle, setSelectedGenreHandle] = useState<string | null>(
    genreHandle,
  );
  const [isSendPushNotification, setIsSendPushNotification] = useState(false);

  const { upDatePurchaseTable, isLoading } = useUpDatePurchaseTable();

  const handleGenreChange = (event: SelectChangeEvent<string>) => {
    setSelectedGenreHandle(event.target.value);
  };

  const handleUpDate = async () => {
    try {
      await upDatePurchaseTable(purchaseTableId, {
        genre_handle: selectedGenreHandle,
        sendPushNotification: isSendPushNotification,
      });
      // 買取表一覧を再取得
      await fetchPurchaseTable();
      onClose();
      setSelectedGenreHandle(null);
      setIsSendPushNotification(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <CustomModalWithIcon
      open={isOpen}
      onClose={onClose}
      title={displayOnApp ? 'ユーザーに買取表を通知' : 'ユーザーに買取表を公開'}
      onActionButtonClick={handleUpDate}
      actionButtonText={displayOnApp ? '通知' : '公開'}
      cancelButtonText="キャンセル"
      width="350px"
      loading={isLoading}
    >
      <Stack direction="column" spacing={1}>
        <GenreHandleSelect
          inputLabel="ジャンル"
          selectedGenreHandle={selectedGenreHandle || genreHandle}
          onSelect={handleGenreChange}
          sx={{ width: '200px' }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={isSendPushNotification}
              onChange={(e) => setIsSendPushNotification(e.target.checked)}
              color="primary"
            />
          }
          label="ユーザーに通知を送る"
        />
        <Typography
          variant="body2"
          sx={{
            color: 'grey.700',
            fontSize: '0.875rem',
            p: 1,
          }}
        >
          ※ プッシュ通知は1日3回まで送信できます。
        </Typography>
      </Stack>
    </CustomModalWithIcon>
  );
};
