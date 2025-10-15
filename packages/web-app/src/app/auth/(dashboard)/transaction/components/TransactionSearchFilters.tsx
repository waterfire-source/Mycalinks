'use client';

import React from 'react';
import { Box, Typography, Grid, TextField } from '@mui/material';
import dayjs from 'dayjs';
import { ListTransactionsSearchState } from '@/app/auth/(dashboard)/transaction/components/TransactionContentsCard';

interface TransactionSearchFiltersProps {
  searchState: ListTransactionsSearchState;
  setSearchState: React.Dispatch<
    React.SetStateAction<ListTransactionsSearchState>
  >;
  searchDate: {
    startDate: string;
    endDate: string;
  };
  handleStartDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TransactionSearchFilters: React.FC<
  TransactionSearchFiltersProps
> = ({
  searchState,
  setSearchState,
  searchDate,
  handleStartDateChange,
  handleEndDateChange,
}) => {
  return (
    <Grid
      container
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: '10px',
        mt: 2,
      }}
    >
      <TextField
        label="商品名"
        size="small"
        value={searchState.searchProductName || ''}
        onChange={(event) =>
          setSearchState((prev) => ({
            ...prev,
            searchProductName: event.target.value,
            searchCurrentPage: 0,
          }))
        }
        sx={{ width: 200, backgroundColor: 'white' }}
        InputLabelProps={{ sx: { color: 'black' } }}
      />
      <TextField
        label="取引ID"
        type="number"
        size="small"
        value={searchState.transactionID || ''}
        onChange={(event) =>
          setSearchState((prev) => ({
            ...prev,
            transactionID: event.target.value,
            searchCurrentPage: 0,
          }))
        }
        sx={{ width: 100, backgroundColor: 'white' }}
        InputLabelProps={{ sx: { color: 'black' } }}
      />
      {/* 日付 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        <TextField
          label="取引日時"
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
    </Grid>
  );
};
