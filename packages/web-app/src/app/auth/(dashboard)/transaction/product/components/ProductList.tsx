import { useState, useEffect, useMemo } from 'react';
import { ItemWithTransactionSearchState } from '@/feature/transaction/hooks/useListItemsWithTransaction';
import { ProductDetail } from '@/app/auth/(dashboard)/transaction/product/components/ProductDetail';
import {
  CustomTabTable,
  ColumnDef,
  TabDef,
} from '@/components/tabs/CustomTabTable';
import TagLabel from '@/components/common/TagLabel';
import { Box, Grid, SelectChangeEvent, Stack, Typography } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { TransactionKind } from '@prisma/client';
import { ItemAPIRes } from '@/api/frontend/item/api';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { CategorySelectOnServer } from '@/feature/products/components/searchTable/CategorySelectOnServer';
import { ItemText } from '@/feature/item/components/ItemText';

type Item = ItemAPIRes['listItemWithTransaction']['items'][0];

/**
 * ProductListコンポーネントで受け取るprops
 */
interface Props {
  storeId: number;
  items: Item[];
  searchTotalCount: number;
  searchState: ItemWithTransactionSearchState;
  setSearchState: React.Dispatch<
    React.SetStateAction<ItemWithTransactionSearchState>
  >;
  searchDate: {
    startDate: string;
    endDate: string;
  };
  isLoading?: boolean; // ローディング状態を親から受け取る場合
  customerId?: number; // 顧客単位の取引情報を取得する場合（顧客管理からの呼び出し）
}

export const ProductList = ({
  storeId,
  items,
  searchTotalCount,
  searchState,
  setSearchState,
  searchDate,
  isLoading = false,
  customerId,
}: Props) => {
  // ジャンル一覧取得
  const { genre, fetchGenreList } = useGenre();

  useEffect(() => {
    if (storeId) {
      fetchGenreList();
    }
  }, [fetchGenreList, storeId]);

  // itemsのkeyが一意になるように
  const itemList = useMemo(() => {
    return items.map((item) => ({
      ...item,
      id: `${item.item_id}-${
        item.transactions
          ? item.transactions
              .map((transaction) => transaction.product.id)
              .toString()
          : ''
      }`,
    }));
  }, [items]);

  // 選択中のアイテムを保持
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // ------------------------------------------
  // 取引種類フィルタリング用
  // ------------------------------------------
  type TransactionKindKeyValueType = Record<TransactionKind, string>;
  const transactionKindKeyValue: TransactionKindKeyValueType = {
    sell: '販売',
    buy: '買取',
  };
  const getTransactionKindValue = (
    transactionKind: TransactionKind | null,
  ): string => {
    return transactionKind ? transactionKindKeyValue[transactionKind] : '';
  };
  const getTransactionKindKey = (
    transactionKindValue: string,
  ): TransactionKind | '' => {
    const entry = Object.entries(transactionKindKeyValue).find(
      ([_, value]) => value === transactionKindValue,
    );
    // エントリが見つかれば key を返し、見つからなければ '' を返す
    return entry ? (entry[0] as TransactionKind) : '';
  };
  // ステータス変更
  const handleTransactionKindKeyChange = (transactionKindValue: string) => {
    const transactionKindKey = getTransactionKindKey(transactionKindValue);
    setSearchState((prev) => ({
      ...prev,
      transactionKind: transactionKindKey,
    }));
  };

  // ------------------------------------------
  // サーバーソート
  // ------------------------------------------
  const handleSort = (
    direction: 'asc' | 'desc' | undefined,
    sortBy: string,
  ) => {
    const field = `${direction === 'desc' ? '-' : ''}${sortBy}`;
    setSearchState((prev) => {
      const prevOrderBy = prev.orderBy || [];
      // directionが指定なしの場合はソート条件を削除
      // 指定なしの際、directionはundefinedが期待されるが、CustomTabTableから空文字列が渡されている点に注意(2025/08/03 Kokai)
      if (!direction) {
        const newOrderBy = prevOrderBy.filter(
          (order) => order.replace('-', '') !== sortBy,
        );
        return {
          ...prev,
          orderBy: newOrderBy,
        };
      }

      // 既に指定されていればフィールドを置き換え、無ければ後ろに追加する
      const existingIndex = prevOrderBy.findIndex(
        (order) => order.replace('-', '') === field.replace('-', ''),
      );
      const newOrderBy =
        existingIndex !== -1
          ? [
              ...prevOrderBy.slice(0, existingIndex),
              field,
              ...prevOrderBy.slice(existingIndex + 1),
            ]
          : [...prevOrderBy, field];
      return {
        ...prev,
        orderBy: newOrderBy,
      };
    });
  };

  // ソート条件のリセット
  const resetSort = () => {
    setSearchState((prev) => ({
      ...prev,
      orderBy: [],
    }));
  };

  // ------------------------------------------
  // タブの定義 (販売/買取/すべて)
  // ------------------------------------------
  const productTabs: TabDef<Item>[] = useMemo(() => {
    const tabs = [{ label: 'すべて', value: 'all' }];
    const genreOptions = genre?.itemGenres.map((genre) => ({
      label: genre.display_name,
      value: genre.id.toString(),
    }));
    return genreOptions ? tabs.concat(genreOptions) : tabs;
  }, [genre]);
  // タブが切り替わった際の処理
  const handleTabChange = (value: string) => {
    const newSearchGenreId: number | undefined =
      value !== 'all' ? Number(value) : undefined;
    setSearchState((prev) => ({
      ...prev,
      searchGenreId: newSearchGenreId,
    }));
  };
  // カテゴリーの変更
  const handleCategoryChange = (e: SelectChangeEvent<string | number>) => {
    setSearchState((prev) => ({
      ...prev,
      searchCategoryId: Number(e.target.value),
    }));
  };

  // ------------------------------------------
  // カラム定義
  // ------------------------------------------
  const productColumns: ColumnDef<Item>[] = [
    {
      header: '取引種類',
      key: 'transaction_kind',
      render: (item) => (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            padding: '6px 12px',
            minWidth: '65px',
          }}
        >
          <TagLabel
            backgroundColor={
              item.transaction_kind === 'sell'
                ? 'secondary.main'
                : 'primary.main'
            }
            color="white"
            width="100%"
            height="80%"
            fontSize="0.875rem"
            borderRadius="8px"
          >
            {getTransactionKindValue(item.transaction_kind)}
          </TagLabel>
        </Box>
      ),
      filterConditions: Object.values(transactionKindKeyValue),
      onFilterConditionChange: (condition) => {
        handleTransactionKindKeyChange(condition);
      },
    },
    {
      header: '画像',
      key: 'image',
      render: (item) => (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
          height="100%"
        >
          <ItemImage height={60} fill imageUrl={item.item.image_url} />
        </Box>
      ),
    },
    {
      header: '商品',
      key: 'productName',
      render: (item) => (
        <Stack alignItems="center">
          <ItemText text={item.item.display_name ?? ''} />
          <Typography variant="caption">
            {[item.item.expansion, item.item.cardnumber, item.item.rarity]
              .filter(Boolean)
              .join(' ')}
          </Typography>
        </Stack>
      ),
    },
    {
      header: '取引点数',
      key: 'tradeScore',
      render: (item) => (
        <Box minWidth="65px">
          {Number(
            item.transactionStats.transactionProductsCount,
          ).toLocaleString()}
        </Box>
      ),
      isSortable: true,
      onSortChange: (direction: 'asc' | 'desc' | undefined) => {
        handleSort(direction, 'transactionProductsCount');
      },
    },
    {
      header: '取引件数',
      key: 'tradeCount',
      render: (item) => (
        <Box minWidth="65px">
          {Number(item.transactionStats.transactionCount).toLocaleString()}
        </Box>
      ),
      isSortable: true,
      onSortChange: (direction: 'asc' | 'desc' | undefined) => {
        handleSort(direction, 'transactionCount');
      },
    },
    {
      header: '取引総額',
      key: 'totalPrice',
      render: (item) => (
        <Box minWidth="65px">
          {Number(
            item.transactionStats.transactionTotalPrice,
          ).toLocaleString() + '円'}
        </Box>
      ),
      isSortable: true,
      onSortChange: (direction: 'asc' | 'desc' | undefined) => {
        handleSort(direction, 'transactionTotalPrice');
      },
    },
    {
      header: '',
      key: 'detail',
      render: () => <ArrowForwardIosIcon />,
    },
  ];

  const handleRowPerPageChange = (newItemPerPage: number) => {
    setSearchState((prev) => {
      return {
        ...prev,
        searchItemPerPage: newItemPerPage,
      };
    });
  };
  const handlePrevPagination = () => {
    if (searchState.searchCurrentPage > 0) {
      setSearchState((prev) => {
        return {
          ...prev,
          searchCurrentPage: prev.searchCurrentPage - 1,
        };
      });
    }
  };
  const handleNextPagination = () => {
    if (
      searchState.searchCurrentPage * searchState.searchItemPerPage <
      searchTotalCount
    ) {
      setSearchState((prev) => {
        return {
          ...prev,
          searchCurrentPage: prev.searchCurrentPage + 1,
        };
      });
    }
  };

  return (
    <>
      <Grid item xs={8} sx={{ height: '100%' }}>
        <CustomTabTable<Item>
          data={itemList}
          columns={productColumns}
          tabs={productTabs}
          rowKey={(item) => `${String(item.item_id)}-${item.transaction_kind}`}
          onRowClick={(item) => setSelectedItem(item)}
          selectedRow={selectedItem}
          onTabChange={handleTabChange}
          isLoading={isLoading}
          resetSortConditions={resetSort}
          isShowFooterArea={true}
          currentPage={searchState.searchCurrentPage}
          rowPerPage={searchState.searchItemPerPage}
          totalRow={searchTotalCount}
          handleRowPerPageChange={handleRowPerPageChange}
          handlePrevPagination={handlePrevPagination}
          handleNextPagination={handleNextPagination}
          variant="scrollable"
          scrollButtons={false}
          tableWrapperSx={{ height: 'calc(100% - 160px)' }}
          tabTableWrapperSx={{ flex: 1 }}
          addFilter={
            <CategorySelectOnServer
              onSelect={handleCategoryChange}
              formControlSx={{
                width: '100px',
                minWidth: '100px',
                '@media (min-width: 1400px)': {
                  width: '120px',
                  minWidth: '120px',
                },
              }}
            />
          }
        />
      </Grid>

      <Grid item xs={4} sx={{ height: 'calc(100% - 40px)', mt: '40px' }}>
        {/* 選択中のアイテム詳細 */}
        <ProductDetail
          storeId={storeId}
          itemId={selectedItem?.item_id}
          transactionFinishedAtGte={searchDate.startDate}
          transactionFinishedAtLt={searchDate.endDate}
          resultTransactionKind={selectedItem?.transaction_kind}
          customerId={customerId}
        />
      </Grid>
    </>
  );
};
