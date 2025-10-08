import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
import { getItemCategoryDef } from '@/app/api/store/[store_id]/item/def';
import { GenreAPIRes } from '@/api/frontend/genre/api';
import { FindOptionSelect } from '@/feature/item/components/select/FindOptionSelect';
import {
  ChangeFindOptionType,
  FindOptionType,
} from '@/feature/item/hooks/useSearchItemByFindOption';
import { useMemo } from 'react';
import { ItemCategoryHandle } from '@prisma/client';
import { Specialties } from '@/feature/specialty/hooks/useGetSpecialty';
import { ConsignmentProductFilter } from '@/feature/products/components/filters/ConsignmentProductFilter';
// import { ProductGetAllOrderType } from '@/app/api/store/[store_id]/product/api'; // import時にエラー吐かれたので一旦このファイルの中で定義
interface Props {
  searchState: ProductSearchState;
  setSearchState: React.Dispatch<React.SetStateAction<ProductSearchState>>;
  category?: typeof getItemCategoryDef.response;
  genre?: GenreAPIRes['getGenreAll'];
  specialties: Specialties;
  storeId: number;
  selectedFindOption: FindOptionType[];
  handleChangeFindOption: (values: ChangeFindOptionType) => void;
}

export const NarrowDownComponent = ({
  searchState,
  setSearchState,
  category,
  specialties,
  storeId,
  selectedFindOption,
  handleChangeFindOption,
}: Props) => {
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    if (searchState.isLoading) return;
    setSearchState((prev) => ({
      ...prev,
      itemCategoryId:
        event.target.value === 'all' ? null : Number(event.target.value),
    }));
  };

  const handleStateChange = (event: SelectChangeEvent<string>) => {
    if (searchState.isLoading) return;
    setSearchState((prev) => ({
      ...prev,
      conditionOptionDisplayName:
        event.target.value === 'all' ? undefined : event.target.value,
    }));
  };

  const handleSpecialtyStateChange = (event: SelectChangeEvent<string>) => {
    if (searchState.isLoading) return;
    const specialtyId = specialties.find(
      (s) => s.id === Number(event.target.value),
    )?.id;
    setSearchState((prev) => ({
      ...prev,
      specialtyId: event.target.value === 'none' ? false : specialtyId,
    }));
  };

  // 型チェック関数
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
  // 現在の searchState に対応する value を計算
  const currentStockStatus =
    stockStatuses.find(
      (s) =>
        s.isActive === searchState.isActive &&
        s.stockNumberGte === searchState.stockNumberGte,
    )?.value ?? StackStatus.All.value;
  const handleStockChange = (event: SelectChangeEvent<string>) => {
    const status = statusMap[event.target.value];
    if (!status) return;
    setSearchState((prev) => ({
      ...prev,
      isActive: status.isActive,
      stockNumberGte: status.stockNumberGte,
    }));
  };

  // カテゴリー内の「カード」
  const cardCategory = useMemo(
    () =>
      category?.itemCategories.find(
        (category) => category.handle === ItemCategoryHandle.CARD,
      ),
    [category],
  );

  /**
   *  管理番号フィルターロジック
   */
  const handleManagementNumberChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;

    setSearchState((prev) => ({
      ...prev,
      hasManagementNumber:
        value === 'has_management_number'
          ? true
          : value === 'no_management_number'
          ? false
          : undefined,
    }));
  };

  const hasManagementNumberValue = useMemo(() => {
    return searchState.hasManagementNumber
      ? 'has_management_number'
      : searchState.hasManagementNumber === false
      ? 'no_management_number'
      : 'all';
  }, [searchState.hasManagementNumber]);

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: 1, mt: 1 }}
      gap={2}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1, // 各セレクトボックス間の間隔
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* 商品カテゴリ */}
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel sx={{ color: 'black' }} shrink>
            商品カテゴリ
          </InputLabel>
          <Select
            value={
              searchState.itemCategoryId
                ? String(searchState.itemCategoryId)
                : 'all'
            }
            onChange={handleCategoryChange}
            label="商品カテゴリ"
          >
            <MenuItem value="all">すべて</MenuItem>
            {category?.itemCategories.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.display_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 状態 */}
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel sx={{ color: 'black' }} shrink>
            状態
          </InputLabel>
          <Select
            value={
              searchState.conditionOptionDisplayName
                ? searchState.conditionOptionDisplayName
                : 'all'
            }
            onChange={handleStateChange}
            label="状態"
          >
            <MenuItem value="all">すべて</MenuItem>
            {[
              ...new Set(
                category?.itemCategories?.flatMap(
                  (item) =>
                    item.condition_options?.map(
                      (condition) => condition.display_name,
                    ) ?? [],
                ) ?? [],
              ),
            ].map((displayName) => (
              <MenuItem key={displayName} value={displayName}>
                {displayName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 特殊状態 */}
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel sx={{ color: 'black' }} shrink>
            特殊状態
          </InputLabel>
          <Select
            value={
              searchState.specialtyId === false
                ? 'none'
                : searchState.specialtyId === undefined
                ? 'all'
                : String(searchState.specialtyId)
            }
            onChange={handleSpecialtyStateChange}
            label="特殊状態"
          >
            <MenuItem value="all">すべて</MenuItem>
            <MenuItem value="none">なし</MenuItem>
            {specialties.map((specialty) => (
              <MenuItem key={specialty.id} value={specialty.id}>
                {specialty.display_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 在庫状況 */}
        <FormControl
          variant="outlined"
          size="small"
          sx={{
            minWidth: 100,
            backgroundColor: 'common.white',
            '& .MuiInputLabel-root': {
              color: 'text.primary',
            },
          }}
        >
          <InputLabel sx={{ color: 'black' }} shrink>
            在庫状況
          </InputLabel>
          <Select
            value={currentStockStatus}
            onChange={handleStockChange}
            label="在庫状況"
          >
            {stockStatuses.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 委託商品フィルタ */}
        <ConsignmentProductFilter
          setProductSearchState={setSearchState}
          formControlSx={{ minWidth: 120 }}
        />

        {/* 管理番号フィルタ */}
        <FormControl
          variant="outlined"
          size="small"
          sx={{
            minWidth: 100,
            backgroundColor: 'common.white',
            '& .MuiInputLabel-root': {
              color: 'text.primary',
            },
          }}
        >
          <InputLabel sx={{ color: 'black' }} shrink>
            管理番号
          </InputLabel>
          <Select
            value={hasManagementNumberValue}
            onChange={handleManagementNumberChange}
            label="管理番号"
          >
            <MenuItem value="all">すべて</MenuItem>
            <MenuItem value="has_management_number">管理番号あり</MenuItem>
            <MenuItem value="no_management_number">管理番号なし</MenuItem>
          </Select>
        </FormControl>

        {/* 鑑定結果 */}
        {/* <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel sx={{ color: 'black' }}>※鑑定結果</InputLabel>
          <Select label="鑑定結果">
            <MenuItem value="">開発中</MenuItem>
          </Select>
        </FormControl> */}

        {/* さらに絞り込み */}
        {/* <TooltipModal
          open={open}
          onClose={handleClose}
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
          <SimpleButtonWithIcon onClick={handleOpen}>
            ※さらに絞り込み
          </SimpleButtonWithIcon>
        </TooltipModal> */}

        {/* 日付入力 */}
        <TextField
          size="small"
          type="date"
          label="最終価格更新日"
          InputLabelProps={{
            shrink: true,
          }}
          value={searchState.priceChangeDateGte}
          onChange={(e) =>
            setSearchState((prev) => ({
              ...prev,
              priceChangeDateGte: e.target.value,
            }))
          }
          sx={{
            '& .MuiInputLabel-root': {
              color: 'black', // ラベルの色
            },
            '& .MuiInputBase-input': {
              color: 'black', // 入力値の文字色
            },
          }}
        />
        <Typography
          sx={{
            whiteSpace: 'nowrap',
          }}
        >
          以降
        </Typography>
        <FindOptionSelect
          storeID={storeId}
          selectedGenreId={searchState.itemGenreId}
          selectedCategoryId={searchState.itemCategoryId}
          selectedFindOption={selectedFindOption}
          handleChangeFindOption={handleChangeFindOption}
          cardCategoryId={cardCategory?.id}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <Typography
          sx={{
            whiteSpace: 'nowrap',
          }}
        >
          並び替え
        </Typography>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel sx={{ color: 'black' }} shrink>
            並び替え
          </InputLabel>
          <Select
            value={
              searchState.orderBy !== undefined ? searchState.orderBy : 'not'
            }
            onChange={handleOrderByChange}
            label="並び替え"
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

        {/* <SimpleButtonWithIcon
          icon={<WindowIcon />}
          iconSize={16}
          iconColor="primary.main"
          disabled
        >
          表示切替
        </SimpleButtonWithIcon> */}
      </Box>
    </Box>
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

// 在庫状況
const StackStatus = {
  All: {
    label: 'すべて',
    value: 'all',
    isActive: undefined,
    stockNumberGte: undefined,
  }, // すべて
  HasStockInactive: {
    label: '在庫あり',
    value: 'hasStock_inactive',
    isActive: true,
    stockNumberGte: 1,
  }, // 在庫あり(stock_number > 0)かつ非アクティブ
  HasStockActive: {
    label: '在庫なし(ACT)',
    value: 'hasStock_active',
    isActive: true,
    stockNumberGte: 0,
  }, // 在庫あり(stock_number > 0)かつアクティブ
  NoStock: {
    label: '在庫なし',
    value: 'noStock',
    isActive: false,
    stockNumberGte: 0,
  }, // 在庫なし(isActiveがfalse
} as const;
type StackStatus = (typeof StackStatus)[keyof typeof StackStatus];

const stockStatuses = Object.values(StackStatus);
const statusMap: Record<string, StackStatus> = stockStatuses.reduce(
  (acc, s) => {
    acc[s.value] = s;
    return acc;
  },
  {} as Record<string, StackStatus>,
);
