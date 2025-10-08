'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { createClientAPI, CustomError } from '@/api/implement';
import { useStore } from '@/contexts/StoreContext';
import { PATH } from '@/constants/paths';
import { BackendRegisterAPI } from '@/app/api/store/[store_id]/register/api';
import {
  TransactionKind,
  TransactionPaymentMethod,
  TransactionStatus,
} from '@prisma/client';
import { useAlert } from '@/contexts/AlertContext';
import { useSession } from 'next-auth/react';
import { CloseConfirmationModal } from '@/feature/close/ConfirmationModal';
import { useEposDevice } from '@/contexts/EposDeviceContext';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';

type RegisterDetailsResponse = BackendRegisterAPI[1]['response'][200];
type APIError = {
  error: string;
};

const initialCashData = [
  { type: '1万円札', count: 0, unitAmount: 10000, amount: 0 },
  { type: '5千円札', count: 0, unitAmount: 5000, amount: 0 },
  { type: '2千円札', count: 0, unitAmount: 2000, amount: 0 },
  { type: '千円札', count: 0, unitAmount: 1000, amount: 0 },
  { type: '500円硬貨', count: 0, unitAmount: 500, amount: 0 },
  { type: '100円硬貨', count: 0, unitAmount: 100, amount: 0 },
  { type: '50円硬貨', count: 0, unitAmount: 50, amount: 0 },
  { type: '10円硬貨', count: 0, unitAmount: 10, amount: 0 },
  { type: '5円硬貨', count: 0, unitAmount: 5, amount: 0 },
  { type: '1円硬貨', count: 0, unitAmount: 1, amount: 0 },
];

const initialSummaryData = [
  { label: '本日釣り銭準備金', amount: 0, input: false },
  { label: '現金販売売上', amount: 0, input: false },
  { label: '販売返金合計', amount: 0, input: false },
  { label: '現金買取合計', amount: 0, input: false },
  { label: '入金合計', amount: 0, input: false },
  { label: '出金合計', amount: 0, input: false },
  { label: 'レジ内現金(計算)', amount: 0, input: false },
  { label: 'レジ内現金(入力)', amount: 0, input: false },
  { label: '現金過不足', amount: 0, input: false },
];

export default function StockUploadPage() {
  const [cashData, setCashData] = useState(initialCashData);
  const [summaryData, setSummaryData] = useState(initialSummaryData);
  const { store, resetStore } = useStore();
  const clientAPI = createClientAPI();
  const router = useRouter();
  const { setAlertState } = useAlert();
  const { data: session } = useSession();
  const staffAccountID = session?.user?.id;
  const theme = useTheme();
  const [isConfModalOpen, setIsConfModalOpen] = useState(false);

  // APIを呼び出してデータを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = (await clientAPI.store.getRegisterDetails({
          storeID: store.id,
        })) as unknown as RegisterDetailsResponse | APIError;

        //ついでに売上も取得する
        const getTransactionsRes = await clientAPI.transaction.listTransactions(
          {
            store_id: store.id,
            status: TransactionStatus.completed,
            includeSales: true,
            today: true,
          },
        );

        //[TODO] とりあえず動かすために応急処置
        //ここがコンフリした場合はここを消す
        const cashFlowData = response.cashFlowData;

        if ('openedDateTime' in cashFlowData && 'sales' in getTransactionsRes) {
          console.log('API呼び出し成功:', cashFlowData);

          const salesInfo = getTransactionsRes.sales;

          const totalSales = salesInfo.reduce(
            (curSum, e) =>
              e.transaction_kind == TransactionKind.sell
                ? curSum + e.total_price
                : curSum,
            0,
          );

          const updatedSummaryData = [
            {
              label: '本日釣り銭準備金',
              amount: cashFlowData.initCashPrice || 0,
              input: false,
            },
            {
              label: '総販売売上',
              amount: totalSales,
              input: false,
            },
            {
              label: '現金販売売上',
              amount:
                salesInfo.find(
                  (e) =>
                    e.payment_method == TransactionPaymentMethod.cash &&
                    e.transaction_kind == TransactionKind.sell,
                )?.total_price || 0,
              input: false,
            },
            {
              label: 'カード販売売上',
              amount:
                salesInfo.find(
                  (e) =>
                    e.payment_method == TransactionPaymentMethod.square &&
                    e.transaction_kind == TransactionKind.sell,
                )?.total_price || 0,
              input: false,
            },
            {
              label: 'QR決済販売売上',
              amount:
                salesInfo.find(
                  (e) =>
                    e.payment_method == TransactionPaymentMethod.paypay &&
                    e.transaction_kind == TransactionKind.sell,
                )?.total_price || 0,
              input: false,
            },
            {
              label: '電子マネー販売売上',
              amount:
                salesInfo.find(
                  (e) =>
                    e.payment_method == TransactionPaymentMethod.felica &&
                    e.transaction_kind == TransactionKind.sell,
                )?.total_price || 0,
              input: false,
            },
            {
              label: '現金販売返金合計',
              amount: cashFlowData.transaction_sell_return || 0,
              input: false,
            },
            {
              label: '現金買取合計',
              amount:
                salesInfo.find(
                  (e) =>
                    e.payment_method == TransactionPaymentMethod.cash &&
                    e.transaction_kind == TransactionKind.buy,
                )?.total_price || 0,
              input: false,
            },
            {
              label: '入金合計',
              amount: cashFlowData.import || 0,
              input: false,
            },
            {
              label: '出金合計',
              amount: cashFlowData.export || 0,
              input: false,
            },
            {
              label: 'レジ内現金(計算)',
              amount: cashFlowData.idealCashPrice || 0,
              input: false,
            },
            { label: 'レジ内現金(入力)', amount: 0, input: false },
            {
              label: '現金過不足',
              amount: 0 - cashFlowData.idealCashPrice,
              input: false,
            },
            // { label: '調整金額', amount: 0, input: true },
          ];

          setSummaryData(updatedSummaryData);
        } else {
          console.error('API呼び出し失敗:', cashFlowData);
        }
      } catch (error) {
        console.error('API呼び出し失敗:', error);
      }
    };

    fetchData();
  }, [store.id]);

  // レジ内金額を計算
  const handleCountChange = (index: number, newCount: number) => {
    if (isNaN(newCount)) {
      newCount = 0;
    }
    const updatedCashData = cashData.map((row, i) =>
      i === index
        ? { ...row, count: newCount, amount: newCount * row.unitAmount }
        : row,
    );
    setCashData(updatedCashData);

    // 硬貨の合計金額を計算
    const totalCashAmount = updatedCashData.reduce(
      (sum, row) => sum + row.amount,
      0,
    );

    // レジ内現金(入力)の値を更新
    const updatedSummaryData = summaryData.map((row) =>
      row.label === 'レジ内現金(入力)'
        ? { ...row, amount: totalCashAmount }
        : row,
    );
    setSummaryData(updatedSummaryData);

    // 「現金過不足」の再計算を行うためにhandleSummaryChangeを呼び出す
    const inputIndex = summaryData.findIndex(
      (item) => item.label === 'レジ内現金(入力)',
    );
    if (inputIndex !== -1) {
      handleSummaryChange(inputIndex, totalCashAmount);
    }
  };

  // 釣銭を計算
  const handleSummaryChange = (index: number, newAmount: number) => {
    if (isNaN(newAmount)) {
      newAmount = 0;
    }
    const updatedSummaryData = summaryData.map((row, i) =>
      i === index ? { ...row, amount: newAmount } : row,
    );
    setSummaryData(updatedSummaryData);

    // レジ内現金(計算) - レジ内現金(入力) + 調整金額 を計算して現金過不足を設定
    const idealCash =
      updatedSummaryData.find((item) => item.label === 'レジ内現金(計算)')
        ?.amount || 0;
    const actualCash =
      updatedSummaryData.find((item) => item.label === 'レジ内現金(入力)')
        ?.amount || 0;
    const cashDifference = actualCash - idealCash;

    const updatedCashDifferenceData = updatedSummaryData.map((row) =>
      row.label === '現金過不足' ? { ...row, amount: cashDifference } : row,
    );
    setSummaryData(updatedCashDifferenceData);
  };

  // 閉店登録確認
  const handleConfirmClose = async () => {
    // レジ内現金(計算) = レジ内現金(入力)になっているかフロントでチェックする
    if (!isRegisterCloseDisabled) {
      setIsConfModalOpen(true);
      return;
    } else {
      //会計処理を実行
      handleRegisterClose();
    }
  };

  const { ePosDev } = useEposDevice();

  // 閉店登録
  const handleRegisterClose = async () => {
    try {
      // レジ締めデータを準備
      const drawerContents = cashData.map((item) => ({
        denomination: item.unitAmount,
        item_count: item.count,
      }));

      if (!staffAccountID) {
        setAlertState({
          message: `アカウント情報が存在しません。`,
          severity: 'error',
        });
        return;
      }

      const requestBody = {
        storeID: store.id,
        staff_account_id: Number(staffAccountID),
        actual_cash_price:
          summaryData.find((item) => item.label === 'レジ内現金(入力)')
            ?.amount || 0,
        drawerContents, // レジ内金額
      };

      console.log('登録する内容:', requestBody);
      const response = await clientAPI.store.postRegister(requestBody);
      console.log('response: ', response);

      if (response instanceof CustomError) {
        console.error(response.message);
        setAlertState({
          message: `レジ清算処理に失敗しました。\n${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      }
      console.log('レジ締め情報登録結果:', response);

      // const updateResponse = await clientAPI.store.updateStoreInfo({
      //   storeID: store.id,
      //   // opened: false,
      // });

      // if (updateResponse instanceof CustomError) {
      //   console.error('閉店登録失敗:', updateResponse);
      //   setAlertState({
      //     message: `閉店処理に失敗しました。\n${updateResponse.status}:${updateResponse.message}`,
      //     severity: 'error',
      //   });
      //   return;
      // }

      // console.log('閉店登録:', updateResponse);
      setAlertState({
        message: `閉店処理が完了しました`,
        severity: 'success',
      });
      resetStore();

      //閉店レシートを印刷する
      const settlementId = response.id;

      const getSettlementRes = await clientAPI.store.getSettlementDetails({
        storeID: store.id,
        settlementID: settlementId,
      });

      if (getSettlementRes instanceof CustomError) {
        setAlertState({
          message: `レジ精算情報を取得できませんでした\n${getSettlementRes.status}:${getSettlementRes.message}`,
          severity: 'error',
        });
        return;
      }

      //レシートを印刷
      if (ePosDev) {
        ePosDev.printWithCommand(getSettlementRes.receiptCommand, store.id);
      }

      router.push(`${PATH.DASHBOARD}`);
    } catch (error) {
      console.error('閉店登録失敗:', error);
    }
  };

  //レジ内の金額が同じかどうか
  const isRegisterCloseDisabled =
    summaryData.find((item) => item.label === 'レジ内現金(計算)')?.amount ===
    summaryData.find((item) => item.label === 'レジ内現金(入力)')?.amount;

  return (
    <ContainerLayout title="レジ清算">
      <CloseConfirmationModal
        open={isConfModalOpen}
        onClose={() => setIsConfModalOpen(false)}
        onConfirm={handleRegisterClose}
        theoreticalValue={
          summaryData.find((item) => item.label === 'レジ内現金(計算)')?.amount
        }
        inputValue={
          summaryData.find((item) => item.label === 'レジ内現金(入力)')?.amount
        }
      />
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={7}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        backgroundColor: 'grey.700',
                        color: 'text.secondary',
                        textAlign: 'center',
                        borderRight: `1px solid ${theme.palette.grey[300]}`,
                      }}
                    >
                      金銭
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: 'grey.700',
                        color: 'text.secondary',
                        textAlign: 'center',
                        borderRight: `1px solid ${theme.palette.grey[300]}`,
                      }}
                    >
                      枚数
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: 'grey.700',
                        color: 'text.secondary',
                        textAlign: 'center',
                      }}
                    >
                      金額
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cashData.map((row, index) => (
                    <TableRow key={row.type}>
                      <TableCell
                        sx={{
                          borderRight: `1px solid ${theme.palette.grey[300]}`,
                        }}
                      >
                        {row.type}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: 'right',
                          borderRight: `1px solid ${theme.palette.grey[300]}`,
                          width: '200px',
                        }}
                      >
                        <TextField
                          type="number"
                          value={row.count}
                          onChange={(e) =>
                            handleCountChange(index, parseInt(e.target.value))
                          }
                          sx={{
                            width: '100%',
                            fieldset: {
                              border: 'none',
                            },
                            '& input': {
                              textAlign: 'right',
                              padding: '0px',
                            },
                          }}
                          inputProps={{
                            inputMode: 'numeric',
                            pattern: '[0-9]*',
                          }}
                          InputProps={{
                            endAdornment: <Typography>枚</Typography>,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: 'right',
                          width: '250px',
                        }}
                      >
                        {row.amount.toLocaleString()}円
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell
                      sx={{
                        backgroundColor: 'grey.700',
                        color: 'text.secondary',
                        textAlign: 'center',
                        borderRight: `1px solid ${theme.palette.grey[300]}`,
                      }}
                    >
                      合計
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: 'right',
                        borderRight: `1px solid ${theme.palette.grey[300]}`,
                      }}
                    >
                      {cashData.reduce((sum, row) => sum + row.count, 0)}枚
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: 'right',
                      }}
                    >
                      {cashData
                        .reduce((sum, row) => sum + row.amount, 0)
                        .toLocaleString()}
                      円
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={5}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        backgroundColor: 'grey.700',
                        color: 'text.secondary',
                        textAlign: 'center',
                        borderRight: `1px solid ${theme.palette.grey[300]}`,
                      }}
                    >
                      本日釣銭
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: 'grey.700',
                        color: 'text.secondary',
                        textAlign: 'center',
                      }}
                    >
                      金額
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summaryData.map((row, index) => (
                    <TableRow key={row.label}>
                      <TableCell
                        sx={{
                          textAlign: 'center',
                          borderRight: `1px solid ${theme.palette.grey[300]}`,
                        }}
                      >
                        {row.label}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: 'right',
                        }}
                      >
                        {row.input ? (
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              width: '100%',
                            }}
                          >
                            {/*入力する項目があった場合 */}
                          </Box>
                        ) : (
                          <Typography>
                            {row.amount.toLocaleString()}円
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                mt: 4,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <PrimaryButton sx={{ width: '50%' }} onClick={handleConfirmClose}>
                閉店登録
              </PrimaryButton>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </ContainerLayout>
  );
}
