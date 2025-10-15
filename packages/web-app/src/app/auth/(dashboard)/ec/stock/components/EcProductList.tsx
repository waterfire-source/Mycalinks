import { StockDataGrid } from '@/app/auth/(dashboard)/stock/components/StockDataGrid';
import { ShopIcon } from '@/feature/ec/components/ShopIcon';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
import { ecShopCommonConstants } from '@/constants/ecShops';
import { Box, Checkbox, Typography } from '@mui/material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import React, { useMemo, useRef } from 'react';

type ProductListItem = {
  id: number;
  productImage: string | null;
  productName: string | null;
  condition: string | null;
  managementNumber: string | null;
  ecSellPrice: number | null;
  sellPrice: number | null;
  ecStockNumber: number | null;
  stockNumber: number | null;
  mycalinksEcEnable: boolean;
  ochanokoEcEnable: boolean;
  shopifyEcEnable: boolean;
  groupSize: number;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
};

interface Props {
  searchState: ProductSearchState;
  setSearchState: React.Dispatch<React.SetStateAction<ProductSearchState>>;
  selectedIds: number[];
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
  handleDetailModalOpen: (id: number) => void;
}

export const EcProductList = ({
  searchState,
  setSearchState,
  selectedIds,
  setSelectedIds,
  handleDetailModalOpen,
}: Props) => {
  // TableComponentと同じ商品名生成ロジック
  const generateDisplayName = (
    specialtyName: string | null,
    name: string,
    expansion: string | null,
    cardnumber: string | null,
    rarity: string | null,
  ) => {
    const displayParts = [
      expansion ? expansion : '',
      cardnumber ? cardnumber : '',
      rarity ? rarity : '',
    ]
      .filter(Boolean)
      .join(' ');

    return `${specialtyName ? '《' + specialtyName + '》' : ''} ${name}${
      displayParts ? ` (${displayParts})` : ''
    }`;
  };

  // グループ化されたテーブル用のデータ（同じ商品で束ねる）
  const productList = useMemo(() => {
    // グループ化のキーを作成（item_idと状態IDでグループ化）
    const groupedData = new Map<string, typeof searchState.searchResults>();

    searchState.searchResults.forEach((element) => {
      // item_idと状態IDの組み合わせでグループ化
      const groupKey = `${element.item_id}_${element.condition_option_id}_${
        element.specialty_id ?? 'none'
      }`;
      if (!groupedData.has(groupKey)) {
        groupedData.set(groupKey, []);
      }
      groupedData.get(groupKey)!.push(element);
    });

    // グループ化されたデータを平均化して表示用データに変換
    const flattenedData: ProductListItem[] = [];

    groupedData.forEach((group) => {
      // グループ内の商品を管理番号順にソート
      const sortedGroup = group.sort((a, b) => {
        const aNum = a.management_number || '';
        const bNum = b.management_number || '';
        return aNum.localeCompare(bNum);
      });

      const groupSize = sortedGroup.length;

      sortedGroup.forEach((element, index) => {
        const isFirstInGroup = index === 0;
        const isLastInGroup = index === sortedGroup.length - 1;

        // TableComponentと同じ商品名生成
        const displayName = generateDisplayName(
          element.specialty__display_name || null,
          element.display_name,
          element.item_expansion || null,
          element.item_cardnumber || null,
          element.item_rarity || null,
        );

        flattenedData.push({
          id: element.id,
          productImage: isFirstInGroup ? element.image_url : null,
          productName: isFirstInGroup ? displayName : null,
          condition: isFirstInGroup
            ? element.condition_option_display_name
            : null,
          managementNumber: element.management_number,
          ecSellPrice: element.actual_ec_sell_price,
          sellPrice: element.actual_sell_price,
          ecStockNumber: element.ec_stock_number,
          stockNumber: element.stock_number,
          mycalinksEcEnable: element.mycalinks_ec_enabled,
          ochanokoEcEnable: element.ochanoko_ec_enabled || false,
          shopifyEcEnable: element.shopify_ec_enabled || false,
          // TableComponentと同じグループ情報を追加
          groupSize,
          isFirstInGroup,
          isLastInGroup,
        });
      });
    });

    return flattenedData;
  }, [searchState.searchResults]);

  // 最後に選択されたアイテムのインデックスを記録
  const lastSelectedIndex = useRef<number | null>(null);

  // チェックボックスクリック時の処理（シフトキー範囲選択対応）
  const handleCheckboxClick = (id: number, event?: React.MouseEvent) => {
    const currentIndex = productList.findIndex((item) => item.id === id);

    if (event?.shiftKey && lastSelectedIndex.current !== null) {
      // Shiftキーが押されている場合、範囲選択
      const startIndex = Math.min(lastSelectedIndex.current, currentIndex);
      const endIndex = Math.max(lastSelectedIndex.current, currentIndex);

      const rangeIds = productList
        .slice(startIndex, endIndex + 1)
        .map((item) => item.id);

      setSelectedIds((prev) => {
        const newSelected = new Set(prev);
        rangeIds.forEach((rangeId) => newSelected.add(rangeId));
        return Array.from(newSelected);
      });
    } else {
      // 通常のクリック
      setSelectedIds((prev) => {
        if (prev.includes(id)) {
          // IDが既に配列に存在する場合は削除
          return prev.filter((existingId) => existingId !== id);
        } else {
          // 存在しない場合は追加
          return [...prev, id];
        }
      });
    }

    // 最後に選択されたインデックスを更新
    lastSelectedIndex.current = currentIndex;
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: '',
      flex: 0.05,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => {
        const allSelected =
          searchState.searchResults.length > 0 &&
          searchState.searchResults.every((row) =>
            selectedIds.includes(row.id),
          );
        const someSelected =
          searchState.searchResults.some((row) =>
            selectedIds.includes(row.id),
          ) && !allSelected;

        return (
          <Checkbox
            indeterminate={someSelected}
            checked={allSelected}
            onChange={(event) => {
              if (event.target.checked) {
                // すべて選択
                const allIds = searchState.searchResults.map((row) => row.id);
                setSelectedIds(allIds);
              } else {
                // すべて解除
                setSelectedIds([]);
              }
            }}
            sx={{
              color: 'primary.main',
              '&.Mui-checked': {
                color: 'primary.main',
              },
            }}
          />
        );
      },
      renderCell: (params) => {
        return (
          <Checkbox
            checked={selectedIds.includes(params.row.id)}
            onClick={(event) => {
              event.stopPropagation();
              handleCheckboxClick(params.row.id, event);
            }}
            onChange={(event) => {
              event.stopPropagation();
            }}
            sx={{
              color: 'primary.main',
              '&.Mui-checked': {
                color: 'primary.main',
              },
            }}
          />
        );
      },
    },
    {
      field: 'productImage',
      headerName: '商品画像',
      flex: 0.08,
      headerAlign: 'center',
      align: 'center',
      minWidth: 40,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        // グループの最初の行でない場合は何も表示しない
        if (!params.value) {
          return null;
        }
        return (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <ItemImage imageUrl={params.value} />
          </Box>
        );
      },
    },
    {
      field: 'productName',
      headerName: '商品名',
      flex: 0.2,
      headerAlign: 'left',
      align: 'left',
      minWidth: 40,
      renderCell: (params) => {
        // グループの最初の行でない場合は何も表示しない
        if (!params.value) {
          return null;
        }
        return (
          <Box display="flex" alignItems="center" height="100%">
            <ItemText text={params.value} />
          </Box>
        );
      },
    },
    {
      field: 'condition',
      headerName: '状態',
      flex: 0.1,
      headerAlign: 'left',
      align: 'left',
      minWidth: 40,
      renderCell: (params) => {
        // グループの最初の行でない場合は何も表示しない
        if (!params.value) {
          return null;
        }
        return (
          <Box display="flex" alignItems="center" height="100%">
            <Typography>{params.value}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'managementNumber',
      headerName: '管理番号',
      flex: 0.12,
      headerAlign: 'left',
      align: 'left',
      minWidth: 40,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography>
            {params.value === '' ? '未入力' : params.value || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'ecSellPrice',
      headerName: '出品価格（店舗価格）',
      flex: 0.13,
      headerAlign: 'left',
      align: 'left',
      minWidth: 40,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography>
            {params.row.ecSellPrice != null
              ? `${params.row.ecSellPrice.toLocaleString()}円`
              : '-円'}
            （
            {params.row.sellPrice != null
              ? `${params.row.sellPrice.toLocaleString()}円`
              : '-円'}
            ）
          </Typography>
        </Box>
      ),
    },
    {
      field: 'ecStockNumber',
      headerName: '出品数（在庫数）',
      flex: 0.13,
      headerAlign: 'left',
      align: 'left',
      minWidth: 40,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography>
            {params.row.ecStockNumber?.toString() ?? '-'}（
            {params.row.stockNumber?.toString() ?? '-'}）
          </Typography>
        </Box>
      ),
    },
    {
      field: 'sellingPlace',
      headerName: '出品先',
      flex: 0.12,
      headerAlign: 'left',
      align: 'left',
      minWidth: 40,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <ShopIcon
            shopInfo={ecShopCommonConstants.shopInfo.map((shop) => ({
              key: shop.key,
              displayName: shop.shopName,
              icon: shop.shopIconInfo,
              ImageUrl: shop.shopImageUrl,
            }))}
            width={20}
            height={20}
            productData={{
              mycalinks_ec_enabled: params.row.mycalinksEcEnable,
              ochanoko_ec_enabled: params.row.ochanokoEcEnable,
              shopify_ec_enabled: params.row.shopifyEcEnable,
            }}
          />
        </Box>
      ),
    },
  ];
  //ページネーションの処理
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    if (searchState.currentPage !== model.page) {
      handlePageChange(model.page);
    } else {
      handlePageSizeChange(model.pageSize);
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchState((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setSearchState((prev) => ({
      ...prev,
      itemsPerPage: newSize,
    }));
  };

  const onRowClick = (
    params: { row: ProductListItem },
    event: React.MouseEvent,
  ) => {
    const target = event.target as HTMLElement;

    // チェックボックスクリック時は onRowClick を発動させない
    if (target.closest('button') || target.closest('input[type="checkbox"]')) {
      return;
    }
    handleDetailModalOpen(params.row.id);
  };
  return (
    <StockDataGrid
      searchState={searchState}
      onPaginationModelChange={handlePaginationModelChange}
      rowCount={searchState.totalValues.itemCount}
      rows={productList}
      columns={columns}
      onRowClick={onRowClick}
      getRowClassName={(params) => {
        // TableComponentと同じロジック
        // グループのサイズを1の場合は常にボーダーあり
        if (params.row.groupSize === 1) {
          return ''; // 単一アイテムグループは常にボーダーあり
        }

        // グループのサイズが複数の場合
        const classes = [];
        if (!params.row.isLastInGroup) {
          classes.push('no-bottom-border');
        }
        if (!params.row.isFirstInGroup) {
          classes.push('no-top-border');
        }

        return classes.join(' ');
      }}
    />
  );
};
