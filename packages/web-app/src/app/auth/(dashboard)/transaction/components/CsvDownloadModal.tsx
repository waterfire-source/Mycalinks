'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  CircularProgress,
} from '@mui/material';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';

interface CsvDownloadModalProps {
  open: boolean;
  onClose: () => void;
  transactionType: 'sell' | 'buy' | 'return' | 'all';
  onTransactionTypeChange: (type: 'sell' | 'buy' | 'return' | 'all') => void;
  onDownload: () => void;
  isDownloading: boolean;
}

export const CsvDownloadModal: React.FC<CsvDownloadModalProps> = ({
  open,
  onClose,
  transactionType,
  onTransactionTypeChange,
  onDownload,
  isDownloading,
}) => {
  return (
    <CustomModalWithHeader
      open={open}
      onClose={onClose}
      title="CSVダウンロード"
      width={400}
      dataTestId="csv-download-modal"
    >
      <Box>
        <Typography variant="body2" sx={{ mb: 3 }}>
          ダウンロードする取引の種類を選択してください
        </Typography>
        <RadioGroup
          value={transactionType}
          onChange={(e) =>
            onTransactionTypeChange(
              e.target.value as 'sell' | 'buy' | 'return' | 'all',
            )
          }
          sx={{ mb: 3 }}
        >
          <FormControlLabel
            value="all"
            control={<Radio />}
            label="すべての取引"
          />
          <FormControlLabel value="sell" control={<Radio />} label="販売のみ" />
          <FormControlLabel value="buy" control={<Radio />} label="買取のみ" />
          <FormControlLabel
            value="return"
            control={<Radio />}
            label="返品取引のみ"
          />
        </RadioGroup>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onClose} variant="outlined">
            キャンセル
          </Button>
          <Button
            onClick={onDownload}
            variant="contained"
            disabled={isDownloading}
            sx={{ minWidth: 120 }}
          >
            {isDownloading ? (
              <CircularProgress size={20} sx={{ color: 'white' }} />
            ) : (
              'ダウンロード'
            )}
          </Button>
        </Stack>
      </Box>
    </CustomModalWithHeader>
  );
};
