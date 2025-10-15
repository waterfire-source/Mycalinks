'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@mui/material';

export const GooglePlayButton: React.FC = () => {
  return (
    <Link
      href="https://play.google.com/store/apps/details?id=com.kimura_0531.myca&hl=ja"
      target="_blank"
      rel="noopener"
      sx={{ display: 'inline-block' }}
    >
      <Image
        src="/googlePlayDownloadLogo.png"
        alt="Get it on Google Play"
        width={135}
        height={40}
      />
    </Link>
  );
};
