'use client';

import { useState, useEffect } from 'react';
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
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { RegisterAPIRes } from '@/api/frontend/register/api';
import { useCloseReceipt } from '@/app/auth/(dashboard)/register/hooks/useCloseReceipt';

const initialCashData = [
  { type: '10,000円札', unitAmount: 10000 },
  { type: '5,000円札', unitAmount: 5000 },
  { type: '2,000円札', unitAmount: 2000 },
  { type: '1,000円札', unitAmount: 1000 },
  { type: '500円玉', unitAmount: 500 },
  { type: '100円玉', unitAmount: 100 },
  { type: '50円玉', unitAmount: 50 },
  { type: '10円玉', unitAmount: 10 },
  { type: '5円玉', unitAmount: 5 },
  { type: '1円玉', unitAmount: 1 },
];

interface Props {
  open: boolean;
  onClose: () => void;
  settlement: RegisterAPIRes['listRegisterSettlement']['settlements'][0] | null;
}

export const CheckHistoryDetailModal: React.FC<Props> = ({
  open,
  onClose,
  settlement,
}: Props) => {
  const [cashData, setCashData] = useState<
    ((typeof initialCashData)[0] & { count: number; amount: number })[]
  >([]);

  const totalBy = (kind: string, method: string) => {
    return (
      settlement?.sales.find(
        (s) => s.kind === kind && s.payment_method === method,
      )?.total_price ?? 0
    );
  };

  useEffect(() => {
    if (!settlement) return;

    const drawers = settlement.register_settlement_drawers;
    const map = new Map<number, number>();
    drawers.forEach((d) => {
      map.set(d.denomination, d.item_count);
    });

    const updated = initialCashData.map((row) => {
      const count = map.get(row.unitAmount) ?? 0;
      return {
        ...row,
        count,
        amount: count * row.unitAmount,
      };
    });

    setCashData(updated);
  }, [settlement]);

  const { printCloseReceipt, isLoading } = useCloseReceipt();

  const handleClickPrintReceipt = async () => {
    if (!settlement) return;
    await printCloseReceipt(settlement);
  };

  const sellTotalPrice = ['cash', 'bank', 'square', 'paypay', 'felica'].reduce(
    (acc, method) => {
      return acc + totalBy('sell', method);
    },
    0,
  );

  const sellReturnTotalPrice = [
    'cash',
    'bank',
    'square',
    'paypay',
    'felica',
  ].reduce((acc, method) => {
    return acc + totalBy('sell_return', method);
  }, 0);

  const buyTotalPrice = ['cash', 'bank'].reduce((acc, method) => {
    return acc + totalBy('buy', method);
  }, 0);

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title="レジ点検履歴詳細"
      width="90%"
      height="90%"
      cancelButtonText="詳細を閉じる"
      secondActionButtonText="精算レシート印刷"
      onSecondActionButtonClick={handleClickPrintReceipt}
      isSecondActionButtonLoading={isLoading}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={8} container spacing={3} direction="column">
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
                        {settlement?.ideal_cash_price?.toLocaleString() ?? 0}円
                      </TableCell>
                      <TableCell
                        sx={{ textAlign: 'right', paddingRight: '50px' }}
                      >
                        {settlement?.actual_cash_price?.toLocaleString() ?? 0}円
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: 'right',
                          paddingRight: '50px',
                          color:
                            (settlement?.difference_price ?? 0) > 0
                              ? 'secondary.main'
                              : (settlement?.difference_price ?? 0) < 0
                              ? 'primary.main'
                              : 'inherit',
                        }}
                      >
                        {settlement?.difference_price?.toLocaleString() ?? 0}円
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* 金額 */}
            <Grid item>
              <TableContainer component={Paper}>
                <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                  <TableBody>
                    {cashData.map((row) => (
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

                        {/* 枚数 */}
                        <TableCell
                          sx={{ textAlign: 'right', paddingRight: '50px' }}
                        >
                          {row.count} 枚
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
          <Grid item xs={4} alignSelf="stretch">
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
                    maxHeight: '100%',
                  }}
                >
                  {/* 釣銭準備金 */}
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
                      {settlement?.init_cash_price?.toLocaleString() ?? '0'}円
                    </Typography>
                  </Box>

                  {/* 総売上 */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 4,
                      borderBottom: '1px solid #ccc',
                    }}
                  >
                    <Typography variant="body1" sx={{ minWidth: 170 }}>
                      総売上
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ textAlign: 'right', flexGrow: 1 }}
                    >
                      {(
                        sellTotalPrice +
                        (settlement?.transaction_sell_discount_total ?? 0)
                      ).toLocaleString() ?? '0'}
                      円
                    </Typography>
                  </Box>

                  {/* 純売上 */}
                  <Box sx={{ mb: 4 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: '1px solid #ccc',
                      }}
                    >
                      <Typography variant="body1" sx={{ minWidth: 170 }}>
                        純売上
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ textAlign: 'right', flexGrow: 1 }}
                      >
                        {sellTotalPrice.toLocaleString() ?? '0'}円
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 4, mt: 2 }}>
                      {['cash', 'bank', 'square', 'paypay', 'felica'].map(
                        (method) => (
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
                              {method === 'cash'
                                ? '現金決済'
                                : method === 'bank'
                                ? '銀行振込'
                                : method === 'square'
                                ? 'カード決済'
                                : method === 'paypay'
                                ? 'QR決済'
                                : '電子マネー決済'}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ textAlign: 'right', flexGrow: 1 }}
                            >
                              {totalBy('sell', method).toLocaleString()}円
                            </Typography>
                          </Box>
                        ),
                      )}
                    </Box>
                  </Box>

                  {/* 総返金 */}
                  <Box sx={{ mb: 4 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: '1px solid #ccc',
                      }}
                    >
                      <Typography variant="body1" sx={{ minWidth: 170 }}>
                        総返金
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ textAlign: 'right', flexGrow: 1 }}
                      >
                        {sellReturnTotalPrice.toLocaleString() ?? '0'}円
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 4, mt: 2 }}>
                      {['cash', 'bank', 'square', 'paypay', 'felica'].map(
                        (method) => (
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
                              {method === 'cash'
                                ? '現金決済'
                                : method === 'bank'
                                ? '銀行振込'
                                : method === 'square'
                                ? 'カード決済'
                                : method === 'paypay'
                                ? 'QR決済'
                                : '電子マネー決済'}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ textAlign: 'right', flexGrow: 1 }}
                            >
                              {totalBy('sell_return', method).toLocaleString()}
                              円
                            </Typography>
                          </Box>
                        ),
                      )}
                    </Box>
                  </Box>

                  {/* 総買取 */}
                  <Box sx={{ mb: 4 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: '1px solid #ccc',
                      }}
                    >
                      <Typography variant="body1" sx={{ minWidth: 170 }}>
                        総買取
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ textAlign: 'right', flexGrow: 1 }}
                      >
                        {buyTotalPrice.toLocaleString() ?? '0'}円
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 4, mt: 2 }}>
                      {['cash', 'bank'].map((method) => (
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
                            {method === 'cash' ? '現金精算' : '銀行振込'}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ textAlign: 'right', flexGrow: 1 }}
                          >
                            {totalBy('buy', method).toLocaleString()}円
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* 前金 */}
                  <Box sx={{ mb: 4 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: '1px solid #ccc',
                      }}
                    >
                      <Typography variant="body1" sx={{ minWidth: 170 }}>
                        前金
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 4, mt: 2 }}>
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
                          variant="body2"
                          sx={{ textAlign: 'right', flexGrow: 1 }}
                        >
                          {(
                            settlement?.reservation_deposit_total ?? 0
                          ).toLocaleString()}
                          円
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
                          variant="body2"
                          sx={{ textAlign: 'right', flexGrow: 1 }}
                        >
                          {(
                            settlement?.reservation_deposit_return_total ?? 0
                          ).toLocaleString()}
                          円
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* 入金 */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 4,
                      borderBottom: '1px solid #ccc',
                    }}
                  >
                    <Typography variant="body1" sx={{ minWidth: 170 }}>
                      入金
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ textAlign: 'right', flexGrow: 1 }}
                    >
                      {settlement?.import_total?.toLocaleString() ?? '0'}円
                    </Typography>
                  </Box>

                  {/* 出金 */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: '1px solid #ccc',
                    }}
                  >
                    <Typography variant="body1" sx={{ minWidth: 170 }}>
                      出金
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ textAlign: 'right', flexGrow: 1 }}
                    >
                      {settlement?.export_total?.toLocaleString() ?? '0'}円
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </CustomModalWithIcon>
  );
};
