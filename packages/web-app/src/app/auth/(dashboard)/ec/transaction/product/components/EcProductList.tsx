import { useState, useEffect, useMemo } from 'react';
import {
  CustomTabTable,
  ColumnDef,
  TabDef,
} from '@/components/tabs/CustomTabTable';
import { Box, Grid, Typography } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { EcProductDetail } from '@/app/auth/(dashboard)/ec/transaction/product/components/EcProductDetail';
import {
  Item,
  ItemWithEcOrderSearchState,
  ListItemWithEcOrderResponse,
} from '@/feature/ec/hooks/type';
import { ItemText } from '@/feature/item/components/ItemText';
import { ItemImage } from '@/feature/item/components/ItemImage';

interface Props {
  storeId: number;
  items: ListItemWithEcOrderResponse['items'];
  searchTotalCount: number;
  searchState: ItemWithEcOrderSearchState;
  setSearchState: React.Dispatch<
    React.SetStateAction<ItemWithEcOrderSearchState>
  >;
  searchDate: {
    startDate: string;
    endDate: string;
  };
  isLoading: boolean;
}

export const EcProductList = ({
  storeId,
  items,
  searchTotalCount,
  searchState,
  setSearchState,
  searchDate,
  isLoading,
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
        item.ecOrderCartStoreProducts
          ? item.ecOrderCartStoreProducts
              .map(
                (ecOrderCartStoreProduct) => ecOrderCartStoreProduct.product.id,
              )
              .toString()
          : ''
      }`,
    }));
  }, [items]);

  // 選択された取引
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

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
        searchCurrentPage: 0,
      };
    });
  };
  // ソート条件のリセット
  const resetSort = () => {
    setSearchState((prev) => ({
      ...prev,
      orderBy: undefined,
      searchCurrentPage: 0,
    }));
  };

  // ------------------------------------------
  // タブの定義
  // ------------------------------------------
  const productTabs: TabDef<Item>[] = useMemo(() => {
    const tabs = [{ label: 'すべて', value: 'all' }];
    const genreOptions = genre?.itemGenres.map((genre) => ({
      label: genre.display_name,
      value: genre.id.toString(),
    }));
    return genreOptions ? tabs.concat(genreOptions) : tabs;
  }, [genre]);
  // タブ(ジャンル)が切り替わった際の処理
  const handleTabChange = (value: string) => {
    const newSearchGenreId: number | undefined =
      value !== 'all' ? Number(value) : undefined;
    setSearchState((prev) => ({
      ...prev,
      genreId: newSearchGenreId,
      searchCurrentPage: 0,
    }));
  };

  // ------------------------------------------
  // カラム定義
  // ------------------------------------------
  const productColumns: ColumnDef<Item>[] = useMemo(() => {
    return [
      {
        header: '画像',
        key: 'image',
        render: (item) => (
          <ItemImage imageUrl={item.item.image_url ?? null} height={60} />
        ),
      },
      {
        header: '商品',
        key: 'productName',
        render: (item) => {
          const metaText = [
            item.item.expansion,
            item.item.cardnumber,
            item.item.rarity,
          ]
            .filter(Boolean)
            .join(' ');

          const displayMetaText = metaText ? `(${metaText})` : '';
          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'start',
                justifyContent: 'center',
              }}
            >
              <ItemText
                text={item.item.display_name ?? ''}
                sx={{ fontWeight: 'bold' }}
              />
              <Typography variant="caption" sx={{ whiteSpace: 'normal' }}>
                {displayMetaText}
              </Typography>
            </Box>
          );
        },
      },
      {
        header: '取引点数',
        key: 'tradeScore',
        render: (item) => (
          <Box minWidth="65px">
            {Number(item.ecOrderStats.ecOrderItemCount).toLocaleString()}
          </Box>
        ),
        isSortable: true,
        onSortChange: (direction: 'asc' | 'desc' | undefined) => {
          handleSort(direction, 'total_item_count');
        },
      },
      {
        header: '取引件数',
        key: 'tradeCount',
        render: (item) => (
          <Box minWidth="65px">
            {Number(item.ecOrderStats.ecOrderCount).toLocaleString()}
          </Box>
        ),
        isSortable: true,
        onSortChange: (direction: 'asc' | 'desc' | undefined) => {
          handleSort(direction, 'total_order_count');
        },
      },
      {
        header: '取引総額',
        key: 'totalPrice',
        render: (item) => (
          <Box minWidth="65px">
            {Number(item.ecOrderStats.ecOrderTotalPrice).toLocaleString() +
              '円'}
          </Box>
        ),
        isSortable: true,
        onSortChange: (direction: 'asc' | 'desc' | undefined) => {
          handleSort(direction, 'total_price');
        },
      },
      {
        header: '',
        key: 'detail',
        render: () => <ArrowForwardIosIcon />,
      },
    ];
  }, []);

  // ------------------------------------------
  // ページネーション
  // ------------------------------------------
  const handleRowPerPageChange = (newItemPerPage: number) => {
    setSearchState((prev) => {
      return {
        ...prev,
        searchCurrentPage: 0,
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
          rowKey={(item) => String(item.item_id)}
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
        />
      </Grid>

      <Grid item xs={4} sx={{ height: 'calc(100% - 40px)', mt: '40px' }}>
        {/* 選択中のアイテム詳細 */}
        <EcProductDetail
          storeId={storeId}
          itemId={selectedItem?.item_id}
          orderCreatedAtGte={searchDate.startDate}
          orderCreatedAtLt={searchDate.endDate}
        />
      </Grid>
    </>
  );
};
