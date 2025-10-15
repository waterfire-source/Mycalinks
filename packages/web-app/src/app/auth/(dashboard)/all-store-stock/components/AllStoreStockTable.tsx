import {
  useGetAllStoreProducts,
  AllStoreProduct,
} from '@/feature/products/hooks/useGetAllStoreProducts';
import { useAllStoreCategoriesAndGenres } from '@/feature/products/hooks/useAllStoreCategoriesAndGenres';
import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AllStockTableContent } from '@/app/auth/(dashboard)/all-store-stock/components/AllStockTableContent';

type GroupedProduct = AllStoreProduct & {
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  groupSize: number;
};

export const AllStoreStockTable = () => {
  const {
    fetchAllStoreProducts,
    allProducts,
    loading,
    hasMore,
    resetProducts,
  } = useGetAllStoreProducts();
  const {
    allGenres,
    allCategories,
    loading: filtersLoading,
  } = useAllStoreCategoriesAndGenres();
  const [currentPage, setCurrentPage] = useState(0);
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const pageSize = 30;

  // データ取得（初回とフィルター変更時）
  useEffect(() => {
    resetProducts();
    const queryParams: any = { take: pageSize, skip: 0 };

    if (genreFilter !== 'all') {
      queryParams.genreDisplayName = genreFilter;
    }

    if (categoryFilter !== 'all') {
      queryParams.categoryDisplayName = categoryFilter;
    }

    fetchAllStoreProducts(queryParams);
    setCurrentPage(0);
  }, [genreFilter, categoryFilter]);

  // 追加データ読み込み
  const loadMoreItems = useCallback(async () => {
    if (loading || !hasMore) return;

    const nextPage = currentPage + 1;
    const queryParams: any = {
      take: pageSize,
      skip: pageSize * nextPage,
    };

    if (genreFilter !== 'all') {
      queryParams.genreDisplayName = genreFilter;
    }

    if (categoryFilter !== 'all') {
      queryParams.categoryDisplayName = categoryFilter;
    }

    if (searchQuery.trim()) {
      queryParams.name = searchQuery.trim();
    }

    await fetchAllStoreProducts(queryParams);
    setCurrentPage(nextPage);
  }, [currentPage, hasMore, loading, genreFilter, categoryFilter, searchQuery]);

  // フィルター変更時の処理
  const handleGenreChange = (event: SelectChangeEvent<string>) => {
    setGenreFilter(event.target.value);
    setCurrentPage(0);
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setCategoryFilter(event.target.value);
    setCurrentPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = () => {
    resetProducts();
    const queryParams: any = { take: pageSize, skip: 0 };

    if (genreFilter !== 'all') {
      queryParams.genreDisplayName = genreFilter;
    }

    if (categoryFilter !== 'all') {
      queryParams.categoryDisplayName = categoryFilter;
    }

    if (searchQuery.trim()) {
      queryParams.name = searchQuery.trim();
    }

    fetchAllStoreProducts(queryParams);
    setCurrentPage(0);
  };

  // グループ化処理
  const groupedProducts = useMemo(() => {
    // グループ化のキーを作成
    const groupedData = new Map<string, AllStoreProduct[]>();

    allProducts.forEach((product) => {
      // グループ化キー: myca_item_id + 状態名 + 委託フラグ + 特価フラグ
      const groupKey = `${product.item.myca_item_id}_${
        product.condition_option?.display_name ?? 'none'
      }_${product.specialty_id ?? 'none'}_${
        product.consignment_client_id ?? 'none'
      }_${product.is_special_price_product ? 'special' : 'normal'}`;

      if (!groupedData.has(groupKey)) {
        groupedData.set(groupKey, []);
      }
      groupedData.get(groupKey)!.push(product);
    });

    // グループ化されたデータを平坦化して表示用データに変換
    const flattenedData: GroupedProduct[] = [];

    groupedData.forEach((group) => {
      // グループ内の商品を管理番号順にソート
      const sortedGroup = group.sort((a, b) => {
        const aNum = a.management_number || '';
        const bNum = b.management_number || '';
        return aNum.localeCompare(bNum);
      });

      sortedGroup.forEach((product, index) => {
        const isFirstInGroup = index === 0;
        const isLastInGroup = index === sortedGroup.length - 1;

        flattenedData.push({
          ...product,
          isFirstInGroup,
          isLastInGroup,
          groupSize: sortedGroup.length,
        });
      });
    });

    return flattenedData;
  }, [allProducts]);

  return (
    <Stack sx={{ width: '100%', height: '100%' }}>
      {/* 検索フィールド */}
      <Box
        sx={{
          flexDirection: 'row',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          my: 2,
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="商品名"
          value={searchQuery}
          type="text"
          onChange={handleSearchChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          sx={{
            flexGrow: 2,
            minWidth: 250,
            backgroundColor: 'common.white',
            '& .MuiInputBase-input': {
              color: 'text.primary',
            },
          }}
        />
        <PrimaryButtonWithIcon icon={<SearchIcon />} onClick={handleSearch}>
          検索
        </PrimaryButtonWithIcon>
      </Box>

      {/* フィルターコントロール */}
      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>ジャンル</InputLabel>
          <Select
            value={genreFilter}
            onChange={handleGenreChange}
            label="ジャンル"
            disabled={filtersLoading}
          >
            <MenuItem value="all">すべて</MenuItem>
            {allGenres.map((genre) => (
              <MenuItem key={genre.value} value={genre.value}>
                {genre.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>カテゴリ</InputLabel>
          <Select
            value={categoryFilter}
            onChange={handleCategoryChange}
            label="カテゴリ"
            disabled={filtersLoading}
          >
            <MenuItem value="all">すべて</MenuItem>
            {allCategories.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <AllStockTableContent
        groupedProducts={groupedProducts}
        loadMoreItems={loadMoreItems}
        hasMore={hasMore}
        loading={loading || filtersLoading}
      />
    </Stack>
  );
};
