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
import { useEposDevice } from '@/contexts/EposDeviceContext';
import { ChangeRegisterKind } from '@/feature/cash/constants';
import { useUpdateRegister } from '@/feature/register/hooks/useUpdateRegister';
import { useRegisterCash } from '@/feature/register/hooks/useRegisterCash';
import { useRegisterSettlement } from '@/feature/register/hooks/useRegisterSettlement';
import { useRegisterTodaySummary } from '@/feature/register/hooks/useRegisterTodaySummary';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { CenteredCard } from '@/app/auth/(dashboard)/register/components/CenteredCard';
import { RegisterSummaryCard } from '@/app/auth/(dashboard)/register/components/RegisterSummaryCard';
import { ConfirmationContent } from '@/app/auth/(dashboard)/register/close/components/ConfirmationContent';

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

export default function RegisterClosePage() {
  const { store, resetStore } = useStore();
  const router = useRouter();
  const { setAlertState } = useAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { changeRegisterCash } = useRegisterCash();
  const { register, resetRegister } = useRegister();
  const { closeRegister } = useUpdateRegister();
  const [allRegisters, setAllRegisters] = useState<Register[]>();
  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const { createRegisterSettlement } = useRegisterSettlement();
  const { getRegisterTodaySummary } = useRegisterTodaySummary();
  const [cashData, setCashData] = useState(initialCashData);
  const [cashFlowData, setCashFlowData] = useState<any>(null);
  const [drawerContents, setDrawerContents] = useState<any>(null);
  const [resetAmount, setResetAmount] = useState<number>(0);
  const [transactionSalesData, setTransactionSalesData] = useState<any[]>([]);
  // const { closeStore } = useUpdateStoreInfo();
  const [isShowResetCard, setIsShowResetCard] = useState(false);
  const [isLastRegister, setIsLastRegister] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { ePosDev } = useEposDevice();

  const shouldDoCheck =
    store?.register_cash_check_timing === RegisterCheckTiming.BEFORE_CLOSE ||
    store?.register_cash_check_timing === RegisterCheckTiming.BOTH;
  const isIndividual = store?.register_cash_manage_by_separately;
  const registerName = register?.display_name || '';
  const title = isIndividual
    ? `レジ締め（${registerName}）`
    : 'レジ締め（全てのレジ）';
  const submitButton = isIndividual
    ? `${registerName} を閉める`
    : 'レジ点検を確定して閉店する';
  const calculatedCashPrice = isIndividual
    ? register?.total_cash_price ?? 0 // レジごとの場合、registerからレジ内現金（計算）を取得
    : store?.total_cash_price ?? 0; // 一括の場合、storeからレジ内現金（計算）を取得

  // レジ情報を最新化
  useEffect(() => {
    if (store?.id) {
      resetRegister();
    }
  }, [store?.id]);

  // レジ点検履歴への画面遷移
  const handleCheckHistoryNavigation = () => {
    router.push(PATH.REGISTER.checkHistory);
  };

  // レジ締めの状態をチェックするためのすべてのレジを取得処理
  useEffect(() => {
    if (!store?.id) return;

    const fetchAllRegisters = async () => {
      const res = await clientAPI.register.listRegister({ storeID: store.id });
      if (!(res instanceof CustomError)) {
        setAllRegisters(res.registers);
      }
    };

    fetchAllRegisters();
  }, [store?.id]);

  // ログインユーザーに紐づくレジの集計情報を取得
  const fetchSummary = async () => {
    if (!store?.id || !register?.id) return;

    const res = await getRegisterTodaySummary(store.id, register.id);
    if (res?.cashFlowData) {
      setCashFlowData(res.cashFlowData);
      setTransactionSalesData(res.transactionSalesData ?? []);
    }
  };

  useEffect(() => {
    if (shouldDoCheck && store.opened) {
      fetchSummary();
    }
  }, [store?.id, register]);

  // 入力された現金をリクエスト用にマッピング
  useEffect(() => {
    const drawerContents = cashData.map((row) => ({
      denomination: row.unitAmount,
      item_count: row.count,
    }));
    setDrawerContents(drawerContents);
  }, [cashData]);

  // 最後のレジかどうか
  useEffect(() => {
    if (!store?.id || !allRegisters) return;

    const unsettled = allRegisters.filter(
      (r) => r.status === RegisterStatus.OPEN,
    );
    const isLast = unsettled.length <= 1;
    setIsLastRegister(isLast);
  }, [store?.id, allRegisters]);

  // 釣銭準備金の設定
  useEffect(() => {
    if (!allRegisters || !register) return;

    if (shouldDoCheck) {
      // レジ精算を行う場合
      if (isIndividual) {
        // 個別の場合、リセットする場合はレジのリセット金額を設定
        const amount = store.register_cash_reset_enabled
          ? register.cash_reset_price || 0
          : inputCashTotal || 0;
        setResetAmount(amount);
      } else {
        // 一括の場合、リセットする場合はallRegistersの中でcash_reset_priceが0以外の最初のものを設定
        let amount = 0;
        if (store.register_cash_reset_enabled) {
          const registerWithResetPrice = allRegisters.find(
            (reg) => !!reg.cash_reset_price && reg.cash_reset_price !== 0,
          );

          amount = registerWithResetPrice?.cash_reset_price || 0;
        } else {
          // リセットしない場合は入力値を設定
          amount = inputCashTotal || 0;
        }

        setResetAmount(amount);
      }
    } else {
      // レジ精算を行わない場合
      if (isIndividual) {
        // リセットする場合はレジのリセット金額を表示
        const amount = store.register_cash_reset_enabled
          ? register.cash_reset_price || 0
          : register.total_cash_price || 0;
        setResetAmount(amount);
      } else {
        // 一括レジ管理
        let amount = 0;
        if (store.register_cash_reset_enabled) {
          // allRegistersの中でcash_reset_priceが0以外の最初のものを探す
          const registerWithResetPrice = allRegisters.find(
            (reg) => !!reg.cash_reset_price && reg.cash_reset_price !== 0,
          );

          amount = registerWithResetPrice?.cash_reset_price || 0;
        } else {
          // リセットしない場合はストアの金額を設定
          amount = store.total_cash_price || 0;
        }

        setResetAmount(amount);
      }
    }
  }, [isShowResetCard, store?.id, allRegisters]);

  // 入力された現金の合計（＝画面上の「レジ内現金（入力）」に表示する用）
  const inputCashTotal = useMemo(() => {
    return cashData.reduce((sum, row) => sum + row.count * row.unitAmount, 0);
  }, [cashData]);

  // レジがログインアカウントに紐づいていない場合のメッセージ表示
  if (!register) {
    return <CenteredCard title="レジアカウントで入り直してください。" />;
  }

  // すでにレジ締めが完了している場合のメッセージ表示
  if (register.status === RegisterStatus.CLOSED) {
    return <CenteredCard title="すでにレジ締めが完了しています。" />;
  }

  // 釣銭準備金の入力変更処理
  const handleInputChange = (value: number) => {
    setResetAmount(value ?? 0);
    setIsManualInput(true);
  };

  // ==========================================================================================
  // レジ点検を行う場合の処理 (store.register_cash_check_timing == 'BEFORE_CLOSE' or 'BOTH')
  // ==========================================================================================
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

  // レジ締め＆レジ精算登録（実施されるパターンは以下の3パターン）
  //   ①レジ点検が「一括」 かつ 翌日の釣銭準備金カードから「閉店する」した場合
  //     ・精算登録（レジ締め）→ レジ金リセット → 閉店処理
  //   ②レジ限件が「個別レジ」 かつ 最後のレジ以外 かつ 翌日の釣銭準備金カードから「閉じる」した場合
  //     ・精算登録（レジ締め）→ レジ金リセット
  //   ③レジ点検が「個別レジ」 かつ 最後のレジ かつ 確認画面から「確認して閉店する」した場合
  //     ・精算登録（レジ締め）→ レジ金リセット → 閉店処理
  const handleCloseFinalStep = async () => {
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

      // レジ精算登録
      const settlementResult = await createRegisterSettlement(
        store.id,
        registerId, // 一括の場合でも、ログインアカウントに紐づくレジを設定
        inputCashTotal, // レジ内現金（入力）
        RegisterSettlementKind.CLOSE, // 閉店モード
        drawerContents,
      );
      if (!settlementResult) {
        return; // 失敗したら後続処理は行わない
      }

      // 翌日釣銭準備金とレジ内現金（入力）に差分がある場合はリセット処理
      if (resetAmount != inputCashTotal) {
        const resetResult = await changeRegisterCash(
          store.id,
          registerId,
          ChangeRegisterKind.sales,
          undefined,
          resetAmount,
        );
        if (!resetResult) {
          return; // 失敗したら後続処理は行わない
        }
      }

      // 閉店処理（一括の場合 or 個別レジ かつ 最後のレジの場合）
      // if (!store.register_cash_manage_by_separately || isLastRegister) {
      //   const closeResult = await closeStore();
      //   if (!closeResult) {
      //     return; // 失敗したら後続処理は行わない
      //   }
      // }

      // レシート印刷: 一括の場合はスキップ
      if (store.register_cash_manage_by_separately) {
        const settlementId = settlementResult.id;

        const getSettlementRes = await clientAPI.store.getSettlementDetails({
          storeID: store.id,
          registerID: registerId,
          settlementID: settlementId,
        });

        if (getSettlementRes instanceof CustomError) {
          setAlertState({
            message: `レジ精算情報を取得できませんでした\n${getSettlementRes.status}:${getSettlementRes.message}`,
            severity: 'error',
          });
          return;
        }

        if (ePosDev) {
          await ePosDev.printWithCommand(
            getSettlementRes.receiptCommand,
            store.id,
          );
          if (getSettlementRes.closeReceiptCommand) {
            await ePosDev.printWithCommand(
              getSettlementRes.closeReceiptCommand,
              store.id,
            );
          }
        }
      }

      setAlertState({
        message: `レジ締め処理が完了しました`,
        severity: 'success',
      });

      // store、register情報を更新
      resetStore();
      resetRegister();
      router.push(PATH.DASHBOARD);
    } finally {
      setIsProcessing(false); // 終了（成功・失敗問わず）
    }
  };

  // 点検した後の釣銭準備金の入力画面を表示する
  if (isShowResetCard) {
    if (!store?.id || !register || !allRegisters) return;

    const isIndividual = store?.register_cash_manage_by_separately;
    const buttonTitle = !isIndividual || isLastRegister ? '閉店する' : '閉じる';
    const isResetEnabled = store?.register_cash_reset_enabled;
    const isResetPriceZero = resetAmount === 0;

    return (
      <CenteredCard
        title="翌日の釣銭準備金"
        titleColor="primary.main"
        titleVariant="h1"
      >
        <NumericTextField
          value={resetAmount}
          placeholder="0"
          size="small"
          onChange={handleInputChange}
          InputProps={{ endAdornment: <Typography>円</Typography> }}
          sx={{
            width: '100%',
            textAlign: 'right',
            '& input': { textAlign: 'right' },
            mb: 2,
          }}
        />

        {/* レジ金のリセットが「有効」、レジのリセット金額が「0（未設定）」の場合に注意メッセージを表示 */}
        {isResetEnabled && isResetPriceZero && !isManualInput && (
          <Typography variant="body2" align="center" sx={{ mb: 2 }}>
            ※リセット金額が設定されてない可能性があります。0円のまま続行しますか？
          </Typography>
        )}

        <Box display="flex" justifyContent="flex-end">
          <PrimaryButtonWithIcon
            onClick={handleCloseFinalStep}
            loading={isProcessing}
            disabled={isProcessing}
          >
            {buttonTitle}
          </PrimaryButtonWithIcon>
        </Box>
      </CenteredCard>
    );
  }

  // 釣銭準備金の入力モードに移動する前の処理
  const handleRegisterSettlement = async () => {
    if (!store?.id || !register || !allRegisters) return;

    if (store.register_cash_manage_by_separately && isLastRegister) {
      // 個別かつ最後のレジの場合は確認画面を表示する
      setIsShowConfirm(true);
    } else {
      // 一括 or 個別かつ最後のレジでない場合
      setIsShowResetCard(true);
    }
  };

  // 確認画面で「確認して閉店する」をクリックした場合
  const handleConfirm = () => {
    // リセットする場合はレジのリセット金額を表示
    const amount = store.register_cash_reset_enabled
      ? register.cash_reset_price || 0
      : inputCashTotal;
    setResetAmount(amount);
    setIsShowResetCard(true);
  };

  // 最後のレジの場合、入力画面のあとに確認画面を表示する
  if (isShowConfirm) {
    return (
      <ConfirmationContent
        onConfirm={handleConfirm}
        onBack={() => setIsShowConfirm(false)}
        registerName={register.display_name || ''}
        cashData={cashData}
        cashFlowData={cashFlowData}
        transactionSalesData={transactionSalesData}
        totalCashPrice={register.total_cash_price}
      ></ConfirmationContent>
    );
  }

  // ==========================================================================================
  // レジ点検をしない場合の処理 (store.register_cash_check_timing == 'BEFORE_OPEN' or 'MANUAL')
  // ==========================================================================================
  // 一括レジ締め処理（未精算レジをすべて閉める）
  const closeAllRegisters = async () => {
    if (!store?.id || !allRegisters) return;

    const unsettledRegisters = allRegisters.filter(
      (r) => r.status === RegisterStatus.OPEN,
    );

    let hasError = false;
    for (const register of unsettledRegisters) {
      try {
        await closeRegister({ id: register.id });
      } catch (e) {
        setAlertState({
          message: `レジ ${register.display_name} の締め処理に失敗しました`,
          severity: 'error',
        });
        hasError = true;
      }
    }

    return !hasError;
  };

  // 釣銭準備金の変更
  const handleResetCashSave = async () => {
    if (!store?.id || !register || !allRegisters) {
      setAlertState({
        message: `レジ情報の取得に失敗しました`,
        severity: 'error',
      });
      return;
    }

    const isIndividual = store.register_cash_manage_by_separately;
    const expectedCash = store.register_cash_manage_by_separately
      ? register.total_cash_price ?? 0
      : store.total_cash_price ?? 0;

    if (resetAmount != expectedCash) {
      await changeRegisterCash(
        store.id,
        register.id,
        ChangeRegisterKind.sales,
        undefined,
        resetAmount,
      );
    }

    // レジ締め & 閉店処理
    if (!isIndividual) {
      // 一括の場合は全てのレジを締めてから閉店処理を行う
      const closeResult = await closeAllRegisters();
      if (!closeResult) {
        return; // 失敗したら後続処理は行わない
      }

      // const result = await closeStore();
      // if (!result) {
      //   return; // 失敗したら後続処理は行わない
      // }
    } else {
      // レジごとの場合は自分のレジを締め、最後のレジであれば閉店処理を行う
      const closeResult = await closeRegister({ id: register.id });
      if (!closeResult) {
        return; // 失敗したら後続処理は行わない
      }

      // if (isLastRegister) {
      //   // const result = await closeStore();
      //   // if (!result) {
      //   //   return; // 失敗したら後続処理は行わない
      //   // }
      // }
    }

    setAlertState({
      message: `レジ締め処理が完了しました`,
      severity: 'success',
    });

    // store、register情報を更新
    resetStore();
    resetRegister();
    router.push(PATH.DASHBOARD);
  };

  // 点検しない場合は、翌日の釣銭準備金の入力を行う
  if (!shouldDoCheck) {
    if (!store?.id || !register || !allRegisters) return;

    const isIndividual = store?.register_cash_manage_by_separately;
    const buttonTitle = !isIndividual || isLastRegister ? '閉店する' : '閉じる';
    const isResetEnabled = store?.register_cash_reset_enabled;
    const isResetPriceZero = resetAmount === 0;

    return (
      <CenteredCard
        title="翌日の釣銭準備金"
        titleColor="primary.main"
        titleVariant="h1"
      >
        <NumericTextField
          value={resetAmount}
          placeholder="0"
          size="small"
          onChange={handleInputChange}
          InputProps={{ endAdornment: <Typography>円</Typography> }}
          sx={{
            width: '100%',
            textAlign: 'right',
            '& input': { textAlign: 'right' },
            mb: 3,
          }}
        />

        {/* レジ金のリセットが「有効」、レジのリセット金額が「0（未設定）」の場合に注意メッセージを表示 */}
        {isResetEnabled && isResetPriceZero && isManualInput && (
          <Typography variant="body2" align="center" sx={{ mb: 2 }}>
            ※リセット金額が設定されてない可能性があります。0円のまま続行しますか？
          </Typography>
        )}

        <Box display="flex" justifyContent="flex-end">
          <PrimaryButtonWithIcon onClick={handleResetCashSave}>
            {buttonTitle}
          </PrimaryButtonWithIcon>
        </Box>
      </CenteredCard>
    );
  }

  return (
    <ContainerLayout
      title={title}
      helpArchivesNumber={243}
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
                        {calculatedCashPrice.toLocaleString() ?? 0}円
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
              transactionSalesData={transactionSalesData}
              onConfirmRegisterSettlement={handleRegisterSettlement}
              onReload={handleReload}
              submitButton={submitButton}
            />
          </Grid>
        </Grid>
      </Box>
    </ContainerLayout>
  );
}
