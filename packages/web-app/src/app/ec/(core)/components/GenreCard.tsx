'use client';

import { Card, CardContent, Typography } from '@mui/material';
import Image from 'next/legacy/image';

interface GenreCardProps {
  title: string;
  image: string;
  onClick?: () => void;
}

export const GenreCard = ({ title, image, onClick }: GenreCardProps) => {
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = '/images/ec/noimage.png';
  };

  return (
    <Card
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 100,
        width: '100%',
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)',
        },
        bgcolor: 'white',
      }}
      onClick={onClick}
    >
      <div
        style={{
          position: 'relative',
          width: 60,
          height: 60,
          minWidth: 60,
          marginLeft: 8,
        }}
      >
        <Image
          src={image || '/images/ec/noimage.png'}
          alt={title}
          width={60}
          height={60}
          layout="responsive"
          objectFit="contain"
          unoptimized={true}
          onError={handleImageError}
        />
      </div>
      <CardContent
        sx={{
          px: 2,
          py: 1,
          '&:last-child': { pb: 1 },
          width: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="body2"
          component="div"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.4,
            height: 'auto',
            maxHeight: '2.8em',
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};
