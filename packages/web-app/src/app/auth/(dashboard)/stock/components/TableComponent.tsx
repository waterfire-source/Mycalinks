import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useEffect, useMemo, useState, useRef } from 'react';
import { Box, Checkbox, TextField, Typography } from '@mui/material';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import dayjs from 'dayjs';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';
import { StockDataGrid } from '@/app/auth/(dashboard)/stock/components/StockDataGrid';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { Chip } from '@/components/chips/Chip';
import { grey } from '@mui/material/colors';
import { HelpIcon } from '@/components/common/HelpIcon';

interface Props {
  searchState: ProductSearchState;
  setSearchState: React.Dispatch<React.SetStateAction<ProductSearchState>>;
  setIsDetailModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setProductId: React.Dispatch<React.SetStateAction<number | undefined>>;
  selectedIds: number[];
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
}

export const TableComponent = ({
  searchState,
  setSearchState,
  setIsDetailModalOpen,
  setProductId,
  selectedIds,
  setSelectedIds,
}: Props) => {
  const [tableData, setTableData] = useState<
    BackendProductAPI[0]['response']['200']['products'][0][]
  >([]);

  const [totalValues, setTotalValues] =
    useState<BackendProductAPI[0]['response']['200']['totalValues']>();
  const { pushQueue } = useLabelPrinterHistory();

  useEffect(() => {
    setTableData(searchState.searchResults);
  }, [searchState.searchResults]);

  useEffect(() => {
    setTotalValues(searchState.totalValues);
  }, [searchState.totalValues]);
  // チェックボックスクリック時の処理
  const lastCheckedIndex = useRef<number | null>(null);
  const handleCheckboxClick = (id: number, shiftKey: boolean) => {
    setSelectedIds((prev) => {
      // itemListのindexを使う
      const currentIndex = itemList.findIndex((row) => row.id === id);
      // すでに選択済みなら解除は常に許可
      if (prev.includes(id)) {
        lastCheckedIndex.current = currentIndex;
        return prev.filter((existingId) => existingId !== id);
      }
      // shiftキー押下時は範囲選択
      if (shiftKey && lastCheckedIndex.current !== null) {
        const lastIndex = lastCheckedIndex.current;
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const idsInRange = itemList.slice(start, end + 1).map((row) => row.id);
        // 既存の選択と重複しないものを追加
        const newSelected = Array.from(new Set([...prev, ...idsInRange]));
        lastCheckedIndex.current = currentIndex;
        return newSelected;
      }
      // 通常クリックは単一追加
      lastCheckedIndex.current = currentIndex;
      return [...prev, id];
    });
  };
  // テーブルデータ
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: '',
      flex: 0.075,
      headerAlign: 'center',
      align: 'center',
      sortable: false, // 並び替え矢印を無効化
      disableColumnMenu: true,
      renderHeader: () => {
        const allSelected =
          tableData.length > 0 &&
          tableData.every((row) => selectedIds.includes(row.id));
        const someSelected =
          tableData.some((row) => selectedIds.includes(row.id)) && !allSelected;

        return (
          <Checkbox
            indeterminate={someSelected} // 部分選択状態
            checked={allSelected} // すべて選択されているか
            onChange={(event) => {
              if (event.target.checked) {
                // すべて選択
                const allIds = tableData.map((row) => row.id);
                setSelectedIds(allIds);
              } else {
                // すべて解除
                setSelectedIds([]);
              }
            }}
            sx={{
              color: 'primary.main',
              '&.Mui-checked': {
                color: 'primary.main', // 選択時のボーダーとアイコンカラー
              },
            }}
          />
        );
      },
      renderCell: (params) => {
        return (
          <Checkbox
            checked={selectedIds.includes(params.row.id)}
            onChange={(event) => {
              event.stopPropagation();
              handleCheckboxClick(
                params.row.id,
                (event.nativeEvent as MouseEvent).shiftKey,
              );
            }}
            sx={{
              color: 'primary.main',
              '&.Mui-checked': {
                color: 'primary.main', // 選択時のボーダーとアイコンカラー
              },
            }}
          />
        );
      },
    },
    {
      field: 'productImage',
      headerName: '商品画像',
      flex: 0.1,
      headerAlign: 'center',
      align: 'center',
      minWidth: 40,
      renderCell: (params) => {
        return params.value ? (
          <ItemImage imageUrl={params.row.productImage} />
        ) : null;
      },
    },
    {
      field: 'productName',
      headerName: '商品名',
      minWidth: 200,
      flex: 0.3,
      headerAlign: 'left',
      align: 'center',
      renderCell: (params) => {
        const consignmentName = params.row.consignmentClientName;
        const displayName = params.row.productName;
        const genreDisplayName = params.row.genreDisplayName;
        const categoryDisplayName = params.row.categoryDisplayName;

        // グループの最初の行でない場合は何も表示しない
        if (!displayName) {
          return null;
        }

        return (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="center"
            height={'100%'}
          >
            <Box marginBottom="4px" width="100%">
              <ItemText text={displayName} />
              {consignmentName && (
                <ItemText
                  sx={{ color: grey[700], fontSize: '12px' }}
                  text={`委託者:${consignmentName}`}
                />
              )}
            </Box>
            {params.row.managementNumber !== null && (
              <Typography variant="caption" mb="4px">
                管理番号あり
              </Typography>
            )}

            <Box
              fontSize="0.875rem"
              color="grey.600"
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
              }}
            >
              <Chip text={genreDisplayName} variant="secondary" />
              <Typography
                variant="caption"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {'>'}
              </Typography>
              <Chip text={categoryDisplayName} variant="secondary" />
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'productState',
      headerName: '状態',
      flex: 0.1,
      headerAlign: 'left',
      align: 'left',
      minWidth: 80,
      renderCell: (params) => {
        return params.value ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'left',
              height: '100%',
            }}
          >
            <Typography>{params.value}</Typography>
          </Box>
        ) : null;
      },
    },
    {
      field: 'managementNumber',
      headerName: '管理番号',
      flex: 0.1,
      headerAlign: 'left',
      align: 'center',
      minWidth: 120,
      renderCell: (params) => {
        const managementNumber = params.row.managementNumber;
        if (managementNumber === null) {
          return null;
        }
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'left',
              height: '100%',
            }}
          >
            <Typography>
              {managementNumber === '' ? '未入力' : managementNumber}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'sellPrice',
      headerName: '販売価格',
      flex: 0.1,
      headerAlign: 'left',
      align: 'center',
      minWidth: 100,
      renderCell: (params) => {
        const sellPrice = params.row.sellPrice;
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'left',
              height: '100%',
            }}
          >
            <Typography color="secondary.main">
              {sellPrice.toLocaleString()}円
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'buyPrice',
      headerName: '買取価格',
      flex: 0.05,
      headerAlign: 'left',
      align: 'center',
      minWidth: 100,
      renderCell: (params) => {
        const buyPrice = params.row.buyPrice;
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'left',
              height: '100%',
            }}
          >
            <Typography color="primary.main">
              {buyPrice.toLocaleString()}円
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'averageWholesalePrice',
      headerName: '平均仕入価格',
      flex: 0.05,
      headerAlign: 'left',
      align: 'center',
      minWidth: 100,
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'left',
              height: '100%',
            }}
          >
            <Typography>
              {params.row.averageWholesalePrice
                ? params.row.averageWholesalePrice.toLocaleString() + '円'
                : ''}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'productStock',
      headerName: '在庫数',
      flex: 0.05,
      headerAlign: 'left',
      align: 'center',
      minWidth: 100,
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'left',
              height: '100%',
            }}
          >
            <Typography>
              {params.row.itemInfiniteStock
                ? '∞'
                : params.row.productStock.toLocaleString()}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'residencePeriod',
      headerName: '滞留期間',
      flex: 0.1,
      headerAlign: 'left',
      align: 'center',
      minWidth: 100,
      renderCell: (params) => {
        const residencePeriod = params.row.residencePeriod;
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'left',
              height: '100%',
            }}
          >
            <Typography>{residencePeriod.toLocaleString()}日</Typography>
          </Box>
        );
      },
    },
    {
      field: 'priceUpdate',
      headerName: '販売価格更新日',
      flex: 0.1,
      headerAlign: 'left',
      align: 'center',
      minWidth: 120,
    },
    {
      field: 'print',
      headerName: 'ラベル印刷',
      flex: 0.1,
      headerAlign: 'left',
      align: 'center',
      minWidth: 130,
      renderHeader: () => (
        <Box display="flex" alignItems="center" gap={0.5}>
          <span>ラベル印刷</span>
          <HelpIcon helpArchivesNumber={1533} />
        </Box>
      ),
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 0.5,
          }}
        >
          <TextField
            sx={{
              flex: 1,
              minWidth: '40px',
            }}
            size="small"
            type="number"
            placeholder="枚数"
            onClick={(e) => e.stopPropagation()}
            value={params.row.printCount ?? ''}
            onChange={(e) => {
              setSearchState((prev) => ({
                ...prev,
                searchResults: searchState.searchResults.map((row) =>
                  row.id == params.row?.id
                    ? {
                        ...row,
                        printCount: e.target.value
                          ? Math.max(Number(e.target.value), 0)
                          : undefined,
                      }
                    : row,
                ),
              }));
            }}
          />
          <PrimaryButtonWithIcon
            sx={{
              minWidth: '40px',
            }}
            onClick={async (e) => {
              e.stopPropagation();

              //在庫数>指定した枚数の場合→価格無しラベルのみ
              //在庫数=指定した枚数の場合→価格ありラベル1枚+残り価格無しラベル

              const productId = params.row?.id;
              const printCount = params.row?.printCount ?? 1;
              const stockNumber = params.row.productStock ?? 0;

              let isFirstStock = stockNumber <= printCount;

              for (let i = 0; i < printCount; i++) {
                pushQueue({
                  template: 'product',
                  data: productId,
                  meta: {
                    isFirstStock,
                    isManual: true,
                  },
                });
                isFirstStock = false; //2枚目以降はfalseで
              }
            }}
          >
            印刷
          </PrimaryButtonWithIcon>
        </Box>
      ),
    },
  ];

  // グループ化されたテーブル用のデータ（管理番号ごとに行分け、2行目以降は商品情報空白）
  const itemList = useMemo(() => {
    // グループ化のキーを作成
    const groupedData = new Map<string, typeof tableData>();
    const generateDisplayName = (
      specialtyName: string | null,
      name: string,
      expansion: string | null,
      cardnumber: string | null,
      rarity: string | null,
    ) => {
      return `${specialtyName ? '《' + specialtyName + '》' : ''} ${name} (${
        expansion ? expansion : ''
      } ${cardnumber ? cardnumber : ''} ${rarity ? rarity : ''})`;
    };

    tableData.forEach((element) => {
      const groupKey = `${element.item_id}_${
        element.condition_option_display_name ?? 'none'
      }_${element.is_special_price_product ? element.id : 'normal'}_${
        element.specialty_id
      }_${element.consignment_client_id ?? 'none'}_${
        element.management_number !== null
          ? 'has_management_number'
          : 'no_management_number'
      }`;

      if (!groupedData.has(groupKey)) {
        groupedData.set(groupKey, []);
      }
      groupedData.get(groupKey)!.push(element);
    });

    // グループ化されたデータを平坦化して表示用データに変換（管理番号ごとに行分け）
    const flattenedData: any[] = [];

    groupedData.forEach((group) => {
      // グループ内の商品を管理番号順にソート
      const sortedGroup = group.sort((a, b) => {
        const aNum = a.management_number || '';
        const bNum = b.management_number || '';
        return aNum.localeCompare(bNum);
      });

      sortedGroup.forEach((element, index) => {
        const isFirstInGroup = index === 0;
        const isLastInGroup = index === sortedGroup.length - 1;
        const displayName = generateDisplayName(
          element.specialty__display_name,
          element.display_name,
          element.item_expansion,
          element.item_cardnumber,
          element.item_rarity,
        );
        flattenedData.push({
          id: element.id,
          productImage: isFirstInGroup ? element.image_url : null,
          productName: isFirstInGroup ? displayName : null,
          genreDisplayName: element.item_genre_display_name,
          categoryDisplayName: element.item_category_display_name,
          productState: isFirstInGroup
            ? element.is_special_price_product
              ? '特価'
              : element.condition_option_display_name
            : null,
          managementNumber: element.management_number, // 単一の管理番号
          consignmentClientName: element.consignment_client__full_name,
          printCount: element.printCount,
          sellPrice: element.specific_sell_price ?? element.sell_price ?? 0,
          buyPrice: element.specific_buy_price ?? element.buy_price ?? 0,
          averageWholesalePrice: element.average_wholesale_price ?? '',
          productStock: element.stock_number ?? 0,
          residencePeriod: calculateStagnationPeriod(element.updated_at),
          priceUpdate: element.sell_price_updated_at
            ? dayjs(element.sell_price_updated_at).format('YYYY/MM/DD')
            : '',
          stockQuantity: element.stock_number,
          itemInfiniteStock: element.item_infinite_stock,
          isFirstInGroup, // グループの最初の行かどうかのフラグ
          isLastInGroup, // グループの最後の行かどうかのフラグ
          groupSize: sortedGroup.length, // グループのサイズ
        });
      });
    });

    return flattenedData;
  }, [tableData]);

  //滞留期間を求める処理
  function calculateStagnationPeriod(lastSellingDate: string | Date): number {
    const lastDate = new Date(lastSellingDate);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const openModal = (id: number) => {
    setProductId(id);
    setIsDetailModalOpen(true);
  };

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

  return (
    <StockDataGrid
      searchState={searchState}
      onPaginationModelChange={handlePaginationModelChange}
      rowCount={totalValues?.itemCount}
      // rowCount={-1}
      rows={itemList}
      columns={columns}
      getRowClassName={(params) => {
        // グループのサイズが1の場合は常にボーダーあり
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
      onRowClick={(params, event) => {
        const target = event.target as HTMLElement;

        // チェックボックスのセルをクリックした場合はモーダルを開かない
        if (
          target.closest('.MuiCheckbox-root') || // チェックボックスのクリック
          target.tagName === 'INPUT' // チェックボックスの内部要素 (input) をクリック
        ) {
          return; // モーダルを開かない
        }

        // モーダルを開くロジック
        openModal(params.row.id);
      }}
    />
  );
};