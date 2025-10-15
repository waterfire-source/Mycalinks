import { StockDataGrid } from '@/app/auth/(dashboard)/stock/components/StockDataGrid';
import { TransferInfo } from '@/app/auth/(dashboard)/stock/specialPriceStock/component/AddSpecialPriceStockModal/AddSpecialPriceStockModal';
import { SelectedData } from '@/app/auth/(dashboard)/stock/specialPriceStock/component/AddSpecialPriceStockModal/AddSpecialPriceStockModalContent';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { useAlert } from '@/contexts/AlertContext';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';

interface Props {
  searchState: ItemSearchState;
  setSearchState: React.Dispatch<React.SetStateAction<ItemSearchState>>;
  setSelectedRows: React.Dispatch<
    React.SetStateAction<SelectedData | undefined>
  >;
  isReset: boolean;
  setTransferInfo: React.Dispatch<
    React.SetStateAction<TransferInfo | undefined>
  >;
}

export interface RowData {
  index: number; // 行のインデックス
  productId?: number; //商品を識別するためのID
  itemId?: number; //アイテムを識別するためのID
  condition?: string; // 選択された状態
  count?: number; // 入力された数量
}

export const ItemTableComponent = ({
  searchState,
  setSearchState,
  setSelectedRows,
  isReset,
  setTransferInfo,
}: Props) => {
  const [rows, setRows] = useState<RowData[]>([]);
  const { setAlertState } = useAlert();
  // アイテムリスト作成、表示データの指定
  const itemList = searchState.searchResults
    .map((element, index) => {
      if (element.products.length === 0) {
        return null;
      }
      const productState = element.products
        .filter((product) => product.condition_option_display_name)
        // 在庫がない場合は表示しない
        .filter((product) => product.stock_number > 0)
        // 特価在庫も表示しない
        .filter((product) => !product.is_special_price_product)
        //特殊状態のプロダクトも表示しない
        .filter((product) => !product.specialty_id)
        .map((product) => {
          if (!product) return null;
          return {
            condition: product.condition_option_display_name,
            id: product.id,
          };
        });
      if (productState.length === 0) {
        // 在庫がない場合は表示しない
        return null;
      }
      return {
        id: index,
        productImage: element.image_url,
        productName: element.products[0]?.displayNameWithMeta ?? '',
        productId: element.products.map((product) => product.id),
        productState: productState,
        initialCondition:
          productState.length > 0 ? productState[0]?.condition : '',
        stockQuantity: element.products_stock_number,
        productWholesalePrice: element.products.map(
          (product) => product.wholesale_price,
        ),
        itemId: element.id,
        infiniteStock: element.infinite_stock,
      };
    })
    .filter((item) => item !== null); // 検索対象の商品がなかった場合はnullになる

  //状態の変更処理
  const handleChange = (
    rowId: number,
    productId: number,
    key: keyof RowData,
    value: string,
    itemId: number,
  ) => {
    setRows((prevRows: RowData[]) => {
      const rowExists = prevRows.find((row) => row.index === rowId);

      if (rowExists) {
        // 既存の行を更新
        return prevRows.map((row) =>
          row.index === rowId
            ? { ...row, [key]: value, productId, itemId }
            : row,
        );
      } else {
        // 新しい行を追加
        return [
          ...prevRows,
          { index: rowId, productId, itemId, count: undefined, [key]: value },
        ];
      }
    });
  };

  const handleAddSelectedData = (
    rowId: number,
    rowImage: string,
    rowDisplayName: string,
    initialProduct: { id: number; condition: string },
    sellPrice?: number | null,
  ) => {
    setSelectedRows((prevSelectedRow) => {
      const rowdata = rows.find((row) => row.index === rowId);
      let newSelectedData: SelectedData;
      if (!initialProduct && !rowdata) {
        setAlertState({
          message: `状態を選択してください。`,
          severity: 'error',
        });
        return prevSelectedRow;
      }

      if (!rowdata || !rowdata.productId) {
        // `rowdata` がない場合、初期値の `productId` をセット
        newSelectedData = {
          productId: initialProduct?.id,
          condition: initialProduct?.condition,
          ImageUrl: rowImage || undefined,
          productName: rowDisplayName || undefined,
          price: sellPrice,
          count: undefined,
        };
      } else {
        // 既存の `rowdata` がある場合、それを使用
        newSelectedData = {
          productId: rowdata.productId,
          condition: rowdata.condition,
          ImageUrl: rowImage || undefined,
          productName: rowDisplayName || undefined,
          price: sellPrice,
          count: undefined,
        };
      }

      // `setTransferInfo` を更新
      setTransferInfo((prevInfo) => ({
        ...prevInfo,
        itemCount: undefined,
        sellPrice: undefined,
      }));

      return newSelectedData; // `selectedRows` は単一のオブジェクトなので、新しいデータをセット
    });
  };

  useEffect(() => {
    if (isReset) {
      setRows([]);
    }
  }, [isReset]);

  const columns: GridColDef[] = [
    {
      field: 'productImage',
      headerName: '商品',
      flex: 0.1,
      headerAlign: 'center',
      align: 'center',
      minWidth: 70,
      sortable: false,
      filterable: false,
      renderCell: (params) => <ItemImage imageUrl={params.value} />,
    },
    {
      field: 'productName',
      headerName: '商品',
      flex: 0.1,
      headerAlign: 'left',
      align: 'left',
      minWidth: 150,
      renderCell: (params) => <ItemText text={params.value} />,
    },
    {
      field: 'productState',
      headerName: '状態',
      flex: 0.1,
      headerAlign: 'left',
      align: 'left',
      minWidth: 100,
      renderCell: (params) => {
        const productStates = params.row.productState || [];
        const rowId = params.row.id;
        const itemId = params.row.itemId;
        const initialProduct =
          productStates.length > 0
            ? productStates.reduce(
                (
                  min: { id: number; condition: string },
                  curr: { id: number; condition: string },
                ) => (Number(curr.id) < Number(min.id) ? curr : min),
                productStates[0],
              )
            : null;
        const selectedCondition =
          rows.find((product: RowData) => product.index === rowId)?.condition ||
          initialProduct?.condition ||
          '';
        return (
          <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            width="100%"
            height="100%"
          >
            <FormControl size="small" sx={{ minWidth: 70 }}>
              <InputLabel sx={{ color: 'black' }}>状態</InputLabel>
              <Select
                label="状態"
                value={selectedCondition}
                onChange={(event) => {
                  // アイテムの特定
                  const item = searchState.searchResults.find(
                    (item) => item.id === params.row.itemId,
                  );

                  //プロダクトの特定
                  const selectedProductId = item?.products.find(
                    (product) =>
                      product.condition_option_display_name ===
                      event.target.value,
                  )?.id;

                  if (selectedProductId && selectedProductId !== 0) {
                    handleChange(
                      rowId,
                      selectedProductId,
                      'condition',
                      event.target.value,
                      itemId,
                    );
                  }
                }}
              >
                {productStates.map(
                  (product: { id: number; condition: string }) => (
                    <MenuItem key={product.id} value={product.condition}>
                      {product.condition}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>
          </Box>
        );
      },
    },
    {
      field: 'specialPrice',
      headerName: '販売価格',
      flex: 0.1,
      headerAlign: 'left',
      align: 'left',
      minWidth: 150,
      renderCell: (params) => {
        const productStates = params.row.productState || [];
        const itemId = params.row.itemId;
        const rowId = params.row.id;

        // 最小 id を持つ商品状態を取得
        const initialProduct =
          productStates.length > 0
            ? productStates.reduce(
                (
                  min: { id: number; condition: string },
                  curr: { id: number; condition: string },
                ) => (Number(curr.id) < Number(min.id) ? curr : min),
                productStates[0],
              )
            : null;
        const sellPrice =
          searchState.searchResults
            .find((item) => item.id === itemId)
            ?.products.find(
              (product) =>
                product.id ===
                rows.find((row) => row.index === rowId)?.productId,
            )?.sell_price ??
          searchState.searchResults
            .find((item) => item.id === itemId)
            ?.products.find((product) => product.id === initialProduct?.id)
            ?.sell_price;

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'left',
              height: '100%',
            }}
          >
            <Typography>{sellPrice?.toLocaleString() ?? '-'}円</Typography>
          </Box>
        );
      },
    },
    {
      field: 'count',
      headerName: '現在在庫',
      flex: 0.1,
      headerAlign: 'left',
      align: 'left',
      minWidth: 150,
      renderCell: (params) => {
        const productStates = params.row.productState || [];
        const itemId = params.row.itemId;
        const rowId = params.row.id;
        // 最小 id を持つ商品状態を取得
        const initialProduct =
          productStates.length > 0
            ? productStates.reduce(
                (
                  min: { id: number; condition: string },
                  curr: { id: number; condition: string },
                ) => (Number(curr.id) < Number(min.id) ? curr : min),
                productStates[0],
              )
            : null;
        const stockCount =
          searchState.searchResults
            .find((item) => item.id === itemId)
            ?.products.find(
              (product) =>
                product.id ===
                rows.find((row) => row.index === rowId)?.productId,
            )?.stock_number ??
          searchState.searchResults
            .find((item) => item.id === itemId)
            ?.products.find((product) => product.id === initialProduct?.id)
            ?.stock_number;
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'left',
              height: '100%',
            }}
          >
            <Typography>{stockCount?.toLocaleString() ?? '-'}枚</Typography>
          </Box>
        );
      },
    },
    {
      field: 'addButton',
      headerName: '',
      flex: 0.1,
      headerAlign: 'left',
      align: 'left',
      minWidth: 150,
      renderCell: (params) => {
        const rowId = params.row.id;
        const rowImage = params.row.productImage;
        const rowDisplayName = params.row.productName;
        const productStates = params.row.productState || [];
        const itemId = params.row.itemId;
        const initialProduct =
          productStates.length > 0
            ? productStates.reduce(
                (
                  min: { id: number; condition: string },
                  curr: { id: number; condition: string },
                ) => (Number(curr.id) < Number(min.id) ? curr : min),
                productStates[0],
              )
            : null;
        const sellPrice =
          searchState.searchResults
            .find((item) => item.id === itemId)
            ?.products.find(
              (product) =>
                product.id ===
                rows.find((row) => row.index === rowId)?.productId,
            )?.sell_price ??
          searchState.searchResults
            .find((item) => item.id === itemId)
            ?.products.find((product) => product.id === initialProduct?.id)
            ?.sell_price;
        return (
          <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            width="100%"
            height="100%"
          >
            <SecondaryButtonWithIcon
              onClick={() =>
                handleAddSelectedData(
                  rowId,
                  rowImage,
                  rowDisplayName,
                  initialProduct,
                  sellPrice,
                )
              }
            >
              追加
            </SecondaryButtonWithIcon>
          </Box>
        );
      },
    },
  ];

  // ページネーション
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
    setRows([]);
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
      rowCount={searchState.totalCount}
      rows={itemList}
      columns={columns}
    />
  );
};
