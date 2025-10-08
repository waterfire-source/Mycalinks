'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import Image from 'next/image';
import MembershipCardModal from '@/app/mycalinks/(core)/components/modals/MembershipCardModal';

interface Props {
  barcodeValue: string;
  getBarcodeToken: () => void;
  isLoading?: boolean;
}
export const FixedMyPageButton = ({
  barcodeValue,
  getBarcodeToken,
  isLoading,
}: Props) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const handleFixedButtonClick = () => {
    setIsOpenModal(true);
  };

  // 開くたびにQRトークンを取得する
  useEffect(() => {
    if (isOpenModal) {
      getBarcodeToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpenModal]);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: '70px',
        right: '20px',
        zIndex: 100,
      }}
    >
      <Button
        variant="contained"
        onClick={handleFixedButtonClick}
        sx={{
          bgcolor: '#C1272D',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          minWidth: 'unset',
          p: 0,
          boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
          '&:hover': {
            bgcolor: '#8B1D22',
          },
        }}
      >
        <Stack
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
          spacing={0.5}
        >
          {/* バーコード画像 */}
          <Box sx={{ width: '40px', height: '25px', position: 'relative' }}>
            <Image
              src="/images/logo/barcode.png"
              alt="バーコード"
              fill
              style={{ objectFit: 'contain' }}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{ fontSize: '10px', lineHeight: 1, color: '#fff', mt: '4px' }}
          >
            会員証
          </Typography>
        </Stack>
      </Button>

      {/* 会員証モーダル */}
      <MembershipCardModal
        open={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        barcodeValue={barcodeValue}
        isLoading={isLoading}
      />
    </Box>
  );
};
