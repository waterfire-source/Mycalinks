'use client';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { Stocking } from '@prisma/client';
import { useState } from 'react';

interface CsvOptionModalProps {
  open: boolean;
  onClose: () => void;
  onDownload: (status?: Stocking['status']) => void;
  loading: boolean;
  dateRange: {
    startDate?: string | null;
    endDate?: string | null;
  };
}

export const CsvOptionModal = ({
  open,
  onClose,
  onDownload,
  loading,
  dateRange,
}: CsvOptionModalProps) => {
  const [selectedStatus, setSelectedStatus] = useState<
    Stocking['status'] | 'ALL'
  >('ALL');

  const handleDownload = () => {
    const status = selectedStatus === 'ALL' ? undefined : selectedStatus;
    onDownload(status as Stocking['status']);
  };

  const statusOptions = [
    { value: 'ALL', label: 'すべて' },
    { value: 'NOT_YET', label: '未納品' },
    { value: 'FINISHED', label: '納品済み' },
    { value: 'CANCELED', label: 'キャンセル' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>入荷CSVダウンロード設定</DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            対象期間
          </Typography>
          <Typography variant="body1">
            {dateRange.startDate || '指定なし'} 〜{' '}
            {dateRange.endDate || '指定なし'}
          </Typography>
        </Box>

        <FormControl component="fieldset">
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            ステータス
          </Typography>
          <RadioGroup
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value as Stocking['status'] | 'ALL')
            }
          >
            {statusOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          キャンセル
        </Button>
        <Button
          onClick={handleDownload}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? 'ダウンロード中...' : 'ダウンロード'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
