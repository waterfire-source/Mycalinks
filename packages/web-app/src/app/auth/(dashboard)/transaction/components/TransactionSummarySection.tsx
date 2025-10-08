'use client';

import React from 'react';
import { Stack, Box } from '@mui/material';
import { SimpleButtonWithIcon } from '@/components/buttons/SimpleButtonWithIcon';
import { TotalSalesOrPurchases } from '@/app/auth/(dashboard)/transaction/product/components/TotalSalesOrPurchases';
import { HelpIcon } from '@/components/common/HelpIcon';

interface TransactionSummarySectionProps {
  totalAmount: { buy: number; sell: number };
  handleStartDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadClick: () => void;
  isDownloading: boolean;
  isShow: boolean;
}

export const TransactionSummarySection: React.FC<
  TransactionSummarySectionProps
> = ({
  totalAmount,
  handleStartDateChange,
  onDownloadClick,
  isDownloading,
  isShow,
}) => {
  return (
    <Stack direction="row" spacing={1} alignItems="start" sx={{ mt: 2 }}>
      <TotalSalesOrPurchases
        totalAmount={totalAmount}
        type="sell"
        handleStartDateChange={handleStartDateChange}
      />
      <TotalSalesOrPurchases
        totalAmount={totalAmount}
        type="buy"
        handleStartDateChange={handleStartDateChange}
      />

      {isShow && (
        <Box display="flex">
          <SimpleButtonWithIcon
            onClick={onDownloadClick}
            loading={isDownloading}
          >
            CSVダウンロード
          </SimpleButtonWithIcon>

          <HelpIcon helpArchivesNumber={330} />
        </Box>
      )}
    </Stack>
  );
};
