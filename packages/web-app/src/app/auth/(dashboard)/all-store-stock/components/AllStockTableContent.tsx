import { ItemImage } from '@/feature/item/components/ItemImage';
import { InfiniteScrollTable } from '@/components/tables/InfiniteScrollTable';
import { AllStoreProduct } from '@/feature/products/hooks/useGetAllStoreProducts';
import { GridColDef } from '@mui/x-data-grid';
import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { ItemText } from '@/feature/item/components/ItemText';
import { Chip } from '@/components/chips/Chip';
import { grey } from '@mui/material/colors';

type GroupedProduct = AllStoreProduct & {
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  groupSize: number;
};

type Props = {
  groupedProducts: GroupedProduct[];
  loadMoreItems: () => void;
  hasMore: boolean;
  loading: boolean;
};

export const AllStockTableContent = ({
  groupedProducts,
  loadMoreItems,
  hasMore,
  loading,
}: Props) => {
  // テーブルカラム定義
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'image_url',
        headerName: '画像',
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => {
          const row = params.row as GroupedProduct;
          if (!row.isFirstInGroup) return;
          return <ItemImage imageUrl={row.image_url || ''} />;
        },
      },
      {
        field: 'display_name',
        headerName: '商品名',
        width: 250,
        renderCell: (params) => {
          const row = params.row as GroupedProduct;

          if (!row.isFirstInGroup) {
            return null;
          }

          const consignmentName = row.consignment_client?.full_name;
          const displayName = row.displayNameWithMeta || '';
          // 現在のAPI構造では詳細なジャンル/カテゴリ情報は含まれていない
          const genreDisplayName = 'ジャンル';
          const categoryDisplayName =
            row.condition_option?.display_name || '状態未設定';

          return (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              justifyContent="center"
              height={'100%'}
            >
              <Box marginBottom="4px" width="100%">
                <ItemText text={displayName} />
                {consignmentName && (
                  <ItemText
                    sx={{ color: grey[700], fontSize: '12px' }}
                    text={`委託者:${consignmentName}`}
                  />
                )}
              </Box>
              {row.management_number !== null && (
                <Typography variant="caption" mb="4px">
                  管理番号あり
                </Typography>
              )}

              <Box
                fontSize="0.875rem"
                color="grey.600"
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1,
                }}
              >
                <Chip text={genreDisplayName} variant="secondary" />
                <Typography
                  variant="caption"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {'>'}
                </Typography>
                <Chip text={categoryDisplayName} variant="secondary" />
              </Box>
            </Box>
          );
        },
      },
      {
        field: 'condition_option.display_name',
        headerName: '状態',
        width: 100,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => {
          const row = params.row as GroupedProduct;
          if (!row.isFirstInGroup) return '';
          return row.is_special_price_product
            ? '特価'
            : row.condition_option?.display_name || '';
        },
      },
      {
        field: 'storeDisplayName',
        headerName: '店舗',
        align: 'center',
        headerAlign: 'center',
        width: 120,
        renderCell: (params) => {
          const row = params.row as GroupedProduct;
          return row.storeDisplayName;
        },
      },
      {
        field: 'management_number',
        headerName: '管理番号',
        width: 150,
        align: 'center',
        headerAlign: 'center',
      },
      {
        field: 'stock_number',
        headerName: '在庫数',
        width: 80,
        align: 'center',
        headerAlign: 'center',
      },
    ],
    [],
  );

  return (
    <InfiniteScrollTable
      columns={columns}
      items={groupedProducts}
      loadMoreItems={loadMoreItems}
      hasMore={hasMore}
      isLoading={loading}
      rowHeight={100}
      headerCellSx={{ borderTop: 'none' }}
    />
  );
};
