'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { GooglePlayButton } from '@/components/buttons/GooglePlayButton';
import { AppleStoreButton } from '@/components/buttons/AppleStoreButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';

interface DownloadLinksProps {
  onNext: () => void;
  isReservation?: boolean;
}

export const DownloadLinks: React.FC<DownloadLinksProps> = ({
  onNext,
  isReservation = false,
}) => {
  const target = isReservation ? '予約' : '買取';
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography
        sx={{ color: 'primary.main', fontSize: '14px', textAlign: 'center' }}
      >
        アプリから{target}情報を登録
        <br />
        (次回以降の{target}が簡単になります！)
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <GooglePlayButton />
        <AppleStoreButton />
      </Box>
      <SecondaryButton sx={{ mt: 4 }} onClick={onNext}>
        アプリに登録せず
        {target}
      </SecondaryButton>
    </Box>
  );
};
