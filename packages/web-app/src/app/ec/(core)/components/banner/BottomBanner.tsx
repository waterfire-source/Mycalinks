'use client';

import Image from 'next/image';
import { Box, Paper } from '@mui/material';

interface BottomBannerProps {
  image: string;
  alt?: string;
  onClick?: () => void;
  priority?: boolean;
}

export const BottomBanner = ({
  image,
  alt = 'banner',
  onClick,
  priority = false,
}: BottomBannerProps) => {
  return (
    <Box
      sx={{
        mb: 1.5,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        '&:hover': onClick
          ? {
              transform: 'scale(0.99)',
            }
          : {},
        position: 'relative',
        borderRadius: 1,
        overflow: 'hidden',
        aspectRatio: '16/9',
        width: '100%',
      }}
      onClick={onClick}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          position: 'relative',
          borderRadius: 1,
          overflow: 'hidden',
          height: '100%',
          // bgcolor: '#f5f5f5',背景色で誤魔化すのもあり
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${image || '/sample.png'})`,
            backgroundSize: 'contain',
            filter: 'blur(15px)',
            opacity: 0.7,
            zIndex: 0,
          },
        }}
      >
        <Image
          src={image || '/sample.png'}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{
            objectFit: 'contain',
            borderRadius: '4px',
          }}
          priority={priority}
        />
      </Paper>
    </Box>
  );
};

export default BottomBanner;
