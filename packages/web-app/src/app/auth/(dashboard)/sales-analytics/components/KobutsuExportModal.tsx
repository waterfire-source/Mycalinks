'use client';

import { useState } from 'react';
import { Typography, Box, TextField } from '@mui/material';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { ApiError, MycaPosApiClient } from 'api-generator/client';
import dayjs from 'dayjs';

interface KobutsuExportModalProps {
  open: boolean;
  onClose: () => void;
}

export function KobutsuExportModal({ open, onClose }: KobutsuExportModalProps) {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });
  const [isDownloading, setIsDownloading] = useState(false);

  // CSV出力ハンドラ
  const handleKobutsuCsvExport = async () => {
    const { startDate, endDate } = searchDate;

    // 入力値の検証
    const validationError = validateDateRange(startDate, endDate);
    if (validationError) {
      setAlertState({
        message: validationError,
        severity: 'error',
      });
      return;
    }

    setIsDownloading(true);

    try {
      const res = await apiClient.stats.getTransactionStatsCsv({
        storeId: store.id,
        targetDayGte: formatDate(startDate),
        targetDayLte: formatDate(endDate),
      });
      window.location.href = res.fileUrl;
    } catch (e) {
      if (e instanceof ApiError && e.body?.error) {
        setAlertState({
          message: e.body.error,
          severity: 'error',
        });
      } else {
        setAlertState({
          message: '古物台帳出力に失敗しました。',
          severity: 'error',
        });
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // 期間の入力と範囲チェック
  function validateDateRange(start: string, end: string): string | null {
    if (!start || !end) return '期間を入力してください。';

    const startDay = dayjs(start);
    const endDay = dayjs(end);

    if (startDay.isAfter(endDay)) {
      return '開始日は終了日以前にしてください。';
    }

    return null;
  }

  function formatDate(dateStr: string): string {
    return dayjs(dateStr).format('YYYY-MM-DD');
  }

  const [searchDate, setSearchDate] = useState({
    startDate: '',
    endDate: '',
  });

  // 開始日の変更ハンドラ
  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedDate = event.target.value;
    if (selectedDate) {
      setSearchDate((prev) => ({
        ...prev,
        startDate: dayjs(selectedDate).startOf('day').toISOString(),
      }));
    } else {
      // 日付がクリアされた場合、stateを空文字に設定する
      setSearchDate((prev) => ({
        ...prev,
        startDate: '',
      }));
    }
  };

  // 終了日の変更ハンドラ
  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.target.value;
    if (selectedDate) {
      setSearchDate((prev) => ({
        ...prev,
        endDate: dayjs(selectedDate).endOf('day').toISOString(),
      }));
    } else {
      setSearchDate((prev) => ({
        ...prev,
        endDate: '',
      }));
    }
  };

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title="古物台帳出力"
      width="500px"
      height="250px"
      actionButtonText="出力"
      cancelButtonText="キャンセル"
      onActionButtonClick={handleKobutsuCsvExport}
      loading={isDownloading}
    >
      {/* 説明文言 */}
      <Typography variant="body1" sx={{ p: 1, mb: 1 }}>
        出力する期間を指定してください。
      </Typography>

      {/* 日付選択エリア */}
      <Box display="flex" justifyContent="center" alignItems="center">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          {/* 開始日 */}
          <TextField
            type="date"
            size="small"
            value={
              searchDate.startDate
                ? dayjs(searchDate.startDate).format('YYYY-MM-DD')
                : ''
            }
            onChange={handleStartDateChange}
            sx={{ width: 160, backgroundColor: 'white' }}
            InputLabelProps={{
              shrink: true,
              sx: { color: 'black' },
            }}
          />
          <Typography>~</Typography>

          {/* 終了日 */}
          <TextField
            type="date"
            size="small"
            value={
              searchDate.endDate
                ? dayjs(searchDate.endDate).format('YYYY-MM-DD')
                : ''
            }
            onChange={handleEndDateChange}
            sx={{ width: 160, backgroundColor: 'white' }}
            InputLabelProps={{
              shrink: true,
              sx: { color: 'black' },
            }}
          />
        </Box>
      </Box>
    </CustomModalWithIcon>
  );
}
