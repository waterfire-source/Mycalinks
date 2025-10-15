import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';
import { Box, Checkbox, Typography } from '@mui/material';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import dayjs from 'dayjs';
import { DataGrid } from '@mui/x-data-grid';
import { jaJP } from '@mui/x-data-grid/locales';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { Chip } from '@/components/chips/Chip';
import { grey } from '@mui/material/colors';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useProduct } from '@/app/auth/(dashboard)/ec/list/hooks/useProduct';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';

interface InputFieldConfig {
  columnName: string; // カラム名（例: 'customPrice', 'discount', 'margin'）
  headerName: string; // 表示名（例: '特別価格', '割引額', '利幅'）
  suffix: string; // 単位（例: '円', '%', '個'）
  minWidth?: number; // 最小幅
  defaultValue?: number; // デフォルト値
}

interface InputFieldConfig {
  columnName: string; // カラム名（例: 'customPrice', 'discount', 'margin'）
  headerName: string; // 表示名（例: '特別価格', '割引額', '利幅'）
  suffix: string; // 単位（例: '円', '%', '個'）
  minWidth?: number; // 最小幅
  defaultValue?: number; // デフォルト値
  defaultProperty?: string; // デフォルトの値のプロパティ名(product内のプロパティ)
}

export interface ColumnVisibility {
  showProductState?: boolean;
  showCheckBox?: boolean;
  showProductImage?: boolean;
  showProductName?: boolean;
  showManagementNumber?: boolean;
  showSellPrice?: boolean;
  showBuyPrice?: boolean;
  showAverageWholesalePrice?: boolean;
  showProductStock?: boolean;
  showResidencePeriod?: boolean;
  showPriceUpdate?: boolean;
  // 汎用的な入力フィールド設定
  inputFields?: InputFieldConfig[];
  showCount?: boolean;
  showAction?: boolean;
}

interface Props {
  searchState: ProductSearchState;
  setSearchState: React.Dispatch<React.SetStateAction<ProductSearchState>>;
  columnVisibility?: ColumnVisibility;
  actionButtonText?: string;
  onClickActionButton?: (
    product: BackendProductAPI[0]['response']['200']['products'][0],
    count: number,
    customFieldValues: Record<string, number>,
  ) => void;
}

export const ProductDataTable = ({
  searchState,
  setSearchState,
  columnVisibility = {
    showProductState: true,
    showCheckBox: true,
    showProductImage: true,
    showProductName: true,
    showManagementNumber: true,
    showSellPrice: true,
    showBuyPrice: true,
    showAverageWholesalePrice: true,
    showProductStock: true,
    showResidencePeriod: true,
    showPriceUpdate: true,
    inputFields: [],
    showCount: true,
    showAction: true,
  },
  actionButtonText,
  onClickActionButton,
}: Props) => {
  const { fetchProductById } = useProduct();
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const [tableData, setTableData] = useState<
    BackendProductAPI[0]['response']['200']['products']
  >([]);

  const [totalValues, setTotalValues] =
    useState<BackendProductAPI[0]['response']['200']['totalValues']>();

  // 各商品の数量を管理するstate
  const [counts, setCounts] = useState<Record<number, number>>({});
  // カスタムフィールド値を管理（フィールド名 → 商品ID → 値）
  const [customFieldValues, setCustomFieldValues] = useState<
    Record<string, Record<number, number>>
  >({});
  const [checks, setChecks] = useState<number[]>([]);

  const handleCheckboxClick = (id: number) => {
    setChecks((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    setTableData(searchState.searchResults);
    setCounts(
      searchState.searchResults.reduce(
        (acc, p) => {
          acc[p.id] = 1;
          return acc;
        },
        {} as Record<number, number>,
      ),
    );
  }, [searchState.searchResults]);

  useEffect(() => {
    setTotalValues(searchState.totalValues);
  }, [searchState.totalValues]);

  // テーブルデータ
  const allColumns: GridColDef[] = [
    {
      field: 'checkBox',
      headerName: '',
      flex: 0.075,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      disableColumnMenu: true,
      disableExport: true,
      filterable: false,
      renderHeader: () => {
        const allSelected =
          tableData.length > 0 &&
          tableData.every((row) => checks.includes(row.id));
        const someSelected =
          tableData.some((row) => checks.includes(row.id)) && !allSelected;

        return (
          <Checkbox
            indeterminate={someSelected} // 部分選択状態
            checked={allSelected} // すべて選択されているか
            onChange={(event) => {
              if (event.target.checked) {
                // すべて選択
                const allIds = tableData.map((row) => row.id);
                setChecks(allIds);
              } else {
                // すべて解除
                setChecks([]);
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
            checked={checks.includes(params.row.id)}
            onChange={(event) => {
              event.stopPropagation(); // onRowClick イベントの伝播を防止
              handleCheckboxClick(params.row.id);
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
      minWidth: 100,
      renderCell: (params) => {
        return <ItemImage imageUrl={params.row.productImage} />;
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
                管理番号：{params.row.managementNumber || '未入力'}
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
      headerAlign: 'center',
      align: 'center',
      minWidth: 80,
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Typography>{params.value}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'managementNumber',
      headerName: '管理番号',
      flex: 0.1,
      headerAlign: 'center',
      align: 'center',
      minWidth: 100,
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
              justifyContent: 'center',
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
      headerAlign: 'center',
      align: 'center',
      minWidth: 90,
      renderCell: (params) => {
        const sellPrice = params.row.sellPrice;
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
      flex: 0.1,
      headerAlign: 'center',
      align: 'center',
      minWidth: 90,
      renderCell: (params) => {
        const buyPrice = params.row.buyPrice;
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
              {buyPrice.toLocaleString()}円
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'averageWholesalePrice',
      headerName: '平均仕入価格',
      flex: 0.1,
      headerAlign: 'center',
      align: 'center',
      minWidth: 100,
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
      headerAlign: 'center',
      align: 'center',
      minWidth: 80,
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
      headerAlign: 'center',
      align: 'center',
      minWidth: 80,
      renderCell: (params) => {
        const residencePeriod = params.row.residencePeriod;
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
      headerName: '価格更新日',
      flex: 0.1,
      headerAlign: 'center',
      align: 'center',
      minWidth: 120,
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
            placeholder="数量"
            min={1}
            onClick={(e) => e.stopPropagation()}
            value={counts[params.row.id] ?? ''}
            onChange={(e) => {
              const newValue = params.row.itemInfiniteStock
                ? e
                : e > params.row.stockQuantity
                ? params.row.stockQuantity
                : e;

              setCounts((prev) => ({
                ...prev,
                [params.row.id]: newValue,
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
            onClick={async () => {
              const product = await fetchProductById(params.row.id, store.id);
              if (!product)
                return setAlertState({
                  message: '在庫データが見つかりませんでした',
                  severity: 'error',
                });

              // カスタムフィールド値を集約
              const fieldValues: Record<string, number> = {};
              (columnVisibility.inputFields || []).forEach((field) => {
                fieldValues[field.columnName] =
                  customFieldValues[field.columnName]?.[params.row.id] ??
                  (field.defaultProperty
                    ? (product as Record<string, unknown>)?.[
                        field.defaultProperty
                      ]
                    : field.defaultValue) ??
                  0;
              });

              onClickActionButton?.(
                product,
                counts[params.row.id] || 0,
                fieldValues,
              );
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
        const product = tableData.find((p) => p.id === params.row.id);
        if (!product) return null;

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
                  ? (product as Record<string, unknown>)?.[
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
      checkBox: 'showCheckBox',
      productImage: 'showProductImage',
      productName: 'showProductName',
      productState: 'showProductState',
      managementNumber: 'showManagementNumber',
      sellPrice: 'showSellPrice',
      buyPrice: 'showBuyPrice',
      averageWholesalePrice: 'showAverageWholesalePrice',
      productStock: 'showProductStock',
      residencePeriod: 'showResidencePeriod',
      priceUpdate: 'showPriceUpdate',
      count: 'showCount',
      action: 'showAction',
    };

    // 基本カラムをフィルタリング
    const basicColumns = allColumns.filter((column) => {
      const visibilityKey = columnKeyMap[column.field];
      if (visibilityKey === 'showAction' || visibilityKey === 'showCount') {
        if (!onClickActionButton) {
          return false; // アクションボタンがない場合は表示しない
        }
      }
      return visibilityKey ? columnVisibility[visibilityKey] !== false : true;
    });

    // カスタム入力フィールドを追加
    const customInputColumns = (columnVisibility.inputFields || []).map(
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
  }, [
    allColumns,
    columnVisibility,
    onClickActionButton,
    customFieldValues,
    tableData,
  ]);

  // テーブル表示用のデータ（グループ化なし）
  const itemList = useMemo(() => {
    const generateDisplayName = (
      specialtyName: string | null,
      name: string,
      expansion: string | null,
      cardnumber: string | null,
      rarity: string | null,
    ) => {
      if (!expansion && !cardnumber && !rarity) {
        if (!specialtyName) {
          return name; // 名前
        } else {
          return `《${specialtyName}》 ${name}`; // 《特殊状態》名前
        }
      } else {
        if (!specialtyName) {
          return `${name} (${expansion ? expansion : ''} ${
            cardnumber ? cardnumber : ''
          } ${rarity ? rarity : ''})`; // 名前(拡張、カード番号、レアリティ)
        } else {
          return `${
            specialtyName ? '《' + specialtyName + '》' : ''
          } ${name} (${expansion ? expansion : ''} ${
            cardnumber ? cardnumber : ''
          } ${rarity ? rarity : ''})`; // 《特殊状態》名前(拡張、カード番号、レアリティ)
        }
      }
    };

    return tableData.map((element) => {
      const displayName = generateDisplayName(
        element.specialty__display_name,
        element.display_name,
        element.item_expansion,
        element.item_cardnumber,
        element.item_rarity,
      );

      return {
        id: element.id,
        productImage: element.image_url,
        productName: displayName,
        genreDisplayName: element.item_genre_display_name,
        categoryDisplayName: element.item_category_display_name,
        productState: element.is_special_price_product
          ? '特価'
          : element.condition_option_display_name,
        managementNumber: element.management_number,
        consignmentClientName: element.consignment_client__full_name,
        sellPrice: element.specific_sell_price ?? element.sell_price ?? 0,
        buyPrice: element.specific_buy_price ?? element.buy_price ?? 0,
        averageWholesalePrice: element.average_wholesale_price ?? '',
        productStock: element.stock_number ?? 0,
        residencePeriod: calculateStagnationPeriod(element.updated_at),
        priceUpdate: element.updated_at
          ? dayjs(element.updated_at).format('YYYY/MM/DD')
          : '',
        stockQuantity: element.stock_number,
        itemInfiniteStock: element.item_infinite_stock,
      };
    });
  }, [tableData]);

  //滞留期間を求める処理
  function calculateStagnationPeriod(lastSellingDate: string | Date): number {
    const lastDate = new Date(lastSellingDate);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

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
      resetPage: false,
    }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setSearchState((prev) => ({
      ...prev,
      itemsPerPage: newSize,
      currentPage: 0,
      resetPage: true,
    }));
  };

  return (
    <Box
      sx={{
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
        rowCount={totalValues?.itemCount}
        onPaginationModelChange={handlePaginationModelChange}
        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
        pageSizeOptions={[30, 50, 100]}
        rows={itemList}
        columns={columns}
        loading={searchState.isLoading}
        disableRowSelectionOnClick
        disableColumnResize
        rowHeight={90}
        sx={{
          height: '100%',
          width: '100%',
          padding: 0,
          margin: 0,
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
