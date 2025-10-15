'use client';

import { useEffect, useState } from 'react';
import {
  Typography,
  TextField,
  IconButton,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Paper,
  SxProps,
  Theme,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSession } from 'next-auth/react';

import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { createClientAPI, CustomError } from '@/api/implement';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import TertiaryButton from '@/components/buttons/TertiaryButton';
import CardSearchModal from '@/components/modals/cardSearchModal/CardSearchModal';
import ChangeStockConfirmModal from '@/components/modals/ChangeStockConfirmModal';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';

// 共通で定義したい
export interface TableRowData {
  [key: string]: any;
  currentStock?: number;
  changeStock?: number;
  productName: string;
  displayNameWithMeta: string;
  select_condition?: string;
  description?: string;
  select_index?: number;

  category_id?: number;
  category?: string;
  id?: number;
  discount?: number;
  productId?: number;
  quantity?: number;
  stockNumber?: number;
  totalPrice?: number;
  unitPrice?: number;
  option_id?: number;
  product_code?: bigint;
  item_allowed_conditions?: any;
  item_products?: any;
}

interface Props {
  // productData: ProductAPI['listProducts']['response']['products'];
  productData: any;
  sx?: SxProps<Theme>;
  onRowClick?: (params: any) => void;
}

const ChangeStockTableCard: React.FC<Props> = ({
  productData,
  sx,
  onRowClick,
}: Props) => {
  const { data: session } = useSession();
  const clientAPI = createClientAPI();
  const { store } = useStore();
  const staffAccountID = session?.user?.id;
  const { setAlertState } = useAlert();

  const [tableData, setTableData] = useState<TableRowData[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // tableDataが更新されるたびにログ出力
  useEffect(() => {
    console.log('tableData 情報更新', tableData);
  }, [tableData]);

  // 新しい行をテーブルに追加する関数
  const handleAddRow = () => {
    setTableData([
      ...tableData,
      {
        currentStock: 1,
        changeStock: 1,
        productName: '',
        displayNameWithMeta: '',
        select_condition: '',
        description: '',
        select_index: tableData.length,
      },
    ]);
  };

  // 特定の行と列の値を更新する関数
  const handleChange = (index: number, key: string, value: any) => {
    const newData = [...tableData];
    newData[index][key] = value;
    setTableData(newData);
  };

  // 特定の行のステータスとoption_idを更新する関数
  const handleStatusChange = (
    index: number,
    newStatus: string,
    optionId: number,
  ) => {
    const newData = [...tableData];
    newData[index].select_condition = newStatus;
    newData[index].option_id = optionId;

    // productId を更新する
    const matchingProduct = newData[index].item_products?.find(
      (product: any) => product.conditions[0].option_id === optionId,
    );
    if (matchingProduct) {
      newData[index].productId = matchingProduct.id;
      newData[index].product_code = matchingProduct.product_code;
    }

    setTableData(newData);
  };

  // 現在のテーブルデータに基づいて残りの在庫を計算する関数
  const calculateRemainingStock = () => {
    if (!productData) return 0;
    const totalCurrentStock = tableData.reduce(
      (sum, row) => sum + Number(row.currentStock ?? 0),
      0,
    );
    // console.log('残在庫数:', totalCurrentStock);
    return Number(productData.stock_number) - totalCurrentStock;
  };

  // 特定の行に対して検索モーダルを開く関数
  const handleOpenSearchModal = (index: number) => {
    setSelectedRowIndex(index);
    setIsSearchModalOpen(true);
  };

  // 検索モーダルを閉じる関数
  const handleCloseSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  // 確認モーダルを開く関数
  const handleOpenConfirmModal = () => {
    setIsConfirmModalOpen(true);
  };

  // 確認モーダルを閉じる関数
  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };

  //ラベルプリンター
  const { pushQueue, setRunning } = useLabelPrinterHistory();

  // 変更を確認し、在庫データを更新する関数
  const handleConfirmChanges = async () => {
    handleCloseConfirmModal();
    let hasError = false; // エラーフラグを追加
    try {
      // Promise.allを使用したコード
      // const promises = tableData.map(async (item) => {
      //   if (!item.productId) {
      //     return;
      //   }

      //   const response = await clientAPI.product.createTransfer({
      //     storeID: store?.id!,
      //     productID: productData?.id!,
      //     body: {
      //       to_product_id: item.productId,
      //       item_count: Number(item.currentStock) ?? 0,
      //       description: item.description ? item.description : null,
      //       staff_account_id: Number(staffAccountID),
      //     },
      //   });

      //   // エラーが起きた要素ごとにアラートを表示
      //   if (response instanceof CustomError) {
      //     hasError = true;
      //     setAlertState({
      //       message: `${response.status}:${response.message}`,
      //       severity: 'error',
      //     });
      //   }

      //   return response;
      // });

      // await Promise.all(promises);

      // forループで非同期処理を逐次実行
      for (const item of tableData) {
        if (!item.productId) {
          continue; // `productId` が無いアイテムはスキップ
        }

        try {
          const response = await clientAPI.product.createTransfer({
            storeID: store.id,
            productID: productData.id!,
            body: {
              to_product_id: item.productId,
              item_count: Number(item.currentStock) ?? 0,
              description: item.description ? item.description : null,
              staff_account_id: Number(staffAccountID),
            },
          });

          // エラーが起きた要素ごとにアラートを表示
          if (response instanceof CustomError) {
            hasError = true;
            setAlertState({
              message: `${response.status}:${response.message}`,
              severity: 'error',
            });
          }
        } catch (error) {
          hasError = true; // 非同期操作でエラー発生時もエラーフラグを立てる
          if (error instanceof CustomError) {
            setAlertState({
              message: `エラー: ${error.status}:${error.message}`,
              severity: 'error',
            });
          } else {
            setAlertState({
              message: '不明なエラーが発生しました。',
              severity: 'error',
            });
          }
        }
      }

      // テーブルデータをリセットする
      setTableData([]);

      for (const eachProduct of tableData) {
        let currentStockNumber = eachProduct.stockNumber ?? 0;

        //すべてプリント
        for (let i = 0; i < (eachProduct.currentStock ?? 0); i++) {
          //currentStockNumberが0だったら価格付きラベルを印刷

          pushQueue({
            template: 'product',
            data: eachProduct.productId!,
            meta: {
              isFirstStock: currentStockNumber <= 0,
              isManual: true,
            },
          });

          currentStockNumber++;
        }
      }

      if (!hasError) {
        // エラーが一度も発生していない場合にのみ成功メッセージを表示
        setAlertState({
          message: 'すべての商品の転送が成功しました。',
          severity: 'success',
        });
      }
    } catch (error) {
      hasError = true; // try-catchの外部でエラーフラグを管理
      if (error instanceof CustomError) {
        setAlertState({
          message: `エラー: ${error.status}:${error.message}`,
          severity: 'error',
        });
      } else {
        setAlertState({
          message: '不明なエラーが発生しました。',
          severity: 'error',
        });
      }
    }
  };

  // 特定の行をテーブルから削除する関数
  const handleDeleteRow = (index: number) => {
    const newData = tableData.filter((_, i) => i !== index);
    setTableData(newData);
  };

  return (
    <>
      <CardSearchModal
        open={isSearchModalOpen}
        storeID={store?.id}
        tableItems={tableData}
        onClose={handleCloseSearchModal}
        selectedRowIndex={selectedRowIndex}
        setTableData={setTableData}
        isChangeStock={false}
        productIsActive={undefined}
        isAddItemCloseModal={true}
      />
      <ChangeStockConfirmModal
        productData={productData}
        open={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmChanges}
        changes={tableData}
      />
      <TableContainer
        component={Paper}
        sx={{ height: 400, boxShadow: 3, ...sx }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: '20%',
                  backgroundColor: 'grey.700',
                  color: 'text.secondary',
                  textAlign: 'center',
                }}
              >
                変更在庫数（残在庫数）
              </TableCell>
              <TableCell
                sx={{
                  width: '25%',
                  backgroundColor: 'grey.700',
                  color: 'text.secondary',
                  textAlign: 'center',
                }}
              >
                変更対象品
              </TableCell>
              <TableCell
                sx={{
                  width: '30%',
                  backgroundColor: 'grey.700',
                  color: 'text.secondary',
                  textAlign: 'center',
                }}
              >
                状態
              </TableCell>
              <TableCell
                sx={{
                  width: '19%',
                  backgroundColor: 'grey.700',
                  color: 'text.secondary',
                  textAlign: 'center',
                }}
              >
                備考
              </TableCell>
              <TableCell
                sx={{
                  width: '6%',
                  backgroundColor: 'grey.700',
                  color: 'text.secondary',
                  textAlign: 'center',
                }}
              >
                削除
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData?.map((row, index) => (
              <TableRow key={index}>
                <TableCell
                  sx={{
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-block',
                      textAlign: 'center',
                    }}
                  >
                    <TextField
                      type="number"
                      value={row.currentStock ?? ''}
                      onChange={(e) =>
                        handleChange(index, 'currentStock', e.target.value)
                      }
                      sx={{
                        width: '40%',
                        mr: 1,
                        '& input': {
                          padding: '5px',
                          textAlign: 'center',
                        },
                      }}
                    />
                    <Typography
                      component="span"
                      sx={{
                        verticalAlign: 'middle',
                      }}
                    >
                      ({calculateRemainingStock()})
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell
                  sx={{
                    textAlign: 'center',
                  }}
                >
                  <Typography>
                    {row.displayNameWithMeta ? (
                      <>
                        {row.displayNameWithMeta}{' '}
                        <SecondaryButton
                          onClick={() => handleOpenSearchModal(index)}
                        >
                          変更
                        </SecondaryButton>
                      </>
                    ) : (
                      <SecondaryButton
                        onClick={() => handleOpenSearchModal(index)}
                      >
                        検索
                      </SecondaryButton>
                    )}
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    textAlign: 'center',
                  }}
                >
                  {row.item_products?.map((option: any) => {
                    const ButtonComponent =
                      row.option_id === option.conditions[0].option_id
                        ? PrimaryButton
                        : TertiaryButton;
                    return (
                      <ButtonComponent
                        key={option.id}
                        onClick={() =>
                          handleStatusChange(
                            index,
                            option.conditions[0].option_name,
                            option.conditions[0].option_id,
                          )
                        }
                        sx={{ marginRight: '2px' }}
                      >
                        {option.conditions[0].option_name}
                      </ButtonComponent>
                    );
                  })}
                </TableCell>
                <TableCell>
                  <TextField
                    value={row.description ?? ''}
                    onChange={(e) =>
                      handleChange(index, 'description', e.target.value)
                    }
                    sx={{
                      width: '100%',
                      '& input': {
                        padding: '5px',
                      },
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleDeleteRow(index)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={5} align="center">
                <IconButton onClick={handleAddRow}>
                  <AddIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'end',
          width: '100%',
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          sx={{ backgroundColor: 'primary.main', width: '20%' }}
          onClick={handleOpenConfirmModal}
          disabled={tableData.length === 0} // tableDataが空の場合、ボタンを非活性にする
        >
          変更
        </Button>
      </Box>
    </>
  );
};

export default ChangeStockTableCard;
