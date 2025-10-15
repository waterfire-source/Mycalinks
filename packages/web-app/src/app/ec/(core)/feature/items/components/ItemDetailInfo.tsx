'use client';

import { Box, Typography, Stack } from '@mui/material';
import { Item } from '@/app/ec/(core)/constants/items';

interface ItemDetailInfoProps {
  item: Item;
}

export const ItemDetailInfo = ({ item }: ItemDetailInfoProps) => {
  const details = [
    { label: '商品番号', value: item.modelNumber },
    { label: 'レアリティ', value: item.rarity },
    { label: '在庫数', value: `${item.stock}点` },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        商品詳細
      </Typography>
      <Stack spacing={1.5}>
        {details.map((detail) => (
          <Stack
            key={detail.label}
            direction="row"
            justifyContent="space-between"
            sx={{ py: 0.5 }}
          >
            <Typography variant="body2" color="text.secondary">
              {detail.label}
            </Typography>
            <Typography variant="body2">{detail.value}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};
