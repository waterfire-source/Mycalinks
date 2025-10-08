'use client';

import { Box, Paper, Typography, Stack } from '@mui/material';
import Image from 'next/image';
import { DetailItem } from '@/app/ec/(core)/feature/items/types';

interface ItemDetailCardProps {
  item: DetailItem;
}

export const ItemDetailCard = ({ item }: ItemDetailCardProps) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.7rem',
          borderRadius: 0.5,
          p: '2px 4px',
          border: '1px solid #f0f0f0',
        }}
      >
        {item.condition.label}
      </Typography>
      <Stack spacing={2}>
        {/* 商品画像 */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1/1',
            bgcolor: 'white',
          }}
        >
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </Box>

        {/* 商品情報 */}
        <Box>
          <Typography variant="h6" gutterBottom>
            {item.name}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h5" color="error" fontWeight="bold">
              {item.price.toLocaleString()}円
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};
