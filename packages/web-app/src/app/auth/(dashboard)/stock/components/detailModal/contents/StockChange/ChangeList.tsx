import {
  Box,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  RowData,
  SelectedData,
} from '@/app/auth/(dashboard)/stock/components/detailModal/contents/StockChange/StockChange';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { SelectChangeEvent } from '@mui/material/Select';
import { useEffect, useRef } from 'react';
import { transferProduct } from '@/app/auth/(dashboard)/stock/components/detailModal/StockDetailModal';
import { useItems } from '@/feature/item/hooks/useItems';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { QuantityControlField } from '@/components/inputFields/QuantityControlField';
import { getConditionDisplayName } from '@/feature/products/utils/conditionDisplayName';
import { ConditionChip } from '@/feature/products/components/ConditionChip';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { useAlert } from '@/contexts/AlertContext';

interface ConditionSelectProps {
  row: SelectedData;
  index: number;
  searchResults: BackendItemAPI[0]['response']['200']['items'][0][];
  handleSelectedConditionChange: (
    event: SelectChangeEvent,
    row: SelectedData,
    index: number,
  ) => void;
  storeId: number;
}
const ConditionSelect = ({
  row,
  index,
  searchResults,
  handleSelectedConditionChange,
  storeId,
}: ConditionSelectProps) => {
  const { items, fetchItemById } = useItems();

  useEffect(() => {
    const fetchProduct = async () => {
      await fetchItemById(storeId, row.itemId as number);
    };
    fetchProduct();
  }, [storeId, row.itemId, fetchItemById]);

  // ストレージの場合は'ストレージ'のみの選択肢を表示
  if (row.condition === 'ストレージ') {
    return (
      <Select
        value={row.condition}
        onChange={(event) => handleSelectedConditionChange(event, row, index)}
      >
        <MenuItem value="ストレージ">ストレージ</MenuItem>
      </Select>
    );
  }

  // 通常の商品の場合は従来通りの選択肢を表示
  return (
    <Select
      value={row.condition}
      onChange={(event) => handleSelectedConditionChange(event, row, index)}
    >
      {items?.[0]?.products.map((product) => {
        if (product.specialty_id) return null;
        return (
          <MenuItem key={product.id} value={getConditionDisplayName(product)}>
            {getConditionDisplayName(product)}
          </MenuItem>
        );
      })}
    </Select>
  );
};

interface Props {
  changeList: SelectedData[]; //変換リスト
  totalCount: number;
  detailData: BackendProductAPI[0]['response']['200']['products'][0][]; //対象のプロダクトデータ
  setSelectedRows: React.Dispatch<React.SetStateAction<SelectedData[]>>;
  searchResults: BackendItemAPI[0]['response']['200']['items'][0][]; // 検索したアイテムの情報全て
  // wholesalePriceForStock: wholesalePrice[];
  // setSearchItem: React.Dispatch<
  //   React.SetStateAction<{
  //     rowId?: number;
  //     productId: number;
  //     productStock: number;
  //   } | null>
  // >;
  transferDirection: 'in' | 'out';
  transferItems: transferProduct[];
  setTransferItems: React.Dispatch<React.SetStateAction<transferProduct[]>>;
  isReset: boolean;
  setIsReset: React.Dispatch<React.SetStateAction<boolean>>;
  storeId: number;
}

export const ChangeList = ({
  changeList,
  detailData,
  totalCount,
  setSelectedRows,
  searchResults,
  // wholesalePriceForStock, //仕入れ値で使用予定
  // setSearchItem,
  transferDirection,
  setTransferItems,
  transferItems,
  isReset,
  setIsReset,
  storeId,
}: Props) => {
  const changeListRef = useRef<(HTMLTableRowElement | null)[]>([]);
  const { setAlertState } = useAlert();

  // 状態更新処理
  const conditionUpdate = (
    oldProductId: number,
    newProductInfo: BackendItemAPI[0]['response']['200']['items'][0]['products'][0],
    index: number,
  ) => {
    setSelectedRows((prevRows: SelectedData[]) => {
      // index が一致する行が1つでもあれば、それのみを更新
      if (prevRows.some((row) => row.index === index)) {
        //状態、在庫を更新して、入力値をリセット
        return prevRows.map((row) =>
          row.index === index
            ? {
                ...row,
                productId: newProductInfo.id,
                ['condition']: newProductInfo.condition_option_display_name,
                ['stockNumber']: newProductInfo.stock_number,
                ['count']: '0',
              }
            : row,
        );
      }

      // index が一致する行がなければ、productId が一致して index が null の行を更新
      return prevRows.map((row) =>
        row.productId === oldProductId &&
        (row.index === undefined || row.index === null)
          ? //状態、在庫を更新して、入力値をリセット
            {
              ...row,
              index,
              productId: newProductInfo.id,
              ['condition']: newProductInfo.condition_option_display_name,
              ['stockNumber']: newProductInfo.stock_number,
              ['count']: '0',
            }
          : row,
      );
    });
  };

  // 状態プルダウン変更処理
  const handleSelectedConditionChange = (
    event: SelectChangeEvent<string>,
    row: SelectedData,
    index: number,
  ) => {
    // 現在選択しているプルダウン
    const selectedCondition = event.target.value;

    // プロダクトIDから関連するアイテムを取得する
    const item = searchResults.find((item) =>
      item.products.find((product) => product.id === row.productId),
    );

    //通常状態の商品のみの情報を取りたい
    const newProductInfo = item?.products.find((product) => {
      return (
        product.condition_option_display_name === selectedCondition &&
        !product.specialty_id
      );
    });

    if (selectedCondition && row.productId && newProductInfo) {
      conditionUpdate(
        row.productId, // 現在のプロダクトID
        newProductInfo,
        index,
      );
    }
    //仕入れ値の検索
    // if (newProductId && newProductStock) {
    //   setSearchItem({
    //     productId: newProductId,
    //     productStock: newProductStock,
    //   });
    // }
  };

  // 行削除
  const handleDeleteRow = (productId: number, index?: number) => {
    const updatedRows = changeList.filter((row, i) => {
      if (index !== undefined) {
        return i !== index; // index で削除
      }
      return row.productId !== productId; // productId で削除
    });

    const updatedTransferItems = transferItems.filter((row) => {
      return row.productId !== productId; // productId で削除
    });

    setSelectedRows(updatedRows); // State を更新
    setTransferItems(updatedTransferItems);
  };

  //商品リストの仕入れ値変更
  //仕入れ値変更の仕様が確定次第
  // const handleSelectedWholesalePriceChange = (
  //   oldProductId: number,
  //   key: keyof RowData,
  //   value: number,
  //   index: number,
  // ) => {
  //   setSelectedRows((prevRows: SelectedData[]) => {
  //     return prevRows.map((row) =>
  //       row.index === index || row.productId === oldProductId
  //         ? { ...row, [key]: value }
  //         : row,
  //     );
  //   });
  // };

  //商品リストの個数変更
  const handleSelectedTextChange = (
    oldProductId: number,
    key: keyof RowData,
    value: number,
    index: number,
  ) => {
    const targetRow = changeList.find((item) => item.index === index);
    if (!targetRow)
      return setAlertState({
        message: '指定した行が見つかりません',
        severity: 'error',
      });

    if (transferDirection === 'in') {
      if (!detailData[0].item_infinite_stock) {
        //totalCountは前回の値のみを保持しているためtotalCount - 前回のこのrowのcount + 今回のrowのcountを判断基準にする
        const prevThisCount = Number(targetRow.count);
        const numberToJudge = totalCount - prevThisCount + value;
        if (numberToJudge > detailData[0].stock_number) {
          setAlertState({
            message: '変換元の在庫が不足しています',
            severity: 'error',
          });
          return;
        }
      }
    } else if (transferDirection === 'out') {
      if (!targetRow.infiniteStock) {
        if (value > targetRow?.stockNumber) {
          setAlertState({
            message: '変換元の在庫が不足しています',
            severity: 'error',
          });
          return;
        }
      }
    }

    setSelectedRows((prevRows: SelectedData[]) => {
      // index が一致する行が1つでもあれば、それのみを更新
      if (prevRows.some((row) => row.index === index)) {
        return prevRows.map((row) =>
          row.index === index ? { ...row, [key]: value } : row,
        );
      }

      // index が一致する行がなければ、productId が一致して index が null の行を更新
      return prevRows.map((row) =>
        row.productId === oldProductId &&
        (row.index === undefined || row.index === null)
          ? { ...row, index, [key]: value }
          : row,
      );
    });
  };

  //最終的な在庫変換で使用する値
  useEffect(() => {
    setTransferItems((prev) => {
      // changeList にあるすべてのデータを TransferItem に追加または更新
      const updatedItems = changeList.map((item) => {
        // `prev` に同じ `index` を持つアイテムがあるかチェック
        const existingItem = prev.find((row) => row.id === item.productId);

        if (existingItem) {
          // 既に存在する場合は、値を更新
          return {
            ...existingItem,
            itemCount: Number(item.count) || 0, // 数値変換
            specificWholesalePrice: item.productWholesalePrice ?? undefined, // undefined 対策
            stockNumber: item.stockNumber,
            infiniteStock: item.infiniteStock,
            managementNumber: item.managementNumber,
            itemId: item.itemId,
            conditionOptionId: item.conditionOptionId,
          };
        } else {
          // 存在しない場合は新規追加
          return {
            id: item.index, // `index` を設定
            productId: item.productId ?? 0, // undefined 対策
            itemCount: Number(item.count) || 0, // 数値変換
            specificWholesalePrice: item.productWholesalePrice ?? undefined, // undefined 対策
            stockNumber: item.stockNumber,
            infiniteStock: item.infiniteStock,
            managementNumber: item.managementNumber,
            itemId: item.itemId,
            conditionOptionId: item.conditionOptionId,
          };
        }
      });
      return updatedItems;
    });
  }, [changeList, setTransferItems]);

  useEffect(() => {
    if (isReset) {
      setSelectedRows([]);
      setIsReset(false);
    }
  }, [isReset, setIsReset, setSelectedRows]);

  useEffect(() => {
    // 最新の行にスクロール
    if (changeListRef.current === null) {
      changeListRef.current = [];
    }

    const lastRow = changeListRef.current[changeListRef.current.length - 1];
    if (lastRow) {
      lastRow.scrollIntoView({ behavior: 'smooth' });
    }
  }, [changeList.length]);
  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
      <TableContainer
        sx={{
          height: '100%',
          boxShadow: '0px 4px 10px rgba(128, 128, 128, 0.2)',
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <Box display="flex" justifyContent="space-between">
                  <Typography>商品リスト</Typography>
                  <Typography>合計{changeList.length}点</Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {changeList.map((row, index) => {
              return (
                <TableRow
                  key={index}
                  ref={(el) => {
                    // `changeListRef.current` が初期化されていない場合に空の配列に設定
                    if (!changeListRef.current) {
                      changeListRef.current = [];
                    }
                    // `changeListRef.current[index]` に行の ref を設定
                    changeListRef.current[index] = el;
                  }}
                >
                  <TableCell>
                    <Box display="flex" gap={1} sx={{ p: 1 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={2}>
                          <ItemImage imageUrl={row.ImageUrl} height={55} />
                        </Grid>

                        {/* 商品情報 */}
                        <Grid item xs={10}>
                          <Stack direction="column" gap={1}>
                            <Typography sx={{ width: '100%' }}>
                              {`${
                                row.specialCondition
                                  ? `《${row.specialCondition}》`
                                  : ''
                              }${row.productName}`}
                            </Typography>
                            {/* 管理番号入力フィールド */}
                            <Box>
                              <TextField
                                label="管理番号"
                                value={row.managementNumber}
                                onChange={(e) => {
                                  setSelectedRows(
                                    (prevRows: SelectedData[]) => {
                                      return prevRows.map((row) =>
                                        row.index === index
                                          ? {
                                              ...row,
                                              managementNumber: e.target.value,
                                            }
                                          : row,
                                      );
                                    },
                                  );
                                }}
                                variant="outlined"
                                size="small"
                                fullWidth
                                placeholder="管理番号を入力（任意）"
                              />
                            </Box>
                            <Box display="flex" alignItems="center" gap={2}>
                              {/* 状態プルダウンと数量入力エリア */}
                              <Stack alignItems="center" gap={1}>
                                {/* 状態プルダウン */}
                                {row.specialCondition ? (
                                  <Box
                                    sx={{ width: '100%', textAlign: 'left' }}
                                  >
                                    <ConditionChip
                                      condition={row.condition || ''}
                                    />
                                  </Box>
                                ) : (
                                  <FormControl
                                    size="small"
                                    sx={{ width: '100%' }}
                                  >
                                    <ConditionSelect
                                      row={row}
                                      index={index}
                                      searchResults={searchResults}
                                      handleSelectedConditionChange={
                                        handleSelectedConditionChange
                                      }
                                      storeId={storeId}
                                    />
                                  </FormControl>
                                )}

                                {/* 数量入力 */}
                                <QuantityControlField
                                  quantity={Number(row.count)}
                                  onQuantityChange={(value) => {
                                    if (row.productId) {
                                      handleSelectedTextChange(
                                        row.productId,
                                        'count',
                                        Number(value),
                                        index,
                                      );
                                    }
                                  }}
                                  suffix="点"
                                />
                              </Stack>

                              {/* 削除ボタン */}
                              <IconButton
                                onClick={() => {
                                  if (row.productId) {
                                    handleDeleteRow(row.productId, index);
                                  }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <Box
                            sx={{
                              whiteSpace: 'nowrap', // 文字が折り返されるのを防ぐ
                            }}
                          >
                            <Typography>変更前仕入れ値</Typography>
                          </Box>
                          <Box>
                            <FormControl size="small" sx={{ minWidth: 180 }}>
                              <InputLabel sx={{ color: 'black' }}>
                                ※変更前仕入れ値
                              </InputLabel>
                              <Select
                                label="変更前仕入れ値"
                                value={row.productWholesalePrice}
                                onChange={(event) => {
                                  const selectedWholesalePriceChange =
                                    event.target.value;
                                  if (
                                    row.productId &&
                                    selectedWholesalePriceChange
                                  ) {
                                    handleSelectedWholesalePriceChange(
                                      row.productId,
                                      'productWholesalePrice',
                                      Number(selectedWholesalePriceChange),
                                      index,
                                    );
                                  }
                                }}
                              >
                                {wholesalePriceForStock &&
                                wholesalePriceForStock.length > 0 &&
                                wholesalePriceForStock.find(
                                  (wholesaleOption) =>
                                    wholesaleOption.productId === row.productId,
                                )?.originalWholesalePrices.length === 0 ? (
                                  <MenuItem value={''}>仕入れ値なし</MenuItem>
                                ) : null}
                                {wholesalePriceForStock &&
                                wholesalePriceForStock.length > 0
                                  ? wholesalePriceForStock
                                      .find(
                                        (wholesaleOption) =>
                                          wholesaleOption.productId ===
                                          row.productId,
                                      )
                                      ?.originalWholesalePrices.map(
                                        (priceOption) => (
                                          <MenuItem
                                            key={priceOption.id}
                                            value={priceOption.unit_price}
                                          >
                                            {priceOption.unit_price}円
                                          </MenuItem>
                                        ),
                                      )
                                  : null}
                              </Select>
                            </FormControl>
                            <Typography>自動設定</Typography>
                          </Box>
                        </Box> */}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
