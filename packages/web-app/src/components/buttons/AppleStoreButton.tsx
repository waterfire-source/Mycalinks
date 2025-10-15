'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@mui/material';

export const AppleStoreButton: React.FC = () => {
  return (
    <Link
      href="https://apps.apple.com/us/app/mycalinks-%E3%83%88%E3%83%AC%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E3%82%AB%E3%83%BC%E3%83%89%E3%82%B2%E3%83%BC%E3%83%A0%E7%AE%A1%E7%90%86%E3%82%A2%E3%83%97%E3%83%AA/id6447933197"
      target="_blank"
      rel="noopener"
      sx={{ display: 'inline-block' }}
    >
      <Image
        src="/appleStoreDownloadLogo.svg"
        alt="Download on the App Store"
        width={120}
        height={40}
      />
    </Link>
  );
};
