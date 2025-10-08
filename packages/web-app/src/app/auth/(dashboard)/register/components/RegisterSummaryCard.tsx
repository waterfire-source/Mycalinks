'use client';

import { Card, CardContent, Typography, Box, Stack } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';

interface RegisterSummaryCardProps {
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
  totalSales: number;
  onConfirmRegisterSettlement: () => void;
  onReload?: () => void;
  submitButton: string;
}

export function RegisterSummaryCard({
  cashFlowData,
  transactionSalesData = [],
  totalSales,
  onConfirmRegisterSettlement,
  submitButton,
  onReload,
}: RegisterSummaryCardProps) {
  // 指定した支払い方法、種別の金額を返却する
  const getTotalByPayment = (kind: string, method: string) => {
    return transactionSalesData
      .filter((t) => t.kind === kind && t.payment_method === method)
      .reduce((sum, t) => sum + t.total_price, 0);
  };

  // 集計値の計算（総売上、総返金、総買取）
  const getTotalByKind = (kind: string) => {
    return transactionSalesData
      .filter((t) => t.kind === kind)
      .reduce((sum, t) => sum + t.total_price, 0);
  };

  const format = (num?: number) => `${(num ?? 0).toLocaleString()}円`;
  const paymentMethods = ['cash', 'bank', 'square', 'paypay', 'felica'];

  return (
    <Card sx={{ width: '100%', backgroundColor: 'grey.100', height: '100%' }}>
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
        {onReload && (
          <IconButton onClick={onReload}>
            <RefreshIcon sx={{ color: 'text.secondary' }} />
          </IconButton>
        )}
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
            value={format(cashFlowData?.initCashPrice)}
          />

          {/* 総売上 */}
          <SummaryRow label="総売上" value={format(totalSales)} />

          {/* 純売上 */}
          <SummaryGroup label="純売上" value={format(getTotalByKind('sell'))}>
            {paymentMethods.map((method) => (
              <SummarySubRow
                key={method}
                label={getLabel(method)}
                value={format(getTotalByPayment('sell', method))}
              />
            ))}
          </SummaryGroup>

          {/* 総返金 */}
          <SummaryGroup
            label="総返金"
            value={format(getTotalByKind('sell_return'))}
          >
            {paymentMethods.map((method) => (
              <SummarySubRow
                key={method}
                label={getLabel(method)}
                value={format(getTotalByPayment('sell_return', method))}
              />
            ))}
          </SummaryGroup>

          {/* 総買取 */}
          <SummaryGroup label="総買取" value={format(getTotalByKind('buy'))}>
            <SummarySubRow
              label="現金精算"
              value={format(getTotalByPayment('buy', 'cash'))}
            />
            <SummarySubRow
              label="銀行振込"
              value={format(getTotalByPayment('buy', 'bank'))}
            />
          </SummaryGroup>

          {/* 前金*/}
          <SummaryGroup label="前金">
            <SummarySubRow
              label="受領"
              value={format(cashFlowData?.reservation_deposit)}
            />
            <SummarySubRow
              label="返金"
              value={format(cashFlowData?.reservation_deposit_return)}
            />
          </SummaryGroup>

          {/* 入金 */}
          <SummaryRow label="入金" value={format(cashFlowData?.import)} />

          {/* 出金 */}
          <SummaryRow label="出金" value={format(cashFlowData?.export)} />
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
            onClick={onConfirmRegisterSettlement}
          >
            {submitButton}
          </PrimaryButtonWithIcon>
        </Box>
      </CardContent>
    </Card>
  );
}

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
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
    <Typography variant="body1" sx={{ textAlign: 'right', flexGrow: 1 }}>
      {value}
    </Typography>
  </Box>
);

const SummaryGroup = ({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
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
      {value && (
        <Typography variant="body1" sx={{ textAlign: 'right', flexGrow: 1 }}>
          {value}
        </Typography>
      )}
    </Box>
    <Box sx={{ ml: 4, mt: 2 }}>{children}</Box>
  </Box>
);

const SummarySubRow = ({ label, value }: { label: string; value: string }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      mt: 2,
      borderBottom: '1px solid #ccc',
    }}
  >
    <Typography variant="body2" sx={{ minWidth: 170 }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{ textAlign: 'right', flexGrow: 1, fontSize: '0.875rem' }}
    >
      {value}
    </Typography>
  </Box>
);

// 総売上、総返金のラベルマッピング用
const getLabel = (method: string) => {
  switch (method) {
    case 'cash':
      return '現金決済';
    case 'bank':
      return '銀行振込';
    case 'square':
      return 'カード決済';
    case 'paypay':
      return 'QR決済';
    case 'felica':
      return '電子マネー決済';
    default:
      return method;
  }
};
