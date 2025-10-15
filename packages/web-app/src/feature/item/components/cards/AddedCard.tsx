import React from 'react';
import {
  Box,
  Card,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { ProductDetail } from '@/feature/products/components/ProductDetail';
import DeleteIcon from '@mui/icons-material/Delete';
import { MycaAddItemType } from '@/feature/item/hooks/useMycaCart';

interface Props {
  rows: MycaAddItemType[];
  removeCartMycaItem: (mycaItemId: number) => void;
}

export const AddedCard: React.FC<Props> = ({ rows, removeCartMycaItem }) => {
  console.log('rows', rows);
  return (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '60px',
          padding: '0 16px', // 左右の余白を指定
          borderBottom: '1px solid',
          borderBottomColor: 'grey.300',
        }}
      >
        <Typography
          align="left"
          sx={{
            color: 'black',
          }}
        >
          商品登録リスト
        </Typography>
        <Typography
          align="right"
          sx={{
            color: 'black',
          }}
        >
          {rows.length} 商品
        </Typography>
      </Box>

      <Stack
        gap={2}
        padding={2}
        sx={{
          height: '100%',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
          {rows.map((row) => (
            <>
              <ProductDetail
                imageUrl={row.image_url ?? ''}
                title={row.displayNameWithMeta ?? ''}
                price={row.price}
                genre={row.genre_name}
                category={
                  row.displaytype1?.includes('カード') ? 'カード' : 'ボックス'
                }
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <IconButton
                    aria-label="delete"
                    sx={{ height: 50, width: 50 }}
                    onClick={() => removeCartMycaItem(row.myca_item_id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ProductDetail>
              <Divider sx={{ marginY: 2 }} />
            </>
          ))}
        </Box>
      </Stack>
    </Card>
  );
};
