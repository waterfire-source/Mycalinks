'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  Register,
  RegisterCheckTiming,
  RegisterSettlementKind,
  RegisterStatus,
} from '@prisma/client';
import { createClientAPI, CustomError } from '@/api/implement';
import { useStore } from '@/contexts/StoreContext';
import { useRegister } from '@/contexts/RegisterContext';
import { PATH } from '@/constants/paths';
import { useAlert } from '@/contexts/AlertContext';
import { ChangeRegisterKind } from '@/feature/cash/constants';
import { useUpdateRegister } from '@/feature/register/hooks/useUpdateRegister';
import { useRegisterCash } from '@/feature/register/hooks/useRegisterCash';
import { useRegisterSettlement } from '@/feature/register/hooks/useRegisterSettlement';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { CenteredCard } from '@/app/auth/(dashboard)/register/components/CenteredCard';
import { useEposDevice } from '@/contexts/EposDeviceContext';

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

export default function RegisterOpenPage() {
  const { store, resetStore } = useStore();
  const router = useRouter();
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  // const { openStore } = useUpdateStoreInfo();
  const { register, resetRegister } = useRegister();
  const { openRegister } = useUpdateRegister();
  const { changeRegisterCash } = useRegisterCash();
  const { createRegisterSettlement } = useRegisterSettlement();
  const [allRegisters, setAllRegisters] = useState<Register[]>();
  const [cashData, setCashData] = useState(initialCashData);
  const [cashFloat, setCashFloat] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const { ePosDev } = useEposDevice();

  // レジ情報を最新化
  useEffect(() => {
    if (store?.id) {
      resetRegister();
    }
  }, [store?.id]);

  // レジ開けの状態をチェックするためのすべてのレジを取得処理
  useEffect(() => {
    if (!store?.id) return;

    fetchAllRegisters();
  }, [store?.id]);

  const fetchAllRegisters = async () => {
    if (!store?.id) return;

    const res = await clientAPI.register.listRegister({ storeID: store.id });
    if (!(res instanceof CustomError)) {
      setAllRegisters(res.registers);
    }
  };

  // レジ点検履歴への画面遷移
  const handleCheckHistoryNavigation = () => {
    router.push(PATH.REGISTER.checkHistory);
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
    if (!store?.id || !register || isProcessing) {
      setAlertState({
        message: `レジ点検に失敗しました。`,
        severity: 'error',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const registerId = register.id;
      const expectedCash = store.register_cash_manage_by_separately
        ? register.total_cash_price ?? 0
        : store.total_cash_price ?? 0;

      const drawerContents = cashData.map((row) => ({
        denomination: row.unitAmount,
        item_count: row.count,
      }));

      // レジ内現金（計算）とレジ内現金（入力）に差分がある場合はリセット処理
      if (inputCashTotal !== expectedCash) {
        const resetResult = await changeRegisterCash(
          store.id,
          registerId,
          ChangeRegisterKind.sales,
          undefined,
          inputCashTotal,
        );

        if (!resetResult) {
          return; // 失敗したら後続処理は行わない
        }
      }

      // 店舗の開店がまだの場合は開店処理（最初のレジ開け時）
      // if (!store.opened) {
      //   // const openResult = await openStore();
      //   // if (!openResult) {
      //   //   return; // 失敗したら後続処理は行わない
      //   // }
      // }

      // レジ精算登録
      const result = await createRegisterSettlement(
        store.id,
        registerId, // 一括の場合でも、ログインアカウントに紐づくレジを設定
        inputCashTotal,
        RegisterSettlementKind.OPEN, // 開店モード
        drawerContents,
      );

      if (result) {
        setAlertState({
          message: `レジ開け処理が完了しました`,
          severity: 'success',
        });

        //開け精算レシートの印刷
        const res = await clientAPI.store.getSettlementDetails({
          storeID: store.id,
          registerID: registerId,
          settlementID: result.id,
        });

        if (!(res instanceof CustomError)) {
          const receiptCommand = res.receiptCommand;

          if (ePosDev) {
            ePosDev.printWithCommand(receiptCommand, store.id);
          }
        }
      }

      // store、register情報を更新
      resetStore();
      resetRegister();
      router.push(PATH.DASHBOARD);
    } finally {
      setIsProcessing(false); // 終了（成功・失敗問わず）
    }
  };

  const isIndividual = store?.register_cash_manage_by_separately;
  const registerName = register?.display_name || '';
  const title = isIndividual
    ? `レジ開け（${registerName}）`
    : 'レジ開け（全てのレジ）';
  const calculatedCashPrice = isIndividual
    ? register?.total_cash_price ?? 0 // レジごとの場合、registerからレジ内現金（計算）を取得
    : store?.total_cash_price ?? 0; // 一括の場合、storeからレジ内現金（計算）を取得
  const shouldDoCheck =
    store?.register_cash_check_timing === RegisterCheckTiming.BEFORE_OPEN ||
    store?.register_cash_check_timing === RegisterCheckTiming.BOTH;
  const buttonName = store.opened ? 'レジ開けする' : 'レジ開けして開店する';

  // レジ点検を実施しない場合の釣銭準備金の初期値設定用
  useEffect(() => {
    if (!shouldDoCheck && calculatedCashPrice !== undefined) {
      console.log(calculatedCashPrice);
      setCashFloat(calculatedCashPrice);
    }
  }, [shouldDoCheck, calculatedCashPrice]);

  // レジがログインアカウントに紐づいていない場合のメッセージ表示
  if (!register) {
    return <CenteredCard title="レジアカウントで入り直してください。" />;
  }

  // すでにレジ開けが完了している場合のメッセージ表示
  if (register.status === RegisterStatus.OPEN) {
    return <CenteredCard title="すでにレジ開けが完了しています。" />;
  }

  // レジ点検を実施しない場合は、釣銭準備金の入力のみ
  if (!shouldDoCheck) {
    // 一括レジ開け処理
    const openAllRegisters = async () => {
      if (!store?.id || !allRegisters) {
        setAlertState({
          message: `レジ情報の取得に失敗しました`,
          severity: 'error',
        });
        return;
      }

      const unsettledRegisters = allRegisters.filter(
        (r) => r.status === RegisterStatus.CLOSED,
      );

      let hasError = false;
      for (const register of unsettledRegisters) {
        try {
          await openRegister({ id: register.id });
        } catch (e) {
          setAlertState({
            message: `レジ ${register.display_name} の開け処理に失敗しました`,
            severity: 'error',
          });
          hasError = true;
        }
      }

      return !hasError;
    };

    const handleResetCashSave = async () => {
      if (!store?.id || !register) {
        setAlertState({
          message: `レジ情報の取得に失敗しました`,
          severity: 'error',
        });
        return;
      }

      const registerId = register.id;
      const expectedCash = calculatedCashPrice;

      // 差分がある場合はリセット処理
      if (cashFloat !== expectedCash) {
        const resetResult = await changeRegisterCash(
          store.id,
          registerId,
          ChangeRegisterKind.sales,
          undefined,
          cashFloat,
        );

        if (!resetResult) {
          return; // 失敗したら後続処理は行わない
        }
      }

      // レジ開け
      if (!isIndividual) {
        // 一括の場合は全てのレジを締めてから開店処理を行う
        const openResult = await openAllRegisters();
        if (!openResult) {
          return; // 失敗したら後続処理は行わない
        }
      } else {
        // レジごとの場合は自分のレジを開け、最初のレジであれば開店処理を行う
        const openResult = await openRegister({ id: register.id });
        if (!openResult) {
          return; // 失敗したら後続処理は行わない
        }
      }

      // 店舗の開店がまだの場合は開店処理（最初のレジ開け時）
      // if (!store.opened) {
      //   const openResult = await openStore();
      //   if (!openResult) {
      //     return; // 失敗したら後続処理は行わない
      //   }
      // }

      setAlertState({
        message: `レジ開け処理が完了しました`,
        severity: 'success',
      });

      // store、register情報を更新
      resetStore();
      resetRegister();
      router.push(PATH.DASHBOARD);
    };

    return (
      <CenteredCard
        title="本日の釣銭準備金"
        titleColor="primary.main"
        titleVariant="h1"
      >
        <NumericTextField
          value={cashFloat}
          placeholder="0"
          size="small"
          onChange={(value) => setCashFloat(value)}
          InputProps={{ endAdornment: <Typography>円</Typography> }}
          sx={{
            width: '100%',
            textAlign: 'right',
            '& input': { textAlign: 'right' },
            mb: 3,
          }}
        />
        <Box display="flex" justifyContent="flex-end">
          <PrimaryButtonWithIcon onClick={handleResetCashSave}>
            {buttonName}
          </PrimaryButtonWithIcon>
        </Box>
      </CenteredCard>
    );
  }

  return (
    <ContainerLayout
      title={title}
      actions={
        <SecondaryButton onClick={handleCheckHistoryNavigation}>
          レジ点検履歴
        </SecondaryButton>
      }
    >
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
                            inputCashTotal - (register.total_cash_price ?? 0) >
                            0
                              ? 'secondary.main'
                              : inputCashTotal -
                                  (register.total_cash_price ?? 0) <
                                0
                              ? 'primary.main'
                              : 'inherit',
                        }}
                      >
                        {(
                          inputCashTotal - (register.total_cash_price ?? 0)
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
            <Card
              sx={{
                width: '100%',
                backgroundColor: 'grey.100',
                height: '100%',
              }}
            >
              <Stack
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                paddingX={2}
                sx={{
                  backgroundColor: 'grey.700',
                  color: 'text.secondary',
                  width: '100%',
                  height: '56px',
                  borderBottomRightRadius: '0',
                  borderBottomLeftRadius: '0',
                }}
              >
                <Typography variant="body1">レジ会計内訳</Typography>
              </Stack>
              <CardContent
                sx={{
                  backgroundColor: 'common.white',
                  height: 'calc( 100% - 56px )',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    overflowY: 'auto',
                    maxHeight: 'calc(100vh - 400px)',
                    flexGrow: 1,
                  }}
                >
                  {/*  釣銭準備金 */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 4,
                      borderBottom: '1px solid #ccc',
                    }}
                  >
                    <Typography variant="body1" sx={{ minWidth: 170 }}>
                      釣銭準備金
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ textAlign: 'right', flexGrow: 1 }}
                    >
                      {inputCashTotal.toLocaleString()}円
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    px: 2,
                    pt: 2,
                    width: '100%',
                  }}
                >
                  <PrimaryButtonWithIcon
                    sx={{
                      marginRight: 1,
                      py: 2,
                      width: '100%',
                    }}
                    onClick={handleRegisterSettlement}
                    loading={isProcessing}
                    disabled={isProcessing}
                  >
                    {buttonName}
                  </PrimaryButtonWithIcon>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </ContainerLayout>
  );
}
