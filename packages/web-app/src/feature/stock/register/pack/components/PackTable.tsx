import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, TextField, Stack, Typography } from '@mui/material';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { GenreSelect } from '@/feature/item/components/select/GenreSelect';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ItemText } from '@/feature/item/components/ItemText';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { createClientAPI } from '@/api/implement';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import {
  InfiniteScrollCustomTable,
  ColumnDef,
} from '@/components/tables/InfiniteScrollCustomTable';
import { PaginationNav } from '@/components/pagination/PaginationNav';

export interface PackType {
  itemId: number;
  productId: number;
  displayName: string;
  imageUrl: string | null;
  stockNumber: number;
  genreName: string;
  categoryName: string;
}

interface PackTableProps {
  width: string;
  height: string;
  storeID: number;
  onSelectPack: (selectedPack: PackType) => void;
}

const PackTable: React.FC<PackTableProps> = ({
  width,
  height,
  storeID,
  onSelectPack,
}) => {
  const { handleError } = useErrorAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);
  const [products, setProducts] = useState<
    BackendProductAPI[0]['response']['200']['products']
  >([]);
  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [selectedGenreId, setSelectedGenreId] = useState<number>();
  // 入力フォームのstate
  const [keyword, setKeyword] = useState<string>('');
  // 検索するためのstate
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const handleSelectPack = (
    product: BackendProductAPI[0]['response']['200']['products'][0],
  ) => {
    if (!product.item_id) return;
    const pack: PackType = {
      itemId: product.item_id,
      productId: product.id,
      displayName: product.displayNameWithMeta,
      imageUrl: product.image_url,
      stockNumber: product.stock_number,
      genreName: product.item_genre_display_name,
      categoryName: product.item_category_display_name,
    };
    onSelectPack(pack);
  };

  const fetchProducts = useCallback(async () => {
    if (!storeID) return;

    setLoading(true);
    try {
      const response = await clientAPI.product.listProducts({
        storeID,
        isActive: undefined,
        take: pageSize,
        skip: (page - 1) * pageSize,
        includesSummary: true,
        stockNumberGte: 1,
        isPack: true,
        displayName: searchKeyword || undefined,
        itemGenreId: selectedGenreId,
      });

      if (response && 'products' in response) {
        setProducts(response.products);
        setRowCount(response.totalValues?.itemCount || 0);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [
    storeID,
    page,
    pageSize,
    searchKeyword,
    selectedGenreId,
    clientAPI,
    handleError,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 検索条件が変更されたときはページを1に戻す
  useEffect(() => {
    setPage(1);
  }, [searchKeyword, selectedGenreId]);

  const totalPages = Math.ceil(rowCount / pageSize);

  const columns: ColumnDef<
    BackendProductAPI[0]['response']['200']['products'][0]
  >[] = [
    {
      header: '画像',
      render: (item) => <ItemImage imageUrl={item.image_url} fill />,
      sx: { width: 80 },
    },
    {
      header: '商品名',
      render: (item) => (
        <ItemText
          sx={{ textAlign: 'center' }}
          wrap
          text={item.displayNameWithMeta}
        />
      ),
      sx: { minWidth: 300 },
    },
    {
      header: 'ジャンル',
      render: (item) => (
        <Typography>{item.condition_option_display_name ?? '-'}</Typography>
      ),
      sx: { width: 120 },
    },
    {
      header: '在庫数',
      render: (item) => <Typography>{item.stock_number}</Typography>,
      sx: { width: 100 },
    },
    {
      header: '',
      render: (item) => (
        <PrimaryButton size="small" onClick={() => handleSelectPack(item)}>
          選択
        </PrimaryButton>
      ),
      sx: { width: 100 },
    },
  ];

  return (
    <Box
      sx={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 検索 */}
      <Stack
        direction="row"
        gap="16px"
        height="56px"
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          pt: 1,
          mb: '20px',
        }}
      >
        <GenreSelect
          selectedGenreId={selectedGenreId}
          onSelect={(e) =>
            e.target.value === ''
              ? setSelectedGenreId(undefined)
              : setSelectedGenreId(Number(e.target.value))
          }
          sx={{ width: 100, backgroundColor: 'white', marginLeft: 2 }}
          inputLabel="ジャンル"
          size="medium"
        />

        <TextField
          label="キーワード"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setSearchKeyword(keyword);
            }
          }}
          onBlur={() => {
            setSearchKeyword(keyword);
          }}
          sx={{ width: 300, backgroundColor: 'white' }}
          InputLabelProps={{
            sx: {
              color: 'black',
            },
          }}
        />
      </Stack>

      <Box
        sx={{
          flexGrow: 1,
          height: 'calc(100% - 72px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <InfiniteScrollCustomTable
          columns={columns}
          rows={products.filter((item) => item.item_id)}
          isLoading={loading}
          rowKey={(item) => item.id}
          sx={{
            flex: 1,
            backgroundColor: 'white',
          }}
        />
        <PaginationNav
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={rowCount}
          onPageChange={(newPage) => {
            setPage(newPage);
          }}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setPage(1);
          }}
        />
      </Box>
    </Box>
  );
};

export default PackTable;
