import React from 'react';
import { Box, Typography, IconButton, Stack } from '@mui/material';
import Image from 'next/image';

interface StockItemProps {
  imageUrl: string;
  title: string;
  condition?: string;
  rarity?: string;
  stock?: number;
  sellPrice?: number;
  buyPrice?: number;
  onDetailClick: () => void;
}

export const StockItem: React.FC<StockItemProps> = ({
  imageUrl,
  title,
  condition = '',
  rarity = '',
  stock = 0,
  sellPrice = 0,
  buyPrice = 0,
  onDetailClick,
}) => {
  return (
    <Stack
      direction={'row'}
      gap={2}
      padding={1}
      sx={{
        width: '100%',
        height: '100%',
      }}
    >
      <Image
        src={imageUrl}
        alt={title}
        width={80}
        height={100}
        style={{ objectFit: 'contain' }}
      />

      <Box sx={{ width: '100%' }}>
        <Typography variant="body1" fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="body2" color="text.primary">
          状態: {condition}
        </Typography>
        <Typography variant="body2" color="text.primary">
          レアリティ: {rarity}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: '4px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              backgroundColor: 'secondary.main',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            販
            <Typography variant="body2" sx={{ marginLeft: '4px' }}>
              ¥{sellPrice.toLocaleString()}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              backgroundColor: 'primary.main',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            買
            <Typography variant="body2" sx={{ marginLeft: '4px' }}>
              ¥{buyPrice.toLocaleString()}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.primary',
              backgroundColor: 'grey.300',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            在
            <Typography variant="body2" sx={{ marginLeft: '4px' }}>
              {stock}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', width: '120px' }}>
        <IconButton
          onClick={onDetailClick}
          sx={{
            backgroundColor: 'grey.200',
            border: '1px solid',
            borderColor: 'grey.600',
            borderRadius: '4px',
            height: '40px',
          }}
        >
          <Typography sx={{ fontSize: '20px' }}>詳細</Typography>
        </IconButton>
      </Box>
    </Stack>
  );
};
