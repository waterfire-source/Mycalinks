import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import {
  Box,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { jaJP } from '@mui/x-data-grid/locales';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { Chip } from '@/components/chips/Chip';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useAlert } from '@/contexts/AlertContext';
import { TableRow } from '@/feature/item/components/search/ItemSearchLayout';
import NumericTextField from '@/components/inputFields/NumericTextField';
import theme from '@/theme';

interface InputFieldConfig {
  columnName: string; // カラム名（例: 'customPrice', 'discount', 'margin'）
  headerName: string; // 表示名（例: '特別価格', '割引額', '利幅'）
  suffix: string; // 単位（例: '円', '%', '個'）
  minWidth?: number; // 最小幅
  defaultValue?: number; // デフォルト値
  defaultProperty?: string; // デフォルトの値のプロパティ名(product内のプロパティ)
}

export interface ColumnVisibility {
  showItemImage?: boolean;
  showItemName?: boolean;
  showItemCondition?: boolean;
  showSellPrice?: boolean;
  showBuyPrice?: boolean;
  showTotalStockNumber?: boolean;
  showProductStockNumber?: boolean;
  showAverageWholesale?: boolean;
  // 汎用的な入力フィールド設定（従来のshowWholesalePriceを置き換え）
  inputFields?: InputFieldConfig[];
  showCount?: boolean;
  showAction?: boolean;
}

const DEFAULT_COLUMN_VISIBILITY: ColumnVisibility = {
  showItemImage: true,
  showItemName: true,
  showItemCondition: true,
  showSellPrice: true,
  showBuyPrice: true,
  showTotalStockNumber: true,
  showProductStockNumber: true,
  showAverageWholesale: true,
  inputFields: [],
  showCount: true,
  showAction: true,
};

interface Props {
  searchState: ItemSearchState;
  setSearchState: React.Dispatch<React.SetStateAction<ItemSearchState>>;
  tableData: TableRow[];
  setTableData: React.Dispatch<React.SetStateAction<TableRow[]>>;
  columnVisibility?: ColumnVisibility;
  actionButtonText?: string;
  onClickAction?: (
    data: TableRow,
    count: number,
    customFieldValues: Record<string, number>,
  ) => Promise<void>;
}

export const ItemDataTable = ({
  searchState,
  setSearchState,
  tableData,
  setTableData,
  columnVisibility,
  actionButtonText,
  onClickAction,
}: Props) => {
  const { setAlertState } = useAlert();

  // columnVisibilityをマージ
  const mergedVisibility: ColumnVisibility = {
    ...DEFAULT_COLUMN_VISIBILITY,
    ...(columnVisibility ?? {}), // undefinedなら空オブジェクト
  };

  // 各商品の数量を管理するstate
  const [counts, setCounts] = useState<Record<number, number>>({});
  // カスタムフィールド値を管理（フィールド名 → 商品ID → 値）
  const [customFieldValues, setCustomFieldValues] = useState<
    Record<string, Record<number, number>>
  >({});

  const isTablet = useMediaQuery(theme.breakpoints.down('xl'));

  const [loading, setLoading] = useState(false);

  const handleConditionChange = (itemId: number, newConditionId: number) => {
    setTableData((prev) => {
      return prev.map((p) =>
        p.id === itemId ? { ...p, selectedConditionId: newConditionId } : p,
      );
    });
  };

  // テーブルデータ
  const allColumns: GridColDef[] = [
    {
      field: 'itemImage',
      headerName: '商品画像',
      flex: 0.1,
      headerAlign: 'center',
      align: 'center',
      minWidth: 100,
      renderCell: (params) => {
        return <ItemImage imageUrl={params.row.itemImage} />;
      },
    },
    {
      field: 'itemName',
      headerName: '商品名・平均仕入れ値・販売価格・現在庫',
      minWidth: isTablet ? 150 : 250,
      flex: 0.4,
      headerAlign: 'left',
      align: 'center',
      renderCell: (params) => {
        const displayName = params.row.itemName;
        const genreDisplayName = params.row.genreDisplayName;
        const categoryDisplayName = params.row.categoryDisplayName;

        const targetItem = tableData.find((t) => t.id === params.row.id);
        if (!targetItem) return null;
        const currentProduct = targetItem.products.find(
          (p) =>
            p.condition_option_id === targetItem.selectedConditionId &&
            p.specialty_id == targetItem.selectedSpecialtyId &&
            !p.management_number &&
            !p.consignment_client_id &&
            !p.is_special_price_product,
        );

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
            </Box>

            <Box
              fontSize="0.875rem"
              color="grey.600"
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                pb: 1,
              }}
            >
              {genreDisplayName && (
                <Chip text={genreDisplayName} variant="secondary" />
              )}
              {genreDisplayName && categoryDisplayName && (
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
              )}
              {categoryDisplayName && (
                <Chip text={categoryDisplayName} variant="secondary" />
              )}
            </Box>
            <Box
              color="grey.600"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'start',
              }}
            >
              <Typography variant="caption">
                平均仕入れ値：
                {currentProduct?.average_wholesale_price?.toLocaleString() ??
                  '-'}
                円
              </Typography>
              <Typography variant="caption">
                販売価格：
                {currentProduct?.actual_sell_price?.toLocaleString() ?? '-'}円
              </Typography>

              <Typography variant="caption">
                現在庫：
                {currentProduct?.stock_number.toLocaleString() ?? '-'}個
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'itemCondition',
      headerName: '状態',
      flex: 0.1,
      headerAlign: 'center',
      align: 'center',
      minWidth: 120,
      renderCell: (params) => {
        const products = params.row.filteredProducts;
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
            }}
          >
            <Select
              value={params.row.conditionId}
              onChange={(e) => {
                handleConditionChange(params.row.id, e.target.value);
              }}
              sx={{ height: '35px' }}
            >
              {products.map((p: any) => (
                <MenuItem
                  key={p.condition_option_id}
                  value={p.condition_option_id}
                >
                  {p.condition_option_display_name}
                </MenuItem>
              ))}
            </Select>
          </Box>
        );
      },
    },
    {
      field: 'totalStockNumber',
      headerName: '総在庫',
      flex: 0.1,
      headerAlign: 'center',
      align: 'center',
      minWidth: 80,
    },
    {
      field: 'buyPrice',
      headerName: '買取価格',
      flex: 0.1,
      headerAlign: 'center',
      align: 'center',
      minWidth: 90,
      renderCell: (params) => {
        const targetItem = tableData.find((t) => t.id === params.row.id);
        if (!targetItem) return null;
        const currentProduct = targetItem.products.find(
          (p) =>
            p.condition_option_id === targetItem.selectedConditionId &&
            p.specialty_id == targetItem.selectedSpecialtyId &&
            !p.management_number &&
            !p.consignment_client_id &&
            !p.is_special_price_product,
        );
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Typography color="primary.main">
              {currentProduct?.actual_buy_price
                ? `${currentProduct.actual_buy_price.toLocaleString()}円`
                : '-'}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'count',
      headerName: '数量',
      flex: 0.1,
      headerAlign: 'center',
      align: 'center',
      minWidth: 95,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <NumericTextField
            sx={{
              width: '80px',
            }}
            size="small"
            suffix="個"
            onClick={(e) => e.stopPropagation()}
            value={counts[params.row.id] ?? 1}
            onChange={(newValue) => {
              setCounts((prev) => ({
                ...prev,
                [params.row.id]: newValue || 0,
              }));
            }}
          />
        </Box>
      ),
    },
    {
      field: 'action',
      headerName: '',
      flex: 0.1,
      headerAlign: 'center',
      align: 'center',
      minWidth: 80,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <PrimaryButton
            sx={{
              minWidth: '60px',
            }}
            loading={loading}
            onClick={async () => {
              if (!onClickAction) return;
              setLoading(true);

              const item = tableData.find((item) => item.id === params.row.id);
              if (!item) {
                setLoading(false);
                return setAlertState({
                  message: '商品データが見つかりませんでした',
                  severity: 'error',
                });
              }

              const currentProduct = item.products.find(
                (p) =>
                  p.condition_option_id === item.selectedConditionId &&
                  p.specialty_id == item.selectedSpecialtyId &&
                  !p.management_number &&
                  !p.consignment_client_id &&
                  !p.is_special_price_product,
              );
              // カスタムフィールド値を集約
              const fieldValues: Record<string, number> = {};
              (mergedVisibility.inputFields || []).forEach((field) => {
                fieldValues[field.columnName] =
                  customFieldValues[field.columnName]?.[params.row.id] ??
                  (field.defaultProperty
                    ? (currentProduct as Record<string, unknown>)?.[
                        field.defaultProperty
                      ]
                    : field.defaultValue) ??
                  0;
              });

              await onClickAction(item, counts[item.id] ?? 1, fieldValues);
              setLoading(false);
            }}
          >
            {actionButtonText || '登録'}
          </PrimaryButton>
        </Box>
      ),
    },
  ];

  // 汎用入力フィールド生成関数
  const createInputField = (config: InputFieldConfig): GridColDef => {
    return {
      field: config.columnName,
      headerName: config.headerName,
      flex: 0.1,
      headerAlign: 'center',
      align: 'center',
      minWidth: config.minWidth || 140,
      renderCell: (params) => {
        const targetItem = tableData.find((t) => t.id === params.row.id);
        if (!targetItem) return null;
        const currentProduct = targetItem.products.find(
          (p) =>
            p.condition_option_id === targetItem.selectedConditionId &&
            p.specialty_id == targetItem.selectedSpecialtyId &&
            !p.management_number &&
            !p.consignment_client_id &&
            !p.is_special_price_product,
        );

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <NumericTextField
              sx={{ width: '100%' }}
              suffix={config.suffix}
              size="small"
              onClick={(e) => e.stopPropagation()}
              value={
                customFieldValues[config.columnName]?.[params.row.id] ??
                (config.defaultProperty
                  ? (currentProduct as Record<string, unknown>)?.[
                      config.defaultProperty
                    ]
                  : config.defaultValue) ??
                0
              }
              onChange={(newValue) => {
                setCustomFieldValues((prev) => ({
                  ...prev,
                  [config.columnName]: {
                    ...prev[config.columnName],
                    [params.row.id]: newValue || 0,
                  },
                }));
              }}
            />
          </Box>
        );
      },
    };
  };

  // カラム表示制御
  const columns = useMemo(() => {
    const columnKeyMap: Record<string, keyof ColumnVisibility> = {
      itemImage: 'showItemImage',
      itemName: 'showItemName',
      itemCondition: 'showItemCondition',
      sellPrice: 'showSellPrice',
      buyPrice: 'showBuyPrice',
      averageWholesalePrice: 'showAverageWholesale',
      totalStockNumber: 'showTotalStockNumber',
      productStockNumber: 'showProductStockNumber',
      count: 'showCount',
      action: 'showAction',
    };

    // 基本カラムをフィルタリング
    const basicColumns = allColumns.filter((column) => {
      const visibilityKey = columnKeyMap[column.field];

      // アクションボタンまたは数量カラムの表示制御
      if (visibilityKey === 'showAction' || visibilityKey === 'showCount') {
        if (!onClickAction) {
          return false; // アクションボタンがない場合は表示しない
        }
      }

      return visibilityKey ? mergedVisibility[visibilityKey] === true : false;
    });

    // カスタム入力フィールドを追加
    const customInputColumns = (mergedVisibility.inputFields || []).map(
      createInputField,
    );

    // count（数量）とaction（アクション）カラムを分離
    const countColumn = basicColumns.find((col) => col.field === 'count');
    const actionColumn = basicColumns.find((col) => col.field === 'action');
    const otherColumns = basicColumns.filter(
      (col) => col.field !== 'count' && col.field !== 'action',
    );

    return [
      ...otherColumns,
      ...customInputColumns, // カスタムフィールドを数量より手前に配置
      ...(countColumn ? [countColumn] : []), // 数量カラム
      ...(actionColumn ? [actionColumn] : []), // アクションカラム（最後）
    ];
  }, [allColumns, mergedVisibility, onClickAction, customFieldValues]);

  // テーブル表示用のデータ変換
  const itemList = useMemo(() => {
    return tableData.map((element) => {
      const filteredProducts = Array.from(
        new Map(
          element.products
            .filter(
              (p) =>
                !p.is_special_price_product &&
                !p.specialty_id &&
                p.management_number === null &&
                !p.consignment_client_id &&
                p.condition_option_id,
            )
            .map((p) => [p.condition_option_id, p]),
        ).values(),
      );

      const conditionId =
        element.selectedConditionId ?? filteredProducts[0]?.condition_option_id;

      return {
        id: element.id,
        itemImage: element.image_url,
        itemName: element.displayNameWithMeta,
        products: element.products,
        filteredProducts,
        genreDisplayName: element.genre_display_name,
        categoryDisplayName: element.category_display_name,
        conditionId: conditionId,
        sellPrice: element.sell_price,
        buyPrice: element.buy_price,
        totalStockNumber: element.products_stock_number,
      };
    });
  }, [tableData]);

  // ページネーションの処理
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
      currentPage: 0,
    }));
  };

  return (
    <Box
      sx={{
        minHeight: 0,
        height: '100%',
        width: '100%',
      }}
    >
      <DataGrid
        pagination
        paginationMode="server"
        paginationModel={{
          page: searchState.currentPage,
          pageSize: searchState.itemsPerPage,
        }}
        disableColumnMenu
        disableColumnSorting
        disableColumnFilter
        disableColumnSelector
        rowCount={searchState.totalCount}
        onPaginationModelChange={handlePaginationModelChange}
        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
        pageSizeOptions={[30, 50, 100]}
        rows={itemList}
        columns={columns}
        loading={searchState.isLoading}
        disableRowSelectionOnClick
        disableColumnResize
        rowHeight={150}
        sx={{
          height: '100%',
          width: '100%',
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: 'white',
          },
          '& .MuiDataGrid-cell': {
            alignItems: 'center',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            color: 'grey.700',
          },
          '& .MuiDataGrid-row': {
            backgroundColor: 'white',
            borderBottomColor: 'transparent',
          },
        }}
      />
    </Box>
  );
};
