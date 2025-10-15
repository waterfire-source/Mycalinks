'use client';

import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { PosCustomerInfo } from '@/app/mycalinks/(core)/types/customer';

interface StoreSelectionProps {
  selectedStore: PosCustomerInfo | null;
  onStoreChangeClick: () => void;
}

export const StoreSelection: React.FC<StoreSelectionProps> = ({
  selectedStore,
  onStoreChangeClick,
}) => {
  return (
    <Paper
      elevation={1}
      sx={{ borderRadius: 1, backgroundColor: 'grey.50', overflow: 'auto' }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1,
          borderRadius: '8px',
          mt: 1,
          mb: 1,
        }}
      >
        {selectedStore ? (
          <Box display="flex" alignItems="center">
            <Box
              component="img"
              src={
                selectedStore?.store?.receipt_logo_url ||
                '/images/ec/noimage.png'
              }
              alt="store logo"
              sx={{
                width: 30,
                height: 30,
                objectFit: 'contain',
                mr: 1,
              }}
            />
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
              選択店舗 {selectedStore?.store?.display_name}
            </Typography>
          </Box>
        ) : (
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
            選択店舗 全て
          </Typography>
        )}

        <Button
          variant="contained"
          size="small"
          onClick={onStoreChangeClick}
          sx={{
            bgcolor: '#aaaaaa',
            color: 'white',
            minWidth: '60px',
            height: '30px',
            borderRadius: '4px',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#999999',
              boxShadow: 'none',
            },
          }}
        >
          変更
        </Button>
      </Box>
    </Paper>
  );
};
