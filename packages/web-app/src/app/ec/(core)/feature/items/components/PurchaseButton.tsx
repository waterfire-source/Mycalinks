'use client';

import { Button, Typography } from '@mui/material';
import { DetailItem } from '@/app/ec/(core)/feature/items/types';

interface PurchaseButtonProps {
  item: DetailItem;
}

export const PurchaseButton = ({ item }: PurchaseButtonProps) => {
  const handlePurchase = () => {
    // 購入処理を実装
    console.log('購入処理:', item);
  };

  return (
    <Button
      variant="contained"
      fullWidth
      onClick={handlePurchase}
      disabled={item.stock === 0}
      sx={{
        bgcolor: '#d32f2f',
        '&:hover': { bgcolor: '#b71c1c' },
        py: 1.5,
      }}
    >
      <Typography variant="h3" color="white">
        {item.stock > 0 ? '購入する' : '在庫なし'}
      </Typography>
    </Button>
  );
};
