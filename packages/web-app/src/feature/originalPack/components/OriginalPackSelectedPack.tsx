import React from 'react';
import { Box } from '@mui/material';
import { CustomTable, ColumnDef } from '@/components/tables/CustomTable';
import { ItemImage } from '@/feature/item/components/ItemImage';
import dayjs from 'dayjs';
import {
  OriginalPackItemType,
  OriginalPackProduct,
} from '@/app/auth/(dashboard)/original-pack/page';
import { ItemText } from '@/feature/item/components/ItemText';

interface OriginalPackSelectedPackProps {
  selectedItem: OriginalPackItemType | null;
  originalPackProducts: OriginalPackProduct[];
}

export const OriginalPackSelectedPack: React.FC<
  OriginalPackSelectedPackProps
> = ({ selectedItem, originalPackProducts }) => {
  // CustomTabTable 用のカラム定義
  const columns: ColumnDef<OriginalPackItemType>[] = [
    {
      header: '商品画像',
      render: (item) => (
        <Box width="100%" justifyContent="center" display="flex">
          <Box
            sx={{
              width: 60,
              height: 80,
              alignSelf: 'center',
              alignItems: 'center',
            }}
          >
            <ItemImage imageUrl={item.image_url} height={80} />
          </Box>
        </Box>
      ),
    },
    {
      header: '商品名',
      key: 'display_name',
      render: (item) => <ItemText text={item.display_name || '-'} />,
    },
    {
      header: 'ジャンル',
      key: 'genre_display_name',
      render: (item) => item.genre_display_name || '-',
    },
    {
      header: 'カテゴリ',
      key: 'category_display_name',
      render: (item) => item.category_display_name || '-',
    },
    {
      header: '作成日',
      key: 'created_at',
      render: (item) =>
        item.created_at ? dayjs(item.created_at).format('YYYY/MM/DD') : '-',
    },
    {
      header: '単価',
      key: 'sell_price',
      render: (item) =>
        item.sell_price ? `¥${item.sell_price.toLocaleString()}` : '￥0',
    },
    //仕入れ単価はオリパを1つ作るためにかかった仕入れ値合計
    {
      header: '仕入れ単価',
      key: 'purchase_price',
      render: (item) => {
        if (item.infinite_stock) return '-';
        //仕入れ値合計
        const purchaseSum = originalPackProducts.reduce((prev, current) => {
          const targetProductCount = item?.original_pack_products?.find(
            (product) => product.product_id === current.id,
          )?.item_count;

          if (targetProductCount)
            return prev + current.mean_wholesale_price * targetProductCount;
          else return prev;
        }, 0);

        if (item.init_stock_number === 0 || purchaseSum === 0) return '-';

        //作成した数で割る(小数点以下切り捨て)
        return `¥${Math.floor(
          purchaseSum / (item.init_stock_number || 1),
        ).toLocaleString()}`;
      },
    },
    //還元率はオリパ一つを作るために必要な商品の売上合計 / オリパの売り上げ
    {
      header: '還元率',
      key: 'refund_rate',
      render: (item) => {
        if (item.infinite_stock) return '-';
        //ばらで売った場合の売上合計
        const productsSalesSum = originalPackProducts.reduce(
          (prev, current) => {
            const targetProductCount = item?.original_pack_products?.find(
              (product) => product.product_id === current.id,
            )?.item_count;

            if (targetProductCount)
              return (
                prev + (current.actual_sell_price || 0) * targetProductCount
              );
            else return prev;
          },
          0,
        );

        //オリパの売上合計
        //ここは現時点での売上なのか、すべて売れた場合の売上なのか？
        const originalPackSalesSum =
          item.sell_price * (item.init_stock_number || 0);
        if (originalPackSalesSum === 0 || productsSalesSum === 0) return '-';

        return `${Math.floor(
          (productsSalesSum / originalPackSalesSum) * 100,
        ).toFixed(0)}%`;
      },
    },
    //原価率はオリパ一つを作るために必要な商品の仕入れ値合計 / オリパの売り上げ
    {
      header: '原価率',
      key: 'cost_rate',
      render: (item) => {
        //仕入れ値合計
        const purchaseSum = originalPackProducts.reduce((prev, current) => {
          const targetProductCount = item?.original_pack_products?.find(
            (product) => product.product_id === current.id,
          )?.item_count;

          if (targetProductCount)
            return prev + current.mean_wholesale_price * targetProductCount;
          else return prev;
        }, 0);

        //オリパの売上合計
        //ここは現時点での売上なのか、すべて売れた場合の売上なのか？
        const originalPackSalesSum =
          item.sell_price * (item.init_stock_number || 0);

        if (purchaseSum === 0 || originalPackSalesSum === 0) return '-';

        const costRate = (purchaseSum / originalPackSalesSum) * 100;
        const costRateRounded = costRate.toFixed(2); // 小数第2位までの文字列

        return costRateRounded === '0.00'
          ? '極めて低'
          : `${Number(costRateRounded).toLocaleString()}%`;
      },
    },
    {
      header: '販売数',
      key: 'init_stock_number',
      render: (item) =>
        (item.init_stock_number || 0) - (item.products_stock_number || 0),
    },
    {
      header: '在庫数',
      key: 'products_stock_number',
      render: (item) => item.products_stock_number ?? '-',
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
      <CustomTable<OriginalPackItemType>
        columns={columns}
        rows={selectedItem ? [selectedItem] : []}
        isLoading={false}
        rowKey={(item) => item.id}
        sx={{
          borderBottomRightRadius: '8px',
          borderBottomLeftRadius: '8px',
        }}
      />
    </Box>
  );
};
