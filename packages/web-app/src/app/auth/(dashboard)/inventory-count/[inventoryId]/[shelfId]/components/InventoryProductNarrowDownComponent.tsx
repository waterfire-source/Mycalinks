import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Categories } from '@/feature/category/hooks/useCategory';
import { ScanAddProductButton } from '@/feature/products/components/ScanAddProductButton';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { Filter } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryProductEditTable';

interface Props {
  categories: Categories;
  handleAddShelfProductFromScan: (
    product: BackendProductAPI[0]['response']['200']['products'][0],
  ) => Promise<void>;
  handleAddMultipleProduct: (
    multipleProduct: BackendProductAPI[0]['response']['200']['products'],
  ) => void;
  handleOpenMultipleProductModal: () => void;
  setFilter: Dispatch<SetStateAction<Filter>>;
}

export const InventoryProductNarrowDownComponent = ({
  categories,
  handleAddMultipleProduct,
  handleAddShelfProductFromScan,
  handleOpenMultipleProductModal,
  setFilter,
}: Props) => {
  const [selectedCategory, setSelectedCategory] = useState<{
    categoryName: string;
    categoryId: number;
  } | null>(null);
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const target = categories.itemCategories.find(
      (category) => category.id === Number(event.target.value),
    );

    setSelectedCategory(
      target
        ? { categoryId: target.id, categoryName: target.display_name }
        : null,
    );
  };

  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const handleStateChange = (event: SelectChangeEvent<string>) => {
    setSelectedStateId(
      event.target.value === 'all' ? null : Number(event.target.value),
    );
  };

  const [selectedStockDiff, setSelectedStockDiff] =
    useState<StackStatus | null>(null);
  const handleStockChange = (event: SelectChangeEvent<string>) => {
    const target = stockStatuses.find((s) => s.value === event.target.value);
    setSelectedStockDiff(target || null);
  };

  useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      categoryId: selectedCategory?.categoryId ?? null,
      conditionId: selectedStateId,
      stockDiff: selectedStockDiff?.value ?? null,
    }));
  }, [selectedCategory, selectedStateId, selectedStockDiff]);

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
          <InputLabel sx={{ color: 'black' }}>商品カテゴリ</InputLabel>
          <Select
            value={
              selectedCategory !== null
                ? selectedCategory.categoryId.toString()
                : 'all'
            }
            onChange={handleCategoryChange}
            label="商品カテゴリ"
          >
            <MenuItem value="all">すべて</MenuItem>
            {categories?.itemCategories.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.display_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 状態 */}
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel sx={{ color: 'black' }}>状態</InputLabel>
          <Select
            value={
              selectedStateId !== null ? selectedStateId.toString() : 'all'
            }
            onChange={handleStateChange}
            label="状態"
          >
            <MenuItem value="all">すべて</MenuItem>
            {[
              ...new Set(
                categories?.itemCategories?.flatMap(
                  (item) =>
                    item.condition_options?.map((condition) => ({
                      conditionId: condition.id,
                      conditionName: condition.display_name,
                    })) ?? [],
                ) ?? [],
              ),
            ].map((c) => (
              <MenuItem key={c.conditionId} value={c.conditionId.toString()}>
                {c.conditionName}
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
            在庫差異
          </InputLabel>
          <Select
            value={selectedStockDiff !== null ? selectedStockDiff.value : 'all'}
            onChange={handleStockChange}
            label="在庫差異"
          >
            <MenuItem value="all">すべて</MenuItem>
            {stockStatuses.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <ScanAddProductButton
          handleOpenMultipleProductModal={handleOpenMultipleProductModal}
          handleAddMultipleProducts={handleAddMultipleProduct}
          handleAddProductToResult={handleAddShelfProductFromScan}
        />
      </Box>
    </Box>
  );
};

// 在庫状況
const StackStatus = {
  HasDiff: {
    label: '差分あり',
    value: 'hasDiff',
  }, //stockNumber - itemCount > 0 もしくは stockNumber - itemCount < 0
  NoDiff: {
    label: '差分なし',
    value: 'noDiff',
  }, // stockNumber - itemCount = 0
  HasPlusDiff: {
    label: '差分プラス',
    value: 'hasPlusDiff',
  }, //stockNumber - itemCount > 0
  HadMinusDiff: {
    label: '差分マイナス',
    value: 'hasMinusDiff',
  }, //stockNumber - itemCount < 0
} as const;
type StackStatus = (typeof StackStatus)[keyof typeof StackStatus];

const stockStatuses = Object.values(StackStatus);
