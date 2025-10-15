import { LocationProduct } from '@/app/auth/(dashboard)/location/register/page';
import { ColumnDef, CustomTabTable } from '@/components/tabs/CustomTabTable';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';

type Props = {
  releaseProducts: LocationProduct[];
  currentPage: number;
  rowPerPage: number;
  handleRowPerPageChange: (newTake: number) => void;
  handlePrevPagination: () => void;
  handleNextPagination: () => void;
};

export const LocationReleaseProductTableContent = ({
  releaseProducts,
  currentPage,
  rowPerPage,
  handleRowPerPageChange,
  handlePrevPagination,
  handleNextPagination,
}: Props) => {
  // カテゴリフィルター用の選択肢を動的に生成
  const categoryOptions = useMemo(() => {
    const categories = releaseProducts
      .map((product) => product.item_category_display_name)
      .filter((category): category is string => Boolean(category));

    return [...new Set(categories)]; // 重複除去
  }, [releaseProducts]);

  // ジャンルタブ用の選択肢を動的に生成
  const genreOptions = useMemo(() => {
    const genres = releaseProducts
      .map((product) => product.item_genre_display_name)
      .filter((genre): genre is string => Boolean(genre));

    return [...new Set(genres)]; // 重複除去
  }, [releaseProducts]);

  const columns: ColumnDef<LocationProduct>[] = [
    {
      header: '商品画像',
      key: 'imageUrl',
      render: (product) => (
        <Box sx={{ minWidth: 80 }}>
          <ItemImage imageUrl={product.image_url || ''} />
        </Box>
      ),
    },
    {
      header: '商品名',
      key: 'displayName',
      render: (product) => (
        <Box sx={{ minWidth: 200, textAlign: 'left' }}>
          <Typography>{product.displayNameWithMeta}</Typography>
        </Box>
      ),
    },
    {
      header: 'カテゴリ',
      key: 'item_category_display_name',
      render: (product) => (
        <Box sx={{ minWidth: 100 }}>
          <Typography>{product.item_category_display_name}</Typography>
        </Box>
      ),
      filterConditions: categoryOptions,
      isHideColumn: true,
    },
    {
      header: '状態',
      key: 'conditionOptionDisplayName',
      render: (product) => (
        <Box sx={{ minWidth: 80 }}>
          <Typography>{product.condition_option_display_name}</Typography>
        </Box>
      ),
    },
    {
      header: '平均仕入れ値',
      key: 'average_wholesale_price',
      render: (product) => (
        <Box sx={{ minWidth: 100 }}>
          <Typography>
            ¥{product.average_wholesale_price?.toLocaleString() || 0}
          </Typography>
        </Box>
      ),
      isSortable: true,
    },
    {
      header: '販売価格',
      key: 'sell_price',
      render: (product) => (
        <Box sx={{ minWidth: 100 }}>
          <Typography>¥{product.sell_price?.toLocaleString() || 0}</Typography>
        </Box>
      ),
      isSortable: true,
    },
    {
      header: '封入数',
      key: 'itemCount',
      render: (product) => (
        <Box sx={{ minWidth: 80 }}>
          <Typography>{product.itemCount}</Typography>
        </Box>
      ),
      isSortable: true,
    },
  ];

  const tabs = [
    {
      label: 'すべて',
      filterFn: (data: LocationProduct[]) => data,
    },
    ...genreOptions.map((genre) => ({
      label: genre,
      filterFn: (data: LocationProduct[]) =>
        data.filter((product) => product.item_genre_display_name === genre),
    })),
  ];

  return (
    <CustomTabTable<LocationProduct>
      data={releaseProducts}
      columns={columns}
      rowKey={(product) => product.id}
      tabs={tabs}
      currentPage={currentPage}
      rowPerPage={rowPerPage}
      handleRowPerPageChange={handleRowPerPageChange}
      handlePrevPagination={handlePrevPagination}
      handleNextPagination={handleNextPagination}
      isShowFooterArea={true}
      tableWrapperSx={{ overflow: 'hidden' }}
    />
  );
};
