'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { RegisterSettlementKind, RegisterStatus } from '@prisma/client';
import { useStore } from '@/contexts/StoreContext';
import { useRegister } from '@/contexts/RegisterContext';
import { PATH } from '@/constants/paths';
import { useAlert } from '@/contexts/AlertContext';
import { useRegisterSettlement } from '@/feature/register/hooks/useRegisterSettlement';
import { useRegisterTodaySummary } from '@/feature/register/hooks/useRegisterTodaySummary';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { CenteredCard } from '@/app/auth/(dashboard)/register/components/CenteredCard';
import { RegisterSummaryCard } from '@/app/auth/(dashboard)/register/components/RegisterSummaryCard';

const initialCashData = [
  { type: '10,000円札', count: 0, unitAmount: 10000, amount: 0 },
  { type: '5,000円札', count: 0, unitAmount: 5000, amount: 0 },
  { type: '2,000円札', count: 0, unitAmount: 2000, amount: 0 },
  { type: '1,000円札', count: 0, unitAmount: 1000, amount: 0 },
  { type: '500円玉', count: 0, unitAmount: 500, amount: 0 },
  { type: '100円玉', count: 0, unitAmount: 100, amount: 0 },
  { type: '50円玉', count: 0, unitAmount: 50, amount: 0 },
  { type: '10円玉', count: 0, unitAmount: 10, amount: 0 },
  { type: '5円玉', count: 0, unitAmount: 5, amount: 0 },
  { type: '1円玉', count: 0, unitAmount: 1, amount: 0 },
];

export default function RegisterCheckPage() {
  const { store } = useStore();
  const router = useRouter();
  const { setAlertState } = useAlert();
  const { register, resetRegister } = useRegister();
  const { createRegisterSettlement } = useRegisterSettlement();
  const { getRegisterTodaySummary } = useRegisterTodaySummary();
  const [cashData, setCashData] = useState(initialCashData);
  const [cashFlowData, setCashFlowData] = useState<any>(null);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [transactionSalesData, setTransactionSalesData] = useState<any[]>([]);

  // レジ情報を最新化
  useEffect(() => {
    if (store?.id) {
      resetRegister();
    }
  }, [store?.id]);

  // ログインユーザーに紐づくレジの集計情報を取得
  const fetchSummary = async () => {
    if (!store?.id || !register?.id) return;

    const res = await getRegisterTodaySummary(store.id, register.id);
    if (res?.cashFlowData) {
      setCashFlowData(res.cashFlowData);
      setTotalSales(res.totalSales);
      setTransactionSalesData(res.transactionSalesData ?? []);
    }
  };

  useEffect(() => {
    if (store.opened) {
      fetchSummary();
    }
  }, [store?.id, register]);

  // レジ会計内訳の更新ボタンをクリック時
  const handleReload = () => {
    fetchSummary();
    resetRegister();
  };

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
  };

  // 入力された現金の計算
  const inputCashTotal = useMemo(() => {
    return cashData.reduce((sum, row) => sum + row.count * row.unitAmount, 0);
  }, [cashData]);

  // レジ点検実施
  const handleRegisterSettlement = async () => {
    if (!store?.id || !register) {
      setAlertState({
        message: `レジ点検に失敗しました。`,
        severity: 'error',
      });
      return;
    }

    const registerId = register.id;
    const drawerContents = cashData
      .filter((row) => row.count > 0)
      .map((row) => ({
        denomination: row.unitAmount,
        item_count: row.count,
      }));

    // レジ精算登録
    const result = await createRegisterSettlement(
      store.id,
      registerId, // 一括の場合でも、ログインアカウントに紐づくレジを設定
      inputCashTotal, // レジ内現金（入力）
      RegisterSettlementKind.MIDDLE, // 中間
      drawerContents,
    );

    if (result) {
      setAlertState({
        message: `レジ点検が完了しました`,
        severity: 'success',
      });
      router.push(PATH.REGISTER.checkHistory);
    }
  };

  // レジがログインアカウントに紐づいていない場合のメッセージ表示
  if (!register) {
    return <CenteredCard title="レジアカウントで入り直してください。" />;
  }

  // レジが閉まっている状態ではレジ点検はできない
  if (register.status === RegisterStatus.CLOSED) {
    return <CenteredCard title="すでにレジ締めが完了しています。" />;
  }

  const isIndividual = store?.register_cash_manage_by_separately;
  const registerName = register.display_name || '';
  const title = isIndividual
    ? `レジ点検（${registerName}）`
    : 'レジ点検（全てのレジ）';
  const calculatedCashPrice = isIndividual
    ? register.total_cash_price ?? 0 // レジごとの場合、registerからレジ内現金（計算）を取得
    : store?.total_cash_price ?? 0; // 一括の場合、storeからレジ内現金（計算）を取得

  return (
    <ContainerLayout title={title}>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={7} container spacing={3} direction="column">
            {/* 集計値 */}
            <Grid item>
              <TableContainer component={Paper}>
                <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          textAlign: 'center',
                          backgroundColor: '#616161 !important',
                          color: 'white !important',
                        }}
                      >
                        レジ内現金（計算）
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: 'center',
                          backgroundColor: '#616161 !important',
                          color: 'white !important',
                        }}
                      >
                        レジ内現金（入力）
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: 'center',
                          backgroundColor: '#616161 !important',
                          color: 'white !important',
                        }}
                      >
                        過不足
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        sx={{ textAlign: 'right', paddingRight: '50px' }}
                      >
                        {calculatedCashPrice.toLocaleString()}円
                      </TableCell>
                      <TableCell
                        sx={{ textAlign: 'right', paddingRight: '50px' }}
                      >
                        {inputCashTotal.toLocaleString()}円
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: 'right',
                          paddingRight: '50px',
                          color:
                            inputCashTotal - calculatedCashPrice > 0
                              ? 'secondary.main'
                              : inputCashTotal - calculatedCashPrice < 0
                              ? 'primary.main'
                              : 'inherit',
                        }}
                      >
                        {(
                          inputCashTotal - calculatedCashPrice
                        ).toLocaleString()}
                        円
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* 金額入力 */}
            <Grid item>
              <TableContainer component={Paper}>
                <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                  <TableBody>
                    {cashData.map((row, index) => (
                      <TableRow key={row.type}>
                        {/* ラベル */}
                        <TableCell
                          sx={{
                            textAlign: 'right',
                            backgroundColor: '#616161 !important',
                            color: 'white',
                          }}
                        >
                          {row.type}
                        </TableCell>

                        {/* 枚数入力 */}
                        <TableCell sx={{ padding: '8px' }}>
                          <NumericTextField
                            value={row.count}
                            placeholder="0"
                            size="small"
                            onChange={(e) => handleCountChange(index, e)}
                            InputProps={{
                              endAdornment: <Typography>枚</Typography>,
                            }}
                            sx={{
                              width: '100%',
                              textAlign: 'right',
                              '& input': {
                                textAlign: 'right',
                              },
                            }}
                          />
                        </TableCell>

                        {/* 金額 */}
                        <TableCell
                          sx={{
                            textAlign: 'right',
                            paddingRight: '50px',
                          }}
                        >
                          {row.amount.toLocaleString()}円
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>

          {/* レジ会計内訳カード */}
          <Grid item xs={5} alignSelf="stretch">
            <RegisterSummaryCard
              cashFlowData={cashFlowData}
              totalSales={totalSales}
              transactionSalesData={transactionSalesData}
              onConfirmRegisterSettlement={handleRegisterSettlement}
              onReload={handleReload}
              submitButton="レジ点検を確定する"
            />
          </Grid>
        </Grid>
      </Box>
    </ContainerLayout>
  );
}
