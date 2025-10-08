import { Stack, Typography } from '@mui/material';
import React from 'react';

interface ShopInfo {
  key: string;
  displayName: string;
  icon: string;
  ImageUrl?: string;
}

interface Props {
  shopInfo: ShopInfo[];
  width: number;
  height: number;
  productData?: Record<string, boolean>; // 商品データのフラグ情報
}

export const ShopIcon: React.FC<Props> = ({
  shopInfo,
  width,
  height,
  productData = {},
}) => {
  return (
    <Stack direction="row" spacing={1}>
      {shopInfo.map((shop, index) => {
        // 各ショップの出品状態を個別にチェック
        const isPublished = productData[shop.key] === true;

        return (
          <Typography
            key={index}
            sx={{
              width: width,
              height: height,
              borderRadius: '50%',
              backgroundColor: isPublished ? 'primary.main' : 'white',
              border: '1px solid',
              borderColor: 'grey.300',
              color: isPublished ? 'white' : 'grey.300',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}
          >
            {shop.icon}
          </Typography>
        );
      })}
    </Stack>
  );
};
