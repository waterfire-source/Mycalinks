'use client';

import { Paper, Stack, Typography, Box, Divider, Link } from '@mui/material';
import { EC_PAYMENT_METHOD_MAP } from '@/app/ec/(core)/constants/paymentMethod';
import {
  CONVENIENCE_MAP,
  ConvenienceCode,
} from '@/app/ec/(core)/constants/convenience';
import { EC_EXTERNAL_PATH } from '@/app/ec/(core)/constants/paths';
import { openExternalUrl } from '@/app/ec/(core)/utils/browserUtils';

interface PaymentInfoCardProps {
  paymentMethod: string;
  paymentInfo?: string | object;
}

export const PaymentInfoCard = ({
  paymentMethod,
  paymentInfo,
}: PaymentInfoCardProps) => {
  const renderPaymentInfo = () => {
    if (!paymentInfo) return null;

    try {
      const parsedPaymentInfo =
        typeof paymentInfo === 'string' ? JSON.parse(paymentInfo) : paymentInfo;

      if (parsedPaymentInfo.cashType === 'KONBINI') {
        const konbini = parsedPaymentInfo.konbiniPaymentInformation;
        const expiryDate = new Date(
          parsedPaymentInfo.paymentExpiryDateTime,
        ).toLocaleDateString('ja-JP');

        const getKonbiniName = (code: string) => {
          // FAMILY_MART -> FAMILYMART の変換も考慮
          const normalizedCode = code === 'FAMILY_MART' ? 'FAMILYMART' : code;
          return CONVENIENCE_MAP[normalizedCode as ConvenienceCode] || code;
        };

        return (
          <Box
            sx={{
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            <Stack spacing={2}>
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" color="grey.600">
                    コンビニ
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{ fontFamily: 'monospace' }}
                  >
                    {getKonbiniName(konbini.konbiniCode)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" color="grey.600">
                    受付番号
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{ fontFamily: 'monospace' }}
                  >
                    {konbini.receiptNumber}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" color="grey.600">
                    確認番号
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{ fontFamily: 'monospace' }}
                  >
                    {konbini.confirmationNumber}
                  </Typography>
                </Box>

                <Divider />

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" color="grey.600">
                    支払期限
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color="error.main"
                  >
                    {expiryDate}
                  </Typography>
                </Box>
              </Stack>

              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <Link
                  component="button"
                  variant="body2"
                  onClick={() =>
                    openExternalUrl(
                      EC_EXTERNAL_PATH.convenienceStorePaymentMethod,
                    )
                  }
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  コンビニでの支払いについてはこちら
                </Link>
              </Box>
            </Stack>
          </Box>
        );
      }

      if (parsedPaymentInfo.cashType === 'BANK_TRANSFER_GMO_AOZORA') {
        const bankTransfer = parsedPaymentInfo.bankTransferPaymentInformation;
        const expiryDate = new Date(
          parsedPaymentInfo.paymentExpiryDateTime,
        ).toLocaleDateString('ja-JP');

        return (
          <Box
            sx={{
              p: 1.5,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            <Stack spacing={2}>
              <Typography variant="subtitle2" color="grey.600" sx={{ mb: 1 }}>
                振込先情報
              </Typography>

              <Stack spacing={1.5}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" color="grey.600">
                    銀行名
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {bankTransfer.bankName}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" color="grey.600">
                    支店名
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {bankTransfer.branchName}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" color="grey.600">
                    口座種別
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {bankTransfer.accountType === '1' ? '普通' : '当座'}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" color="grey.600">
                    口座番号
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{ fontFamily: 'monospace' }}
                  >
                    {bankTransfer.accountNumber}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" color="grey.600">
                    口座名義
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {bankTransfer.accountHolderName}
                  </Typography>
                </Box>

                <Divider />

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" color="grey.600">
                    振込期限
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color="error.main"
                  >
                    {expiryDate}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>
        );
      }

      return (
        <Typography variant="body1">
          {JSON.stringify(parsedPaymentInfo)}
        </Typography>
      );
    } catch (error) {
      return (
        <Typography variant="body1">{JSON.stringify(paymentInfo)}</Typography>
      );
    }
  };

  return (
    <Paper elevation={2} sx={{ mb: 3, p: 3 }}>
      <Stack spacing={1.5}>
        <Typography variant="h4" component="div">
          お支払い方法
        </Typography>
        <Typography variant="body1">
          {EC_PAYMENT_METHOD_MAP[paymentMethod] || paymentMethod}
        </Typography>
      </Stack>
      {paymentInfo && (
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          {renderPaymentInfo()}
        </Stack>
      )}
    </Paper>
  );
};
