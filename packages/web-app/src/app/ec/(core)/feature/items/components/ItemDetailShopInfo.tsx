'use client';

import { Box, Typography, Stack, Button } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';

interface ItemDetailShopInfoProps {
  seller: {
    id: number;
    name: string;
    description?: string;
  };
}

export const ItemDetailShopInfo = ({ seller }: ItemDetailShopInfoProps) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        ショップ情報
      </Typography>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <StorefrontIcon />
          <Typography variant="body1">{seller.name}</Typography>
        </Stack>
        {seller.description && (
          <Typography variant="body2" color="text.secondary">
            {seller.description}
          </Typography>
        )}
        <Button
          variant="outlined"
          sx={{
            borderColor: '#d32f2f',
            color: '#d32f2f',
            '&:hover': {
              borderColor: '#b71c1c',
              bgcolor: 'rgba(211, 47, 47, 0.04)',
            },
          }}
        >
          ショップの商品マスタを見る
        </Button>
      </Stack>
    </Box>
  );
};
