'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import Barcode from 'react-barcode';
import { GooglePlayButton } from '@/components/buttons/GooglePlayButton';
import { AppleStoreButton } from '@/components/buttons/AppleStoreButton';
import Image from 'next/image';

interface BarcodeDisplayProps {
  code: string;
}

export const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({ code }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        width: '100%',
        paddingX: 2,
      }}
    >
      <Box
        sx={{
          border: '2px solid',
          borderColor: 'primary.main',
          padding: 2,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography
          sx={{
            fontSize: '14px',
            color: 'primary.main',
            textAlign: 'center',
            mb: 2,
          }}
        >
          こちらのバーコードを表示の上
          <br />
          レジまでお越しください
        </Typography>
        <Barcode value={code} width={2} height={100} displayValue={false} />
        <Typography>{code.toString()}</Typography>
      </Box>

      <Typography sx={{ fontSize: '14px', textAlign: 'center', mt: 4, mb: 2 }}>
        アプリDLで次回入力の手間を省略！
      </Typography>
      <Image
        src="/images/logo/app_logo.png"
        alt="Mycalinks"
        height={40}
        width={160}
        priority
      />
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <GooglePlayButton />
        <AppleStoreButton />
      </Box>
    </Box>
  );
};

export default BarcodeDisplay;
