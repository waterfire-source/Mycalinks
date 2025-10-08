'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { RegisterSettlementKind } from '@prisma/client';
import { useStore } from '@/contexts/StoreContext';
import { useRegister } from '@/feature/register/hooks/useRegister';
import { useRegisterSettlement } from '@/feature/register/hooks/useRegisterSettlement';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { DetailWithTooltipContent } from '@/app/auth/(dashboard)/register/close/components/DetailWithTooltipContent';

const sellPaymentMethods = ['cash', 'bank', 'square', 'paypay', 'felica'];
const buyPaymentMethods = ['cash', 'bank'];

interface ConfirmationContentProps {
  onConfirm: () => void;
  onBack: () => void;
  registerName: string;
  cashData: Array<{
    type: string;
    count: number;
    unitAmount: number;
    amount: number;
  }>;
  cashFlowData?: {
    initCashPrice: number;
    transaction_sell: number;
    transaction_sell_return: number;
    transaction_buy: number;
    transaction_buy_return: number;
    import: number;
    export: number;
    reservation_deposit: number;
    reservation_deposit_return: number;
  };
  transactionSalesData?: Array<{
    kind: string;
    payment_method: string;
    total_price: number;
  }>;
  totalCashPrice?: number;
}

export function ConfirmationContent({
  onConfirm,
  onBack,
  registerName,
  cashData,
  cashFlowData,
  transactionSalesData = [],
  totalCashPrice,
}: ConfirmationContentProps) {
  const { store } = useStore();
  const { registers, fetchRegisterList } = useRegister();
  const { fetchRegisterSettlement } = useRegisterSettlement();
  const [settlements, setSettlements] = useState<any[]>([]);

  // レジ名のマッピング用にレジを一覧取得
  useEffect(() => {
    if (!store?.id) return;
    fetchRegisterList(store.id, undefined, undefined);
  }, [store?.id]);

  // 各レジの精算データを取得
  useEffect(() => {
    const fetchSummaries = async () => {
      if (!store?.id) return;

      const res = await fetchRegisterSettlement(
        store.id,
        RegisterSettlementKind.CLOSE, // 閉店モード
        undefined, // レジは指定しない
        true, // 本日の精算データ
      );

      if (Array.isArray(res)) {
        setSettlements(res);
      }
    };

    if (!store?.id || !registers?.length) return;

    fetchSummaries();
  }, [store?.id, registers]);

  // 入力画面から引き渡したレジの集計値の計算（総売上、総返金、総買取）
  const getTotalByKind = (kind: string) => {
    return transactionSalesData
      .filter((t) => t.kind === kind)
      .reduce((sum, t) => sum + t.total_price, 0);
  };

  const drawerSummaryList = useMemo(() => {
    const map: Record<
      number,
      {
        type: string;
        unitAmount: number;
        count: number;
        amount: number;
        countTooltipDetails: string[];
        amountTooltipDetails: string[];
      }
    > = {};

    const registerNameMap = registers?.reduce(
      (acc: Record<number, string>, reg: any) => {
        acc[reg.id] = reg.display_name ?? ``;
        return acc;
      },
      {},
    );

    // 最後のレジの入力値を保存
    for (const item of cashData) {
      const tooltipCount = `${registerName}：${item.count.toLocaleString()}枚`;
      const tooltipAmount = `${registerName}：${item.amount.toLocaleString()}円`;

      map[item.unitAmount] = {
        type: item.type,
        unitAmount: item.unitAmount,
        count: item.count ?? 0,
        amount: item.amount ?? 0,
        countTooltipDetails: [tooltipCount],
        amountTooltipDetails: [tooltipAmount],
      };
    }

    // すでにレジ締めしたレジの値を加算
    for (const settlement of settlements) {
      const regId = settlement.register_id;
      const regName = registerNameMap ? registerNameMap[regId] : ``;
      for (const drawer of settlement.register_settlement_drawers ?? []) {
        const unit = drawer.denomination;
        const count = drawer.item_count;

        if (!map[unit]) {
          map[unit] = {
            type: `${unit}円`,
            unitAmount: unit,
            count: 0,
            amount: 0,
            countTooltipDetails: [],
            amountTooltipDetails: [],
          };
        }

        map[unit].count += count;
        map[unit].amount += unit * count;
        map[unit].countTooltipDetails.push(
          `${regName}：${count.toLocaleString()}枚`,
        );
        map[unit].amountTooltipDetails.push(
          `${regName}：${(unit * count).toLocaleString()}円`,
        );
      }
    }

    return Object.values(map).sort((a, b) => b.unitAmount - a.unitAmount);
  }, [cashData, settlements]);

  const totalSummary = useMemo(() => {
    const summary = {
      input: { value: 0, tooltip: [] as string[] },
      calc: { value: 0, tooltip: [] as string[] },
      diff: { value: 0, tooltip: [] as string[] },
      import: { value: 0, tooltip: [] as string[] },
      export: { value: 0, tooltip: [] as string[] },
      sell: { value: 0, tooltip: [] as string[] },
      sell_return: { value: 0, tooltip: [] as string[] },
      buy: { value: 0, tooltip: [] as string[] },
      buy_return: { value: 0, tooltip: [] as string[] }, // 画面上表示はしていない
      initCashPrice: { value: 0, tooltip: [] as string[] },
      reservation_deposit: { value: 0, tooltip: [] as string[] },
      reservation_deposit_return: { value: 0, tooltip: [] as string[] },
    };

    const registerNameMap = registers?.reduce(
      (acc: Record<number, string>, reg: any) => {
        acc[reg.id] = reg.display_name ?? '';
        return acc;
      },
      {},
    );

    // 現入力レジのデータを集計値に反映
    // レジ内現金（入力）
    const loginTotal = cashData.reduce(
      (sum, row) => sum + (row.count ?? 0) * (row.unitAmount ?? 0),
      0,
    );
    summary.input.value += loginTotal;
    summary.input.tooltip.push(
      `${registerName}：${loginTotal.toLocaleString()}円`,
    );

    if (cashFlowData) {
      // 釣銭準備金
      const startCash = cashFlowData.initCashPrice ?? 0;
      summary.initCashPrice.value += startCash;
      summary.initCashPrice.tooltip.push(
        `${registerName}：${startCash.toLocaleString()}円`,
      );

      // レジ内現金（計算）
      const ideal = totalCashPrice ?? 0;
      summary.calc.value += ideal;
      summary.calc.tooltip.push(`${registerName}：${ideal.toLocaleString()}円`);

      // 過不足
      const diff = loginTotal - ideal;
      summary.diff.value += diff;
      summary.diff.tooltip.push(`${registerName}：${diff.toLocaleString()}円`);

      // 総売上
      summary.sell.value += getTotalByKind('sell');
      summary.sell.tooltip.push(
        `${registerName}：${getTotalByKind('sell').toLocaleString()}円`,
      );

      // 総返金
      summary.sell_return.value += getTotalByKind('sell_return');
      summary.sell_return.tooltip.push(
        `${registerName}：${getTotalByKind('sell_return').toLocaleString()}円`,
      );

      // 総買取
      summary.buy.value += getTotalByKind('buy');
      summary.buy.tooltip.push(
        `${registerName}：${getTotalByKind('buy').toLocaleString()}円`,
      );

      // 未使用だが、計算だけ実施
      summary.buy_return.value += getTotalByKind('buy_return');
      summary.buy_return.tooltip.push(
        `${registerName}：${getTotalByKind('buy_return').toLocaleString()}円`,
      );

      // 前金
      summary.reservation_deposit.value +=
        cashFlowData.reservation_deposit ?? 0;
      summary.reservation_deposit.tooltip.push(
        `${registerName}：${(
          cashFlowData.reservation_deposit ?? 0
        ).toLocaleString()}円`,
      );
      summary.reservation_deposit_return.value +=
        cashFlowData.reservation_deposit_return ?? 0;
      summary.reservation_deposit_return.tooltip.push(
        `${registerName}：${(
          cashFlowData.reservation_deposit_return ?? 0
        ).toLocaleString()}円`,
      );

      // 入金
      summary.import.value += cashFlowData.import ?? 0;
      summary.import.tooltip.push(
        `${registerName}：${(cashFlowData.import ?? 0).toLocaleString()}円`,
      );

      // 出金
      summary.export.value += cashFlowData.export ?? 0;
      summary.export.tooltip.push(
        `${registerName}：${(cashFlowData.export ?? 0).toLocaleString()}円`,
      );
    }

    // 精算済みレジから追加集計
    for (const settlement of settlements) {
      const regId = settlement.register_id;
      if (!regId) continue;

      const regName = registerNameMap?.[regId] ?? '';
      const startCash = settlement.init_cash_price ?? 0;

      const actual = settlement.actual_cash_price ?? 0;
      const ideal = settlement.ideal_cash_price ?? 0;
      const diff = settlement.difference_price ?? 0;

      // 釣銭準備金
      summary.initCashPrice.value += startCash;
      summary.initCashPrice.tooltip.push(
        `${regName}：${startCash.toLocaleString()}円`,
      );

      // レジ内現金（入力）
      summary.input.value += actual;
      summary.input.tooltip.push(`${regName}：${actual.toLocaleString()}円`);

      // レジ内現金（計算）
      summary.calc.value += ideal;
      summary.calc.tooltip.push(`${regName}：${ideal.toLocaleString()}円`);

      // 過不足
      summary.diff.value += diff;
      summary.diff.tooltip.push(`${regName}：${diff.toLocaleString()}円`);

      // 前金
      summary.reservation_deposit.value +=
        settlement.reservation_deposit_total ?? 0;
      summary.reservation_deposit.tooltip.push(
        `${regName}：${(
          settlement.reservation_deposit_total ?? 0
        ).toLocaleString()}円`,
      );
      summary.reservation_deposit_return.value +=
        settlement.reservation_deposit_return_total ?? 0;
      summary.reservation_deposit_return.tooltip.push(
        `${regName}：${(
          settlement.reservation_deposit_return_total ?? 0
        ).toLocaleString()}円`,
      );

      // 入金
      summary.import.value += settlement.import_total ?? 0;
      summary.import.tooltip.push(
        `${regName}：${(settlement.import_total ?? 0).toLocaleString()}円`,
      );

      // 出金
      summary.export.value += settlement.export_total ?? 0;
      summary.export.tooltip.push(
        `${regName}：${(settlement.export_total ?? 0).toLocaleString()}円`,
      );

      // kind別（sell / sell_return / buy / buy_return）の重複加算を防ぐ
      const kindSums: Record<string, number> = {};

      // kind別の合算値を総売上、総返金、総買取に加える
      for (const sale of settlement.sales ?? []) {
        const kind = sale.kind;
        const price = sale.total_price ?? 0;
        kindSums[kind] = (kindSums[kind] || 0) + price;
      }

      (['sell', 'sell_return', 'buy', 'buy_return'] as const).forEach(
        (kind) => {
          const value = kindSums[kind] ?? 0;
          if (summary[kind]) {
            summary[kind].value += value;
            summary[kind].tooltip.push(
              `${regName}：${value.toLocaleString()}円`,
            );
          }
        },
      );
    }

    return summary;
  }, [cashData, cashFlowData, settlements, registers, registerName]);

  const salesSummaryByKindAndMethod = useMemo(() => {
    const summary: Record<
      string,
      Record<
        string,
        {
          value: number;
          tooltip: string[];
        }
      >
    > = {};

    const registerNameMap = registers?.reduce(
      (acc: Record<number, string>, reg: any) => {
        acc[reg.id] = reg.display_name ?? '';
        return acc;
      },
      {},
    );

    // 入力中のレジの sales を先に反映（transactionSalesData）
    for (const t of transactionSalesData ?? []) {
      const kind = t.kind;
      const method = t.payment_method;
      if (!summary[kind]) summary[kind] = {};
      if (!summary[kind][method])
        summary[kind][method] = { value: 0, tooltip: [] };

      summary[kind][method].value += t.total_price ?? 0;
      summary[kind][method].tooltip.push(
        `${registerName}：${(t.total_price ?? 0).toLocaleString()}円`,
      );
    }

    // 精算済みレジの sales を加算
    for (const settlement of settlements) {
      const regId = settlement.register_id;
      if (!regId) continue;

      const regName = registerNameMap?.[regId] ?? '';
      for (const sale of settlement.sales ?? []) {
        const kind = sale.kind;
        const method = sale.payment_method;
        const price = sale.total_price ?? 0;

        if (!summary[kind]) summary[kind] = {};
        if (!summary[kind][method])
          summary[kind][method] = { value: 0, tooltip: [] };

        summary[kind][method].value += price;
        summary[kind][method].tooltip.push(
          `${regName}：${price.toLocaleString()}円`,
        );
      }
    }

    return summary;
  }, [transactionSalesData, settlements, registers, registerName]);

  return (
    <ContainerLayout title="レジ締め結果確認">
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
                        <DetailWithTooltipContent
                          title={totalSummary.calc.tooltip}
                          amount={totalSummary.calc.value}
                          unit="円"
                        />
                      </TableCell>
                      <TableCell
                        sx={{ textAlign: 'right', paddingRight: '50px' }}
                      >
                        <DetailWithTooltipContent
                          title={totalSummary.input.tooltip}
                          amount={totalSummary.input.value}
                          unit="円"
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: 'right',
                          paddingRight: '50px',
                          color:
                            totalSummary.diff.value > 0
                              ? 'secondary.main'
                              : totalSummary.diff.value < 0
                              ? 'primary.main'
                              : 'inherit',
                        }}
                      >
                        <DetailWithTooltipContent
                          title={totalSummary.diff.tooltip}
                          amount={totalSummary.diff.value}
                          unit="円"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* 金額表示 */}
            <Grid item>
              <TableContainer component={Paper}>
                <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                  <TableBody>
                    {drawerSummaryList.map((row) => (
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
                        <TableCell
                          sx={{
                            textAlign: 'right',
                            paddingRight: '50px',
                          }}
                        >
                          <DetailWithTooltipContent
                            title={row.countTooltipDetails}
                            amount={row.count}
                            unit="枚"
                          ></DetailWithTooltipContent>
                        </TableCell>

                        {/* 金額 */}
                        <TableCell
                          sx={{
                            textAlign: 'right',
                            paddingRight: '50px',
                          }}
                        >
                          <DetailWithTooltipContent
                            title={row.amountTooltipDetails}
                            amount={row.amount}
                            unit="円"
                          ></DetailWithTooltipContent>
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
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    overflowY: 'auto',
                    maxHeight: 'calc(100vh - 400px)',
                  }}
                >
                  {/*  釣銭準備金 */}
                  <SummaryRow
                    label="釣銭準備金"
                    valueNode={
                      <DetailWithTooltipContent
                        amount={totalSummary.initCashPrice.value}
                        unit="円"
                        title={totalSummary.initCashPrice.tooltip}
                      />
                    }
                  />

                  {/* 総売上 */}
                  <SummaryGroup
                    label="総売上"
                    valueNode={
                      <DetailWithTooltipContent
                        amount={totalSummary.sell.value}
                        unit="円"
                        title={totalSummary.sell.tooltip}
                      />
                    }
                  >
                    {sellPaymentMethods.map((method) => {
                      const data = salesSummaryByKindAndMethod.sell?.[
                        method
                      ] ?? {
                        value: 0,
                        tooltip: [],
                      };
                      return (
                        <Box
                          key={method}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mt: 2,
                            borderBottom: '1px solid #ccc',
                          }}
                        >
                          <Typography variant="body2" sx={{ minWidth: 170 }}>
                            {getLabel('sell', method)}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ textAlign: 'right', flexGrow: 1 }}
                          >
                            <DetailWithTooltipContent
                              amount={data.value}
                              unit="円"
                              title={data.tooltip}
                            />
                          </Typography>
                        </Box>
                      );
                    })}
                  </SummaryGroup>

                  {/* 総返金 */}
                  <SummaryGroup
                    label="総返金"
                    valueNode={
                      <DetailWithTooltipContent
                        amount={totalSummary.sell_return.value}
                        unit="円"
                        title={totalSummary.sell_return.tooltip}
                      />
                    }
                  >
                    {sellPaymentMethods.map((method) => {
                      const data = salesSummaryByKindAndMethod.sell_return?.[
                        method
                      ] ?? {
                        value: 0,
                        tooltip: [],
                      };
                      return (
                        <Box
                          key={method}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mt: 2,
                            borderBottom: '1px solid #ccc',
                          }}
                        >
                          <Typography variant="body2" sx={{ minWidth: 170 }}>
                            {getLabel('sell_return', method)}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ textAlign: 'right', flexGrow: 1 }}
                          >
                            <DetailWithTooltipContent
                              amount={data.value}
                              unit="円"
                              title={data.tooltip}
                            />
                          </Typography>
                        </Box>
                      );
                    })}
                  </SummaryGroup>

                  {/* 総買取 */}
                  <SummaryGroup
                    label="総買取"
                    valueNode={
                      <DetailWithTooltipContent
                        amount={totalSummary.buy.value}
                        unit="円"
                        title={totalSummary.buy.tooltip}
                      />
                    }
                  >
                    {buyPaymentMethods.map((method) => {
                      const data = salesSummaryByKindAndMethod.buy?.[
                        method
                      ] ?? {
                        value: 0,
                        tooltip: [],
                      };
                      return (
                        <Box
                          key={method}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mt: 2,
                            borderBottom: '1px solid #ccc',
                          }}
                        >
                          <Typography variant="body2" sx={{ minWidth: 170 }}>
                            {getLabel('buy', method)}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ textAlign: 'right', flexGrow: 1 }}
                          >
                            <DetailWithTooltipContent
                              amount={data.value}
                              unit="円"
                              title={data.tooltip}
                            />
                          </Typography>
                        </Box>
                      );
                    })}
                  </SummaryGroup>

                  {/* 前金 */}
                  <SummaryGroup label="前金">
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mt: 2,
                        borderBottom: '1px solid #ccc',
                      }}
                    >
                      <Typography variant="body2" sx={{ minWidth: 170 }}>
                        受領
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ textAlign: 'right', flexGrow: 1 }}
                      >
                        <DetailWithTooltipContent
                          amount={totalSummary.reservation_deposit.value}
                          unit="円"
                          title={totalSummary.reservation_deposit.tooltip}
                        />
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mt: 2,
                        borderBottom: '1px solid #ccc',
                      }}
                    >
                      <Typography variant="body2" sx={{ minWidth: 170 }}>
                        返金
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ textAlign: 'right', flexGrow: 1 }}
                      >
                        <DetailWithTooltipContent
                          amount={totalSummary.reservation_deposit_return.value}
                          unit="円"
                          title={
                            totalSummary.reservation_deposit_return.tooltip
                          }
                        />
                      </Typography>
                    </Box>
                  </SummaryGroup>

                  {/* 入金 */}
                  <SummaryRow
                    label="入金"
                    valueNode={
                      <DetailWithTooltipContent
                        amount={totalSummary.import.value}
                        unit="円"
                        title={totalSummary.import.tooltip}
                      />
                    }
                  />

                  {/* 出金 */}
                  <SummaryRow
                    label="出金"
                    valueNode={
                      <DetailWithTooltipContent
                        amount={totalSummary.export.value}
                        unit="円"
                        title={totalSummary.export.tooltip}
                      />
                    }
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column', // 縦並びにする
                    alignItems: 'center', // 中央揃え
                    gap: 2, // ボタン間の余白
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
                    onClick={onConfirm}
                  >
                    確認して閉店する
                  </PrimaryButtonWithIcon>
                  <SecondaryButton
                    sx={{
                      marginRight: 1,
                      py: 2,
                      width: '100%',
                    }}
                    onClick={onBack}
                  >
                    レジ締め結果入力に戻る
                  </SecondaryButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </ContainerLayout>
  );
}

const SummaryRow = ({
  label,
  value,
  valueNode,
}: {
  label: string;
  value?: string;
  valueNode?: React.ReactNode;
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      mb: 4,
      borderBottom: '1px solid #ccc',
    }}
  >
    <Typography variant="body1" sx={{ minWidth: 170 }}>
      {label}
    </Typography>
    <Typography
      component="div"
      variant="body1"
      sx={{ textAlign: 'right', flexGrow: 1 }}
    >
      {valueNode ?? value}
    </Typography>
  </Box>
);

const SummaryGroup = ({
  label,
  valueNode,
  children,
}: {
  label: string;
  valueNode?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Box sx={{ mb: 4 }}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #ccc',
      }}
    >
      <Typography variant="body1" sx={{ minWidth: 170 }}>
        {label}
      </Typography>
      {valueNode && (
        <Typography
          component="div"
          variant="body1"
          sx={{ textAlign: 'right', flexGrow: 1 }}
        >
          {valueNode}
        </Typography>
      )}
    </Box>
    <Box sx={{ ml: 4, mt: 2 }}>{children}</Box>
  </Box>
);

const getLabel = (kind: string, method: string) => {
  const labelMap: Record<string, Record<string, string>> = {
    sell: {
      cash: '現金決済',
      bank: '銀行振込',
      square: 'カード決済',
      paypay: 'QR決済',
      felica: '電子マネー決済',
    },
    sell_return: {
      cash: '現金決済',
      bank: '銀行振込',
      square: 'カード決済',
      paypay: 'QR決済',
      felica: '電子マネー決済',
    },
    buy: {
      cash: '現金精算',
      bank: '銀行振込',
    },
  };

  return labelMap[kind]?.[method] ?? method;
};
