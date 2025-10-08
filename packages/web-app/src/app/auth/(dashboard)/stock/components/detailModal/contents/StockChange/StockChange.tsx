import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { StockDataGrid } from '@/app/auth/(dashboard)/stock/components/StockDataGrid';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useEffect, useState, useMemo } from 'react';
import { Product_Wholesale_Price_History } from '@prisma/client';
import SearchIcon from '@mui/icons-material/Search';
import { CategoryAPIRes } from '@/api/frontend/category/api';
import { GenreAPIRes } from '@/api/frontend/genre/api';
import { StockTransferProductDetail } from '@/app/auth/(dashboard)/stock/components/detailModal/contents/StockChange/ProductDetail';
import { transferProduct } from '@/app/auth/(dashboard)/stock/components/detailModal/StockDetailModal';
import { toHalfWidthOnly } from '@/utils/convertToHalfWidth';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { isOriginalProductCategory } from '@/feature/item/utils';
import { useAlert } from '@/contexts/AlertContext';
import {
  Specialties,
  useGetSpecialty,
} from '@/feature/specialty/hooks/useGetSpecialty';
import { SpecialtySelect } from '@/feature/specialty/components/SpecialtySelect';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { useCreateSpecialtyProduct } from '@/feature/specialty/hooks/useCreateSpecialtyProduct';
import { CommonCheckbox } from '@/feature/purchaseReception/components/modals/modalComponents/common/CommonCheckbox';

interface Props {
  storeId: number;
  detailData: BackendProductAPI[0]['response']['200']['products'][0][];
  searchItemState: ItemSearchState;
  setSearchItemState: React.Dispatch<React.SetStateAction<ItemSearchState>>;
  transferItems: transferProduct[];
  setTransferItems: React.Dispatch<React.SetStateAction<transferProduct[]>>;
  performSearch: (isPageSkip?: boolean) => Promise<void>;
  category: CategoryAPIRes['getCategoryAll'];
  genre: GenreAPIRes['getGenreAll'];
  isReset: boolean;
  setIsReset: React.Dispatch<React.SetStateAction<boolean>>;
  onManagementNumberChange?: (managementNumber: string) => void;
}

// データの型定義
export interface RowData {
  id?: number; // 各行を識別するためのID
  itemId?: number;
  productId?: number; //商品を識別するためのID
  condition?: string; // 選択された状態
  conditionId?: number; //状態の識別のためのID
  count?: string; // 入力された数量
  productWholesalePrice?: number; //仕入れ値の保持
  selectedStockQuantity?: number; // 選択された状態の在庫数を追加
  selectedInfiniteStock?: boolean; // 選択された状態の無限在庫フラグを追加
}

export interface SelectedData {
  productId?: number; //商品を識別するためのID
  itemId?: number; //アイテムを識別するためのID
  specialCondition?: string; //選択された特殊状態
  condition?: string; // 選択された状態
  ImageUrl: string; //商品イメージ
  productName: string; //商品名
  count?: string; // 入力された数量
  productWholesalePrice?: number; //仕入れ値の保持
  index?: number; // 行のインデックス
  stockNumber: number;
  infiniteStock: boolean;
  managementNumber?: string; // 管理番号
  conditionOptionId?: number; // 状態ID
}

export interface wholesalePrice {
  originalWholesalePrices: Array<Product_Wholesale_Price_History>;
  totalWholesalePrice: number;
  totalItemCount: number;
  noWholesalePriceCount: number;
  rowId?: number;
  productId?: number;
  infiniteStock: boolean;
}

interface ProductState {
  id: number;
  condition: string;
  conditionId: number;
  isSpecialState: boolean;
  specialtyId: number;
  isSpecialPrice: boolean;
  isConsignmentProduct: boolean;
  managementNumber: string;
  stockNumber: number;
  infiniteStock: boolean;
}

export const StockTransfer = ({
  storeId,
  detailData,
  searchItemState,
  setSearchItemState,
  transferItems,
  setTransferItems,
  performSearch,
  category,
  genre,
  isReset,
  setIsReset,
}: Props) => {
  const { setAlertState } = useAlert();
  const { createSpecialtyProduct, isLoading: isCreateSpecialStateLoading } =
    useCreateSpecialtyProduct();
  // TODO コメントアウトしてあるコードは仕入れ値に関係があるもの、削除していいとなったら削除する」
  // const { wholesalePrice, fetchWholesalePrice } = useWholesalePrice();

  // const [wholesalePriceForStock, setWholesalePriceForStock] = useState<
  //   wholesalePrice[]
  // >([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [transferDirection, setTransferDirection] = useState<'in' | 'out'>(
    'in',
  );
  // const [searchItem, setSearchItem] = useState<{
  //   rowId?: number;
  //   productId: number;
  //   productStock: number;
  // } | null>(null);

  // アイテムリスト作成、表示データの指定
  const itemList = useMemo(() => {
    return searchItemState.searchResults
      .map((element, index) => {
        const productState = element.products
          .map((product) => {
            if (product.management_number) return null;
            if (product.condition_option_display_name) {
              // 特価在庫と特殊状態の表示名を生成
              return {
                id: product.id,
                condition: product.condition_option_display_name,
                conditionId: product.condition_option_id,
                isSpecialState: !!product.specialty_id,
                specialtyId: product.specialty_id,
                isConsignmentProduct: !!product.consignment_client_id,
                isSpecialPrice: product.is_special_price_product,
                managementNumber: product.management_number,
                stockNumber: product.stock_number, // 各状態の在庫数を追加
                infiniteStock: product.item_infinite_stock, // 各状態の無限在庫フラグを追加
              };
            }
            if (element.category_handle === 'STORAGE') {
              return {
                condition: 'ストレージ',
                id: product.id,
                isSpecialState: !!product.specialty_id,
                stockNumber: product.stock_number,
                infiniteStock: product.item_infinite_stock,
              };
            }
            return null;
          })
          .filter((product): product is ProductState => product !== null);

        //バンドル・福袋・オリパはリストに入れない
        if (isOriginalProductCategory(element.category_handle)) {
          return null;
        }

        // productStateが空の場合はnullを返す
        if (productState.length === 0) return null;

        return {
          id: index,
          productImage: element.image_url,
          productName: element.products[0]?.displayNameWithMeta ?? '',
          productId: element.products.map((product) => product.id),
          productState: productState,
          stockQuantity: element.products_stock_number,
          // productWholesalePrice: element.products.map(
          //   (product) => product.wholesale_price,
          // ),
          itemId: element.id,
          categoryHandle: element.category_handle,
          infiniteStock: element.infinite_stock,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null); // nullの項目を除外
  }, [searchItemState.searchResults]);

  // itemListが更新されたときに、各アイテムの最初の状態をデフォルトで選択
  useEffect(() => {
    if (itemList.length > 0) {
      const defaultRows: RowData[] = itemList.map((item) => {
        const firstProduct = item.productState[0];
        const targetProduct = item.productState.find((state) =>
          selectedSpecialty
            ? state.specialtyId === selectedSpecialty.id &&
              state.condition === firstProduct.condition
            : true,
        );

        return {
          id: item.id,
          productId: targetProduct?.id,
          itemId: item.itemId,
          condition: firstProduct.condition,
          conditionId: firstProduct.conditionId,
          selectedStockQuantity: targetProduct?.stockNumber || 0,
          selectedInfiniteStock: targetProduct?.infiniteStock || false,
          count: '',
        };
      });

      setRows(defaultRows);
    }
  }, [searchItemState.searchResults]);

  const [rows, setRows] = useState<RowData[]>([]);
  const [selectedRows, setSelectedRows] = useState<SelectedData[]>([]);

  //状態の変更処理
  const handleStateChange = (
    rowId: number,
    selectedProduct:
      | BackendItemAPI[0]['response']['200']['items'][0]['products'][0]
      | null,
    key: keyof RowData,
    value: string,
    conditionId: number,
  ) => {
    setRows((prevRows: RowData[]) => {
      const rowExists = prevRows.find((row) => row.id === rowId);

      const productId = selectedProduct?.id;
      const selectedStockQuantity = selectedProduct?.stock_number || 0;
      const selectedInfiniteStock =
        selectedProduct?.item_infinite_stock || false;

      if (rowExists) {
        // 既存の行を更新
        return prevRows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                [key]: value,
                productId,
                count: '',
                selectedStockQuantity,
                selectedInfiniteStock,
                conditionId,
              }
            : row,
        );
      } else {
        // 新しい行を追加
        return [
          ...prevRows,
          {
            id: rowId,
            productId,
            count: '',
            [key]: value,
            selectedStockQuantity,
            selectedInfiniteStock,
            conditionId,
          },
        ];
      }
    });
    // setSearchItem({ rowId, productId, productStock });
  };

  useEffect(() => {
    setTotalCount(
      transferItems.reduce((total, item) => total + (item.itemCount || 0), 0),
    );
  }, [transferItems]);

  // 数量（quantity）変更
  const handleTextChange = (
    rowId: number, // `RowData` のプロパティ名のみを受け取る
    key: keyof RowData,
    value: string,
  ) => {
    setRows((prevRows: RowData[]) => {
      const rowExists = prevRows.find((row) => row.id === rowId);

      if (rowExists) {
        // 既存の行を更新
        return prevRows.map((row) =>
          row.id === rowId ? { ...row, [key]: value } : row,
        );
      } else {
        // 新しい行を追加
        return [
          ...prevRows,
          {
            id: rowId,
            [key]: value,
          },
        ];
      }
    });
  };

  // 仕入れ値の取得
  // 仕様確定次第
  // useEffect(() => {
  //   const getWholesalePrice = async () => {
  //     try {
  //       if (searchItem && storeId) {
  //         const { productId, productStock } = searchItem;
  //         if (productId && (productStock || productStock == 0)) {
  //           await fetchWholesalePrice(storeId, productId, productStock);
  //         }
  //       }
  //     } catch (error) {
  //       console.error('仕入れ値の取得に失敗しました:', error);
  //     }
  //   };

  //   if (searchItem) {
  //     getWholesalePrice();
  //   }
  // }, [searchItem?.productId, searchItem, storeId, fetchWholesalePrice]);
  // 仕入れ値の管理
  // 仕様確定次第
  // useEffect(() => {
  //   const rowId = searchItem?.rowId;
  //   const productId = searchItem?.productId;
  //   if (wholesalePrice) {
  //     setWholesalePriceForStock((prevRows: wholesalePrice[]) => {
  //       const rowExists = prevRows.some((row) => row.rowId === rowId);

  //       if (rowExists) {
  //         return prevRows.map((row) =>
  //           row.rowId === rowId
  //             ? { ...row, ...wholesalePrice, rowId, productId }
  //             : row,
  //         );
  //       } else {
  //         return [...prevRows, { ...wholesalePrice, rowId, productId }];
  //       }
  //     });
  //     setRows((prevRows: RowData[]) => {
  //       const rowExists = prevRows.some((row) => row.id === rowId); // `some()` で存在確認

  //       if (rowExists) {
  //         // 既存の行を更新
  //         return prevRows.map((row) =>
  //           row.id === rowId
  //             ? {
  //                 ...row,
  //                 productWholesalePrice:
  //                   wholesalePrice?.originalWholesalePrices?.[0]?.unit_price ??
  //                   undefined, // `?.` で安全に取得
  //               }
  //             : row,
  //         );
  //       }

  //       // **`rowExists === false` の場合、変更せず `prevRows` を返す**
  //       return prevRows;
  //     });
  //   }
  // }, [searchItem, wholesalePrice]);

  // 仕入れ値の変更
  // 仕様確定次第
  // const handleWholesalePriceChange = (
  //   rowId: number, // `RowData` のプロパティ名のみを受け取る
  //   key: keyof RowData,
  //   value: number,
  // ) => {
  //   setRows((prevRows: RowData[]) => {
  //     const rowExists = prevRows.filter((row) => row.id === rowId);
  //     if (rowExists) {
  //       // 既存の行を更新
  //       return prevRows.map((row) =>
  //         row.id === rowId ? { ...row, [key]: value } : row,
  //       );
  //     } else {
  //       // 新しい行を追加
  //       return [
  //         ...prevRows,
  //         {
  //           id: rowId,
  //           productId: undefined,
  //           condition: undefined,
  //           [key]: value,
  //         },
  //       ];
  //     }
  //   });
  // };

  // 特殊状態
  const { specialties, fetchSpecialty } = useGetSpecialty();

  useEffect(() => {
    fetchSpecialty();
  }, [fetchSpecialty]);
  // 選択された特殊状態
  const [selectedSpecialty, setSelectedSpecialty] = useState<
    Specialties[number] | null
  >(null);

  //特殊状態が変更された場合対応するproductを検索しrowsを更新
  useEffect(() => {
    setRows((prevRows) => {
      return prevRows.map((row) => {
        const targetItem = searchItemState.searchResults.find(
          (i) => i.id === row.itemId,
        );
        if (!targetItem) return row;

        const targetConditionId = targetItem.products.find((condition) => {
          return condition.condition_option_display_name === row.condition;
        })?.condition_option_id;

        const targetProduct =
          targetItem.products.find((product) => {
            if (row.condition === 'ストレージ') {
              return true; // ストレージの場合は最初のproductを使用
            }
            // 特殊状態が選択されている場合
            if (selectedSpecialty) {
              return (
                selectedSpecialty.id === product.specialty_id &&
                product.condition_option_display_name === row.condition
              );
            }
            // 通常の状態選択
            return product.condition_option_display_name === row.condition;
          }) ?? null;

        const productId = targetProduct?.id;
        const selectedStockQuantity = targetProduct?.stock_number || 0;
        const selectedInfiniteStock =
          targetProduct?.item_infinite_stock || false;

        return {
          ...row,
          productId,
          stock: '',
          selectedInfiniteStock,
          selectedStockQuantity,
          conditionId: targetConditionId ?? undefined,
        };
      });
    });
  }, [selectedSpecialty]);

  //商品リストに追加
  const handleAddToList = async (
    rowId: number, // これを index として使う
  ) => {
    // `rowId` に一致する行を取得
    const matchingRow = rows.find((row) => row.id === rowId);
    if (!matchingRow)
      return setAlertState({
        message: '対象の行が見つかりませんでした',
        severity: 'error',
      });

    const matchingItem = searchItemState.searchResults.find((i) => {
      return i.id === matchingRow?.itemId;
    });

    if (!matchingItem)
      return setAlertState({
        message: '対象の商品が見つかりませんでした',
        severity: 'error',
      });

    let selectedProductId = matchingRow?.productId;
    if (!selectedProductId) {
      if (
        matchingRow.condition &&
        matchingRow.itemId &&
        matchingRow.conditionId
      ) {
        const res = await createSpecialtyProduct({
          storeId,
          itemId: matchingRow.itemId,
          requestBody: {
            condition_option_id: matchingRow.conditionId,
            specialty_id: selectedSpecialty?.id,
            management_number: undefined,
            allowDuplicate: false,
          },
        });

        selectedProductId = res.id;
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === rowId ? { ...row, productId: selectedProductId } : row,
          ),
        );
      } else {
        return setAlertState({
          message: '特殊状態の生成に失敗しました。',
          severity: 'error',
        });
      }
    }

    setSelectedRows((prev) => {
      // `selectedProductId` が `selectedRows` 内に存在するかチェック
      const exists = prev.some((row) => row.productId === selectedProductId);

      if (exists) {
        // 既に存在する場合は更新
        return prev.map((row) =>
          row.productId === selectedProductId
            ? {
                ...row,
                count: matchingRow.count,
                ImageUrl: matchingItem.image_url || '',
                stockNumber: matchingRow.selectedStockQuantity || 0,
                infiniteStock: matchingRow.selectedInfiniteStock || false,
                conditionOptionId: matchingRow.conditionId,
              }
            : row,
        );
      } else {
        return [
          ...prev,
          {
            index: prev.length,
            productId: selectedProductId,
            itemId: matchingItem.id,
            condition: matchingRow.condition,
            specialCondition: selectedSpecialty?.display_name || '',
            ImageUrl: matchingItem.image_url || '',
            productName: matchingItem.displayNameWithMeta || '',
            count: matchingRow.count || '',
            stockNumber: matchingRow.selectedStockQuantity || 0,
            infiniteStock: matchingRow.selectedInfiniteStock || false,
            conditionOptionId: matchingRow.conditionId,
          },
        ];
      }
    });
    //最終的な在庫変換で使用する値
    setTransferItems((prev) => {
      const exists = prev.some((row) => row.productId === selectedProductId);

      if (exists) {
        // 既に存在する場合は更新
        return prev.map((row) =>
          row.productId === selectedProductId
            ? {
                ...row,
                itemCount: Number(matchingRow.count) || 0, // string → number に変換
                specificWholesalePrice:
                  matchingRow.productWholesalePrice ?? undefined, // undefined 対策
                stockNumber: matchingRow.selectedStockQuantity || 0,
                infiniteStock: matchingRow.selectedInfiniteStock || false,
                itemId: matchingRow.itemId,
                conditionOptionId: matchingRow.conditionId,
              }
            : row,
        );
      } else {
        // 存在しない場合は追加
        return [
          ...prev,
          {
            productId: selectedProductId ?? 0, // undefined 対策
            itemCount: Number(matchingRow.count) || 0, // string → number に変換
            specificWholesalePrice:
              matchingRow.productWholesalePrice ?? undefined, // undefined 対策
            stockNumber: matchingRow.selectedStockQuantity || 0,
            infiniteStock: matchingRow.selectedInfiniteStock || false,
            itemId: matchingRow.itemId,
            conditionOptionId: matchingRow.conditionId,
          },
        ];
      }
    });
  };

  //detailDataは大元はsearchStateで、中身にspecialty__display_nameがない
  const productState = detailData[0]?.is_special_price_product
    ? '特価'
    : detailData[0]?.condition_option_display_name || null;

  const filteredTags = (detailData[0] as any)?.tags
    ? (detailData[0] as any).tags
        .filter((tag: any) => tag.genre1 === null)
        .map((tag: any) => tag.tag_name)
    : null;

  // テーブルデータ
  const columns: GridColDef[] = [
    {
      field: 'productImage',
      headerName: '商品',
      flex: 0.1,
      headerAlign: 'center',
      align: 'center',
      minWidth: 70,
      sortable: false, // ソートを無効化
      filterable: false, // フィルタリングを無効化
      renderCell: (params) => {
        const imageUrl = params.value;
        return (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
            height="100%"
          >
            <ItemImage imageUrl={imageUrl} height={65} />
          </Box>
        );
      },
    },
    {
      field: 'productName',
      headerName: '商品名',
      flex: 0.1,
      headerAlign: 'left',
      align: 'left',
      minWidth: 150,
      renderCell: (params) => (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
          height="100%"
        >
          <ItemText text={params.value} />
        </Box>
      ),
    },
    {
      field: 'productState',
      headerName: '状態',
      flex: 0.1,
      headerAlign: 'left',
      align: 'left',
      minWidth: 140,
      renderCell: (params) => {
        const rowId = params.row.id;
        // const productStock = params.row.stockQuantity;

        return (
          <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            width="100%"
            height="100%"
          >
            <FormControl size="small">
              <InputLabel sx={{ color: 'black' }}>状態を選択</InputLabel>
              <Select
                label="状態"
                value={
                  rows.find((row) => row.id === params.row.id)?.condition || ''
                }
                sx={{ minWidth: 120 }}
                onChange={(event) => {
                  const selectedCondition = event.target.value;

                  // アイテムの特定
                  const item = searchItemState.searchResults.find(
                    (item) => item.id === params.row.itemId,
                  );

                  const conditionId = params.row.productState.find(
                    (p: ProductState) => p.condition === selectedCondition,
                  ).conditionId;

                  // 選択された状態の商品を特定
                  const selectedProduct = item?.products.find((product) => {
                    if (selectedCondition === 'ストレージ') {
                      return true; // ストレージの場合は最初のproductを使用
                    }
                    // 特殊状態が選択されている場合
                    if (selectedSpecialty) {
                      return (
                        selectedSpecialty.id === product.specialty_id &&
                        product.condition_option_display_name ===
                          selectedCondition
                      );
                    }
                    // 通常の状態選択
                    return (
                      product.condition_option_display_name ===
                      selectedCondition
                    );
                  });

                  handleStateChange(
                    rowId,
                    selectedProduct || null,
                    'condition',
                    selectedCondition,
                    conditionId,
                  );
                }}
              >
                {params.row.productState
                  .filter(
                    (p: ProductState) =>
                      !p.isSpecialState &&
                      !p.isSpecialPrice &&
                      !p.isConsignmentProduct &&
                      p.managementNumber === null,
                  )
                  .map((productState: ProductState) => {
                    return (
                      <MenuItem
                        key={productState.id}
                        value={productState.condition}
                      >
                        {productState.condition}
                      </MenuItem>
                    );
                  }) || []}
              </Select>
            </FormControl>
          </Box>
        );
      },
    },
    {
      field: 'stockQuantity',
      headerName: '在庫数',
      flex: 0.05,
      headerAlign: 'left',
      align: 'center',
      minWidth: 35,
      renderCell: (params) => {
        const rowId = params.row.id;
        const row = rows.find((r) => r.id === rowId);

        // 状態が選択されている場合はその状態の在庫数を表示
        if (row?.condition && row?.selectedStockQuantity !== undefined) {
          return (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              width="100%"
              height="100%"
            >
              <Typography>
                {row.selectedInfiniteStock ? '∞' : row.selectedStockQuantity}
              </Typography>
            </Box>
          );
        }

        // 状態が選択されていない場合は全体の在庫数を表示
        const stockNumber = params.row.stockQuantity;
        const infiniteStock = params.row.infiniteStock;
        return (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
            height="100%"
          >
            <Typography>{infiniteStock ? '∞' : stockNumber}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'productStock',
      headerName: '点数',
      flex: 0.1,
      headerAlign: 'left',
      align: 'center',
      minWidth: 70,
      renderCell: (params) => {
        const rowId = params.row.id;
        return (
          <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            width="100%"
            height="100%"
          >
            <TextField
              placeholder="入力"
              size="small"
              type="text" // "number"ではなく"text"を使用して制御しやすくする
              value={
                rows.find((product: RowData) => product.id === rowId)?.count ??
                ''
              }
              onChange={(event) => {
                let value = event.target.value;

                // 全角数字を半角に変換
                value = value.replace(/[０-９]/g, (s) =>
                  String.fromCharCode(s.charCodeAt(0) - 0xfee0),
                );

                // 半角数字以外を削除（完全にブロック）
                value = value.replace(/[^0-9]/g, '');

                // 在庫数チェック
                const row = rows.find(
                  (product: RowData) => product.id === rowId,
                );
                let currentStockQuantity = row?.selectedStockQuantity;
                let isInfiniteStock = row?.selectedInfiniteStock;

                // 状態が選択されていない場合は全体の在庫数を使用
                if (currentStockQuantity === undefined) {
                  currentStockQuantity = params.row.stockQuantity;
                  isInfiniteStock = params.row.infiniteStock;
                }

                // 無限在庫でない場合のみ在庫数チェック
                if (!isInfiniteStock && currentStockQuantity !== undefined) {
                  const inputValue = parseInt(value) || 0;
                  if (
                    (transferDirection === 'out' &&
                      inputValue > currentStockQuantity) ||
                    (transferDirection === 'in' &&
                      inputValue > detailData[0].stock_number)
                  ) {
                    // 在庫数を超える場合は入力を制限
                    setAlertState({
                      message: '変換元の在庫数が足りません',
                      severity: 'error',
                    });
                    return;
                  }
                }

                // 更新処理を実行
                handleTextChange(rowId, 'count', value);
              }}
              inputProps={{
                inputMode: 'numeric', // スマホで数値キーボードを表示
                pattern: '[0-9]*', // 半角数字のみ許可
              }}
              sx={{ width: '100%' }} // レイアウト調整
            />
          </Box>
        );
      },
    },
    // {
    //   field: 'productWholesalePrice',
    //   headerName: '変更前仕入れ値',
    //   flex: 0.15,
    //   headerAlign: 'left',
    //   align: 'center',
    //   minWidth: 130,
    //   renderCell: (params) => {
    //     //仕入れ値の仕様が決まり次第決定
    //     // const rowId = params.row.id;
    //     return (
    //       <Box
    //         display="flex"
    //         justifyContent="left"
    //         alignItems="center"
    //         width="100%"
    //         height="100%"
    //       >
    //         {/* <FormControl size="small" sx={{ minWidth: 150 }}>
    //           <InputLabel sx={{ color: 'black' }}>変更前仕入れ値</InputLabel>
    //           <Select
    //             label="変更前仕入れ値"
    //             value={
    //               rows.find((product: RowData) => product.id === rowId)
    //                 ?.productWholesalePrice || ''
    //             }
    //             onChange={(event) => {
    //               if (wholesalePriceForStock && event.target.value !== '') {
    //                 handleWholesalePriceChange(
    //                   rowId,
    //                   'productWholesalePrice',
    //                   Number(event.target.value),
    //                 );
    //               }
    //             }} // 選択変更時の処理
    //           >
    //             {wholesalePriceForStock &&
    //             wholesalePriceForStock.length > 0 &&
    //             wholesalePriceForStock.find(
    //               (wholesaleOption) => wholesaleOption.rowId === rowId,
    //             )?.originalWholesalePrices.length === 0 ? (
    //               <MenuItem value={''}>仕入れ値なし</MenuItem>
    //             ) : null}

    //             {wholesalePriceForStock && wholesalePriceForStock.length > 0
    //               ? wholesalePriceForStock
    //                   .find(
    //                     (wholesaleOption) => wholesaleOption.rowId === rowId,
    //                   )
    //                   ?.originalWholesalePrices.map((priceOption) => (
    //                     <MenuItem
    //                       key={priceOption.id}
    //                       value={priceOption.unit_price}
    //                     >
    //                       {priceOption.unit_price}円
    //                     </MenuItem>
    //                   ))
    //               : null}
    //           </Select>
    //         </FormControl> */}
    //         <Typography>自動設定</Typography>
    //       </Box>
    //     );
    //   },
    // },
    {
      field: 'operate',
      headerName: '操作',
      flex: 0.1,
      headerAlign: 'left',
      align: 'center',
      minWidth: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const rowId = params.row.id;
        return (
          <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            width="100%"
            height="100%"
          >
            <PrimaryButtonWithIcon
              onClick={() => handleAddToList(rowId)}
              disabled={
                rows.find((product: RowData) => product.id === rowId)?.count ===
                  '0' ||
                rows.find((product: RowData) => product.id === rowId)
                  ?.condition === undefined
              }
              loading={isCreateSpecialStateLoading}
            >
              追加
            </PrimaryButtonWithIcon>
          </Box>
        );
      },
    },
  ];

  // ページネーション
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    if (searchItemState.currentPage !== model.page) {
      handlePageChange(model.page);
    } else {
      handlePageSizeChange(model.pageSize);
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchItemState((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setSearchItemState((prev) => ({
      ...prev,
      itemsPerPage: newSize,
    }));
  };
  // カテゴリ検索
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSearchItemState((prev) => ({
      ...prev,
      selectedCategoryId:
        event.target.value === 'all' ? undefined : Number(event.target.value),
    }));
  };
  // ジャンル検索
  const handleGenreChange = (event: SelectChangeEvent<string>) => {
    setSearchItemState((prev) => ({
      ...prev,
      selectedGenreId:
        event.target.value === 'all' ? undefined : Number(event.target.value),
    }));
  };
  //特殊状態検索
  const handleSpecialtyChange = (event: SelectChangeEvent<string>) => {
    setSelectedSpecialty(
      specialties.find(
        (specialty) => specialty.id === Number(event.target.value),
      ) ?? null,
    );
  };
  const handleIsActiveChange = () => {
    setSearchItemState((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  useEffect(() => {
    performSearch();
    // setRows([]); // デフォルト選択を維持するため削除
  }, [searchItemState.selectedCategoryId, searchItemState.selectedGenreId]);

  // 初回レンダリング時はジャンルを選択する
  useEffect(() => {
    if (genre) {
      setSearchItemState((prev) => ({
        ...prev,
        selectedGenreId: genre.itemGenres[0].id,
      }));
    }
  }, [genre]);

  useEffect(() => {
    if (isReset) {
      setRows([]);
      setIsReset(false);
    }
  }, [isReset, setIsReset, setRows]);

  const handleSearchClick = () => {
    performSearch();
    // setRows([]); // デフォルト選択を維持するため削除
  };

  return (
    <Grid container columnSpacing={5} sx={{ height: '100%' }}>
      <Grid item xs={8} height="100%">
        <Stack sx={{ overflowY: 'scroll', height: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
              mt: 2,
            }}
          >
            <TextField
              placeholder="商品名"
              size="small"
              onChange={(e) =>
                setSearchItemState((prev) => ({
                  ...prev,
                  searchName: e.target.value,
                }))
              }
              value={searchItemState.searchName}
              sx={{ backgroundColor: 'white' }}
            />
            <TextField
              placeholder="エキスパンション"
              size="small"
              onChange={(e) =>
                setSearchItemState((prev) => ({
                  ...prev,
                  expansion: e.target.value,
                }))
              }
              value={searchItemState.expansion}
              sx={{ backgroundColor: 'white' }}
            />
            <TextField
              placeholder="型番"
              size="small"
              onChange={(e) =>
                setSearchItemState((prev) => ({
                  ...prev,
                  cardnumber: toHalfWidthOnly(e.target.value),
                }))
              }
              value={searchItemState.cardnumber}
              sx={{ backgroundColor: 'white' }}
            />
            <PrimaryButtonWithIcon
              onClick={handleSearchClick}
              icon={<SearchIcon />}
              iconSize={20}
            >
              検索
            </PrimaryButtonWithIcon>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
              mt: 2,
              mb: 1,
            }}
          >
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: 'black' }}>ジャンル</InputLabel>
              <Select
                value={
                  searchItemState.selectedGenreId !== undefined &&
                  searchItemState.selectedGenreId !== null
                    ? String(searchItemState.selectedGenreId)
                    : 'all'
                }
                onChange={handleGenreChange}
                sx={{ backgroundColor: 'white' }}
                label="ジャンル"
              >
                <MenuItem value="all">すべて</MenuItem>
                {genre?.itemGenres.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.display_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: 'black' }}>商品カテゴリ</InputLabel>
              <Select
                value={
                  searchItemState.selectedCategoryId !== undefined &&
                  searchItemState.selectedCategoryId !== null
                    ? String(searchItemState.selectedCategoryId)
                    : 'all'
                }
                sx={{ backgroundColor: 'white' }}
                onChange={handleCategoryChange}
                label="商品カテゴリ"
              >
                <MenuItem value="all">すべて</MenuItem>
                {category?.itemCategories.map((c) => {
                  if (isOriginalProductCategory(c.handle)) return null;
                  return (
                    <MenuItem key={c.id} value={c.id}>
                      {c.display_name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <SpecialtySelect
              selectedSpecialtyId={selectedSpecialty?.id}
              onSelect={handleSpecialtyChange}
              specialties={specialties}
              sx={{
                minWidth: 150,
                backgroundColor: 'white',
                width: 'fit-content',
              }}
            />
            <Box>
              <CommonCheckbox
                label="在庫ありのみを表示"
                checked={searchItemState.isActive || false}
                onChange={handleIsActiveChange}
              />
            </Box>
          </Box>
          <Box
            sx={{
              borderTop: '8px solid #b82a2a',
              overflow: 'auto',
              width: '100%',
              flex: 1,
              overflowY: 'scroll',
            }}
          >
            <StockDataGrid
              searchState={searchItemState}
              onPaginationModelChange={handlePaginationModelChange}
              rowCount={searchItemState.totalCount}
              rows={itemList}
              columns={columns}
            />
          </Box>
        </Stack>
      </Grid>
      <Grid item xs={4} sx={{ height: '100%' }}>
        {/* プロダクト情報 */}
        <StockTransferProductDetail
          detailData={detailData}
          productState={productState}
          filteredTags={filteredTags}
          totalCount={totalCount}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          searchItemState={searchItemState}
          transferDirection={transferDirection}
          setTransferDirection={setTransferDirection}
          // wholesalePriceForStock={wholesalePriceForStock}
          // setSearchItem={setSearchItem}
          setTransferItems={setTransferItems}
          transferItems={transferItems}
          isReset={isReset}
          setIsReset={setIsReset}
          storeId={storeId}
        />
      </Grid>
    </Grid>
  );
};
