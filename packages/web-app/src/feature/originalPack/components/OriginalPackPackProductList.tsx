import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  SelectChangeEvent,
  Stack,
} from '@mui/material';
import { CustomTable, ColumnDef } from '@/components/tables/CustomTable';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { useStore } from '@/contexts/StoreContext';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { useOriginalPackProducts } from '@/feature/originalPack/hooks/useOriginalPackProducts';
// import { ProductGetAllOrderType } from '@/app/api/store/[store_id]/product/api'; // import時にエラー吐かれたので一旦このファイルの中で定義(app/auth/(dashboard)/stock/components/NarrowDownComponent.tsxと同様の対応)
import { useWholesalePrice } from '@/feature/products/hooks/useWholesalePrice';
import {
  OriginalPackItemType,
  OriginalPackProduct,
} from '@/app/auth/(dashboard)/original-pack/page';
import {
  ItemStatus,
  ItemType,
  WholesalePriceHistoryResourceType,
} from '@prisma/client';
import { toHalfWidthOnly } from '@/utils/convertToHalfWidth';
import { ItemText } from '@/feature/item/components/ItemText';

interface OriginalPackPackProductListProps {
  selectedItem: OriginalPackItemType | null;
  originalPackProducts: OriginalPackProduct[];
  setOriginalPackProducts: (products: OriginalPackProduct[]) => void;
  isComposing: boolean;
  setIsComposing: (value: boolean) => void;
}

export const OriginalPackPackProductList: React.FC<
  OriginalPackPackProductListProps
> = ({
  selectedItem,
  originalPackProducts,
  setOriginalPackProducts,
  isComposing,
  setIsComposing,
}) => {
  const { store } = useStore();
  // カテゴリ, 状態絞り込み条件
  const { category, conditionOptionsWithCategory, fetchCategoryList } =
    useCategory();
  // オリパに含まれるプロダクト一覧取得
  const { searchState, setSearchState, searchResults, isLoading } =
    useOriginalPackProducts(store.id, selectedItem?.id);
  const { fetchWholesalePrice } = useWholesalePrice();
  // さらに絞り込みのモーダルの開閉 コメントアウト
  // const [isOpenDetailNarrowDown, setIsOpenDetailNarrowDown] =
  //   useState<boolean>(false);

  // カテゴリ,状態リストの取得
  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList, store.id]);

  // フロントで扱うオリパに含まれるプロダクト一覧の更新
  useEffect(() => {
    const updateOriginalPackProducts = async () => {
      if (
        selectedItem &&
        selectedItem.original_pack_products &&
        searchResults
      ) {
        setIsComposing(true);
        const newOriginalPackProducts: OriginalPackProduct[] = [];
        for (const productInSearchResults of searchResults) {
          const product = selectedItem.original_pack_products.find(
            // 検索結果のソート順を保持しつつ、元のオリパに含まれるプロダクトから、id等を得る
            (p) => p.product_id === productInSearchResults.id,
          );
          if (product) {
            // 補充した時はoriginal_pack_productsに同じproductで複数のレコードが作成されるので封入数の合計を算出
            const totalItemCount = selectedItem.original_pack_products.reduce(
              (acc, p) => {
                if (p.product_id === product.product_id) {
                  return acc + p.item_count;
                }
                return acc;
              },
              0,
            );
            const wholesalePrice = await fetchWholesalePrice(
              product.product_id,
              product.item_count,
              true,
              true,
              selectedItem.status === ItemStatus.DRAFT
                ? WholesalePriceHistoryResourceType.PRODUCT
                : ItemType.ORIGINAL_PACK,

              selectedItem.status === ItemStatus.DRAFT
                ? product.product_id
                : selectedItem.id,
            );
            // 仕入れ値は時期によって異なる可能性があり複数存在するため1プロダクトあたりの平均値を表示、割り切れない場合は切り捨て
            const meanWholesalePrice = wholesalePrice
              ? Math.floor(
                  wholesalePrice.totalWholesalePrice / product.item_count,
                )
              : 0;
            newOriginalPackProducts.push({
              ...productInSearchResults,
              processId: product.process_id,
              mean_wholesale_price: meanWholesalePrice, // 現状は一つずつしかとってこれない // 仕入れ値は時期によって異なる可能性があり複数存在するため1プロダクトあたりの平均値を表示
              item_count: totalItemCount, // 封入数はオリパ自体の情報から取得
              max_count: totalItemCount, // item_countは更新され続けるのでデフォルトの封入数を保持
            });
          }
        }
        setOriginalPackProducts(newOriginalPackProducts);
        setIsComposing(false);
      }
    };
    updateOriginalPackProducts();
  }, [
    selectedItem,
    searchResults,
    store.id,
    fetchWholesalePrice,
    setOriginalPackProducts,
  ]);

  // 絞り込みハンドラ
  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    const strValue = e.target.value;
    const newValue = strValue === '' ? undefined : parseInt(strValue, 10);
    setSearchState((prev) => ({
      ...prev,
      categoryId: newValue,
    }));
  };
  const handleConditionChange = (e: SelectChangeEvent<string>) => {
    const newValue = e.target.value;
    setSearchState((prev) => ({
      ...prev,
      conditionOptionDisplayName: newValue,
    }));
  };
  const handleRarityInputChange = (e: React.ChangeEvent<{ value: string }>) => {
    setSearchState((prevState) => ({
      ...prevState,
      rarity: toHalfWidthOnly(e.target.value),
    }));
  };

  // ソートハンドラ
  const isValidOrderBy = (value: string): value is ProductGetAllOrderType => {
    const values = Object.values(ProductGetAllOrderType);
    return values.includes(value as ProductGetAllOrderType);
  };
  const handleOrderByChange = (event: SelectChangeEvent<string>) => {
    setSearchState((prev) => ({
      ...prev,
      orderBy:
        event.target.value === 'not'
          ? undefined
          : isValidOrderBy(event.target.value)
          ? (event.target.value as ProductGetAllOrderType)
          : undefined, // 不正な値は `undefined` にする
    }));
  };

  // CustomTabTable 用のカラム定義
  const columns: ColumnDef<OriginalPackProduct>[] = [
    {
      header: '商品画像',
      render: (product) => <ItemImage imageUrl={product.image_url} />,
    },
    {
      header: '商品名',
      key: 'display_name',
      render: (product) => <ItemText text={product.displayNameWithMeta} />,
    },
    {
      header: '状態',
      key: 'condition_option_display_name',
      render: (product) => product.condition_option_display_name || '-',
    },
    {
      header: '仕入れ値',
      key: 'mean_wholesale_price',
      render: (
        product, // 仕入れ値は時期によって異なる可能性があり複数存在するため1プロダクトあたりの平均値を表示
      ) =>
        product.mean_wholesale_price
          ? `¥${product.mean_wholesale_price.toLocaleString()}`
          : '￥0',
    },
    {
      header: '販売価格',
      key: 'actual_sell_price',
      render: (product) =>
        product.actual_sell_price
          ? `¥${product.actual_sell_price.toLocaleString()}`
          : '￥0',
    },
    {
      header: '封入数',
      key: 'item_count',
      render: (product) => product.item_count,
    },
  ];
  return (
    <Stack
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // 親で隠して子でスクロール
        borderTop: '8px solid',
        borderTopColor: 'primary.main',
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          py: 1,
          px: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'common.white',
          borderBottom: '1px solid',
          borderBottomColor: 'grey.300',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography>封入商品一覧</Typography>
          {/* カテゴリでの絞り込み */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel
              id={'category-filter-label'}
              sx={{ color: 'text.primary' }}
            >
              カテゴリ
            </InputLabel>
            <Select
              labelId={'category-filter-label'}
              label={'カテゴリ'}
              value={searchState.categoryId?.toString() ?? ''}
              onChange={handleCategoryChange}
            >
              <MenuItem value="">すべて</MenuItem>
              {category?.itemCategories?.map((category) => (
                <MenuItem key={category.id} value={category.id.toString()}>
                  {category.display_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* レアリティでの絞り込み */}
          <TextField
            label="レアリティ"
            variant="outlined"
            value={searchState.rarity ?? ''}
            onChange={handleRarityInputChange}
            size="small"
            placeholder="レアリティ"
            sx={{
              width: 130,
            }}
            InputLabelProps={{
              shrink: true,
              sx: { color: 'text.primary' },
            }}
          />
          {/* 状態での絞り込み */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel
              id={'condition-filter-label'}
              sx={{ color: 'text.primary' }}
            >
              状態
            </InputLabel>
            <Select
              labelId={'condition-filter-label'}
              label={'状態'}
              value={searchState.conditionOptionDisplayName?.toString() ?? ''}
              onChange={handleConditionChange}
            >
              <MenuItem value="">すべて</MenuItem>
              {conditionOptionsWithCategory?.map((displayName) => (
                <MenuItem key={displayName} value={displayName}>
                  {displayName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* さらに絞り込み 一旦機能しないのでコメントアウト */}
          {/* <TooltipModal
            open={isOpenDetailNarrowDown}
            onClose={() => setIsOpenDetailNarrowDown(false)}
            content={
              <Box display="flex" flexDirection="column" gap={1}>
                {Array.from({ length: 6 }, (_, index) => (
                  <FormControl key={index} size="small" sx={{ minWidth: 100 }}>
                    <InputLabel
                      sx={{ color: 'black' }}
                    >{`絞り込み${index + 1}`}</InputLabel>
                    <Select label={`※絞り込み${index + 1}`}></Select>
                  </FormControl>
                ))}
              </Box>
            }
            placement="bottom"
            width={'auto'}
            height="auto"
          >
            <span>
              <SimpleButtonWithIcon
                onClick={() => setIsOpenDetailNarrowDown(true)}
              >
                ※さらに絞り込み
              </SimpleButtonWithIcon>
            </span>
          </TooltipModal> */}
        </Box>

        {/* ソート */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id={'sort-filter-label'} sx={{ color: 'text.primary' }}>
              並び替え
            </InputLabel>
            <Select<string>
              labelId={'sort-label'}
              label={'並び替え'}
              value={
                searchState.orderBy !== undefined ? searchState.orderBy : 'not'
              }
              onChange={handleOrderByChange}
            >
              <MenuItem value="not">なし</MenuItem>
              <MenuItem value={ProductGetAllOrderType.ActualSellPriceAsc}>
                販売価格昇順
              </MenuItem>
              <MenuItem value={ProductGetAllOrderType.ActualSellPriceDesc}>
                販売価格降順
              </MenuItem>
              <MenuItem value={ProductGetAllOrderType.ActualBuyPriceAsc}>
                買取価格昇順
              </MenuItem>
              <MenuItem value={ProductGetAllOrderType.ActualBuyPriceDesc}>
                買取価格降順
              </MenuItem>
              <MenuItem value={ProductGetAllOrderType.SellPriceUpdatedAtAsc}>
                販売価格更新日昇順
              </MenuItem>
              <MenuItem value={ProductGetAllOrderType.SellPriceUpdatedAtDesc}>
                販売価格更新日降順
              </MenuItem>
              <MenuItem value={ProductGetAllOrderType.BuyPriceUpdatedAtAsc}>
                買取価格更新日昇順
              </MenuItem>
              <MenuItem value={ProductGetAllOrderType.BuyPriceUpdatedAtDesc}>
                買取価格更新日降順
              </MenuItem>
              <MenuItem value={ProductGetAllOrderType.StockNumberAsc}>
                在庫数昇順
              </MenuItem>
              <MenuItem value={ProductGetAllOrderType.StockNumberDesc}>
                在庫数降順
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <CustomTable<OriginalPackProduct>
        columns={columns}
        rows={originalPackProducts || []}
        isLoading={isLoading || isComposing}
        rowKey={(product) => product.id}
        sx={{
          borderBottomRightRadius: '8px',
          borderBottomLeftRadius: '8px',
          pb: 7,
        }}
      />
    </Stack>
  );
};

const ProductGetAllOrderType = {
  ActualSellPriceAsc: 'actual_sell_price', // 実際販売価格の昇順
  ActualSellPriceDesc: '-actual_sell_price', // 実際販売価格の降順
  ActualBuyPriceAsc: 'actual_buy_price', // 実際買取価格の昇順
  ActualBuyPriceDesc: '-actual_buy_price', // 実際買取価格の降順
  SellPriceUpdatedAtAsc: 'sell_price_updated_at', // 販売価格の最終更新日時の昇順
  SellPriceUpdatedAtDesc: '-sell_price_updated_at', // 販売価格の最終更新日時の降順
  BuyPriceUpdatedAtAsc: 'buy_price_updated_at', // 買取価格の最終更新日時の昇順
  BuyPriceUpdatedAtDesc: '-buy_price_updated_at', // 買取価格の最終更新日時の降順
  StockNumberAsc: 'stock_number', // 在庫数の昇順
  StockNumberDesc: '-stock_number', // 在庫数の降順
  IdAsc: 'id', // IDの昇順
  IdDesc: '-id', // IDの降順
} as const;
type ProductGetAllOrderType =
  (typeof ProductGetAllOrderType)[keyof typeof ProductGetAllOrderType];
