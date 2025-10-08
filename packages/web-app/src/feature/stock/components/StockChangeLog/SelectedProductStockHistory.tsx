import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { Box } from '@mui/material';
import { Product } from '@prisma/client';
import React from 'react';

interface Props {
  productId: number;
  selectedProduct: any;
  isLoading: boolean;
}

interface SelectedProductStockHistoryType extends Product {
  item_genre_display_name?: string;
  condition_option_display_name?: string;
}

export const SelectedProductStockHistory: React.FC<Props> = ({
  selectedProduct,
  isLoading,
}) => {
  const columns: ColumnDef<SelectedProductStockHistoryType>[] = [
    {
      header: '商品画像',
      render: (product) => (
        <Box width="100%" justifyContent="center" display="flex">
          <Box
            sx={{
              width: 60,
              height: 80,
              alignSelf: 'center',
              alignItems: 'center',
            }}
          >
            <ItemImage imageUrl={product?.image_url} height={80} />
          </Box>
        </Box>
      ),
    },
    {
      header: '商品',
      key: 'display_name',
      render: (product) => <ItemText text={product?.display_name ?? '-'} />,
    },
    {
      header: 'ジャンル',
      key: 'genre_display_name',
      render: (product) => product?.item_genre_display_name ?? '-',
    },
    {
      header: '状態',
      key: 'status',
      render: (product) => product?.condition_option_display_name ?? '-',
    },
    {
      header: '販売価格',
      key: 'sell_price',
      render: (product) =>
        product?.actual_sell_price?.toLocaleString() + '円' || '-',
    },
    {
      header: '買取価格',
      key: 'sell_price',
      render: (product) =>
        product?.actual_buy_price?.toLocaleString() + '円' || '-',
    },
    {
      header: '在庫数',
      key: 'stock_number',
      render: (product) => product?.stock_number ?? '-',
    },
  ];
  return (
    <Box
      sx={{
        borderTop: '8px solid',
        borderTopColor: 'primary.main',
        height: '152px',
      }}
    >
      <CustomTable<SelectedProductStockHistoryType>
        columns={columns}
        rows={selectedProduct || []}
        isLoading={isLoading}
        rowKey={(item) => item?.id}
        sx={{
          borderBottomRightRadius: '8px',
          borderBottomLeftRadius: '8px',
        }}
      />
    </Box>
  );
};
