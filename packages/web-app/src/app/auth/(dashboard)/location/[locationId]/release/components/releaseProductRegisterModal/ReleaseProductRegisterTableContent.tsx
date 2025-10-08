import { LocationProduct } from '@/app/auth/(dashboard)/location/register/page';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { ColumnDef, CustomTabTable } from '@/components/tabs/CustomTabTable';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { Box, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

type Props = {
  locationProducts: LocationProduct[];
  addToRegisterCart: (product: LocationProduct, count: number) => void;
};

export const ReleaseProductRegisterTableContent = ({
  locationProducts,
  addToRegisterCart,
}: Props) => {
  // 各商品の数量管理用のMap
  const [countMap, setCountMap] = useState<Map<number, number>>(new Map());

  // 数量を更新する関数
  const updateCount = (productId: number, count: number) => {
    setCountMap((prev) => new Map(prev.set(productId, count)));
  };

  // 数量を取得する関数
  const getCount = (productId: number) => {
    return countMap.get(productId) || 1;
  };

  // カテゴリフィルター用の選択肢を動的に生成
  const categoryOptions = useMemo(() => {
    const categories = locationProducts
      .map((product) => product.item_category_display_name)
      .filter((category): category is string => Boolean(category));

    return [...new Set(categories)]; // 重複除去
  }, [locationProducts]);

  // ジャンルタブ用の選択肢を動的に生成
  const genreOptions = useMemo(() => {
    const genres = locationProducts
      .map((product) => product.item_genre_display_name)
      .filter((genre): genre is string => Boolean(genre));

    return [...new Set(genres)]; // 重複除去
  }, [locationProducts]);

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
    // {
    //   header: '状態',
    //   key: 'conditionOptionDisplayName',
    //   render: (product) => (
    //     <Box sx={{ minWidth: 80 }}>
    //       <Typography>{product.condition_option_display_name}</Typography>
    //     </Box>
    //   ),
    // },
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
    {
      header: '数量',
      key: 'count',
      render: (product) => (
        <Box sx={{ minWidth: 80 }}>
          <NumericTextField
            size="small"
            min={1}
            max={product.itemCount}
            value={getCount(product.id)}
            onChange={(value) => updateCount(product.id, value)}
          />
        </Box>
      ),
    },
    {
      header: '',
      key: 'action',
      render: (product) => (
        <Box sx={{ minWidth: 100 }}>
          <PrimaryButton
            size="small"
            onClick={() => addToRegisterCart(product, getCount(product.id))}
          >
            追加
          </PrimaryButton>
        </Box>
      ),
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
      data={locationProducts}
      columns={columns}
      rowKey={(product) => product.id}
      tabs={tabs}
      isShowFooterArea={true}
      tableWrapperSx={{ overflow: 'hidden' }}
    />
  );
};
