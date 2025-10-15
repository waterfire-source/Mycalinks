'use client';

import React, { useState, Suspense } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Paper,
  AppBar,
  Toolbar,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { TermsOfService } from '@/app/register/components/TermsOfService';
import { REGISTER_PATH } from '@/constants/paths';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { PaymentInfoModalButton } from '@/app/register/gmo/components/PaymentInfoModalButton';
import Link from 'next/link';
import { useContractInfo } from '@/feature/register/hooks/useContractInfo';
import { useContractPayment } from '@/feature/register/hooks/useContractPayment';

// フォームデータの型定義
interface FormData {
  companyName: string;
  representativeName: string;
  address: string;
  phoneNumber: string;
  email: string;
}

// Zodスキーマ定義
const formSchema = z.object({
  companyName: z.string().min(1, '法人名を入力してください'),
  representativeName: z.string().min(1, '法人代表者名を入力してください'),
  address: z.string().min(1, '本社所在地を入力してください'),
  phoneNumber: z
    .string()
    .min(1, '電話番号を入力してください')
    .regex(/^[0-9-]{10,13}$/, '正しい電話番号を入力してください'),
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('正しいメールアドレスを入力してください'),
});

const RegistrationForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token'); // URLクエリパラメータからtokenを取得

  // カスタムフック使用
  const { contractInfo, loading, error: tokenError } = useContractInfo(token);
  const { payContract, isLoading: isSubmitting } = useContractPayment();

  // 状態管理
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    representativeName: '',
    address: '',
    phoneNumber: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentToken, setPaymentToken] = useState<string | null>(null); //支払い情報トークン
  const [cardLast4, setCardLast4] = useState<string | null>(null); //カード下4桁

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      formSchema.parse(formData);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }

    // トークンと支払い情報の確認
    if (!token) {
      setErrors({
        general: 'トークンが指定されていません。',
      });
      return;
    }

    // 契約支払いAPIを呼び出す
    const response = await payContract({
      token,
      corporation: {
        name: formData.companyName,
        ceo_name: formData.representativeName,
        head_office_address: formData.address,
        phone_number: formData.phoneNumber,
      },
      account: {
        email: formData.email,
      },
      card: {
        token: paymentToken,
      },
    });

    if (response) {
      // 3Dセキュアが必要な場合
      if (response.tds?.redirectUrl) {
        // 3DセキュアのURLにリダイレクト
        window.location.href = response.tds.redirectUrl;
      } else if (response.contract?.status === 'STARTED') {
        // 決済が完了した場合、thanksページに遷移
        router.push(REGISTER_PATH.thanks);
      } else {
        // 予期しないステータス
        setErrors({
          general: '契約処理に失敗しました。もう一度お試しください。',
        });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 入力時にエラーを消去
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // トークンエラーが発生した場合のエラー画面
  if (tokenError) {
    return (
      <Box>
        <AppBar position="fixed" color="default" elevation={2}>
          <Toolbar>
            <Box width={140}>
              <Image
                src="/images/logo/posLogo.png"
                alt="MycalinksPos Logo"
                width={140}
                height={40}
                priority
                style={{ objectFit: 'contain' }}
              />
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="sm" sx={{ pt: 10, pb: 2 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Stack alignItems="center" flexDirection="column" gap={2}>
              <Box width={160} mx="auto">
                <Image
                  src="/images/logo/posLogo.png"
                  alt="MycalinksPos Logo"
                  width={160}
                  height={45}
                  priority
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <Typography variant="h3" fontWeight="bold" color="grey.800">
                エラー
              </Typography>
              <Alert severity="error" sx={{ width: '100%' }}>
                <div style={{ whiteSpace: 'pre-line' }}>{tokenError}</div>
              </Alert>
              <Typography variant="body2" color="grey.600" textAlign="center">
                お手数ですが、送信されたメールのリンクから再度アクセスしてください。
              </Typography>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <AppBar position="fixed" color="default" elevation={2}>
        <Toolbar>
          <Box width={140}>
            <Image
              src="/images/logo/posLogo.png"
              alt="MycalinksPos Logo"
              width={140}
              height={40}
              priority
              style={{ objectFit: 'contain' }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ pt: 10, pb: 2 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Stack alignItems="center" flexDirection="column" gap={0.5}>
            <Box width={160} mx="auto">
              <Image
                src="/images/logo/posLogo.png"
                alt="MycalinksPos Logo"
                width={160}
                height={45}
                priority
                style={{ objectFit: 'contain' }}
              />
            </Box>
            <Typography variant="h3" fontWeight="bold" color="grey.800">
              利用登録
            </Typography>
          </Stack>

          {errors.general && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errors.general}
            </Alert>
          )}

          <Stack
            flexDirection="column"
            gap={2}
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 2 }}
          >
            <FormField
              label="法人名"
              required
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              error={!!errors.companyName}
              helperText={errors.companyName}
            />
            <FormField
              label="法人代表者名"
              required
              name="representativeName"
              value={formData.representativeName}
              onChange={handleChange}
              error={!!errors.representativeName}
              helperText={errors.representativeName}
            />
            <FormField
              label="本社所在地"
              required
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={!!errors.address}
              helperText={errors.address}
            />
            <FormField
              label="電話番号"
              required
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber}
            />
            <FormField
              label="メールアドレス"
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />

            <Stack gap={2}>
              <Typography
                variant="subtitle2"
                color="grey.800"
                fontWeight="bold"
              >
                利用料金
              </Typography>
              <Stack flexDirection="column" gap={1}>
                <Typography
                  variant="subtitle2"
                  color="grey.900"
                  fontWeight="bold"
                >
                  メインアカウント月額利用料
                  <br />
                  <Box component="span" fontSize="20px">
                    {contractInfo?.mainAccountFee.toLocaleString() || 0}
                  </Box>
                  円(税別)/1店舗
                </Typography>
                <PriceItem
                  label="本部管理アカウント"
                  amount={contractInfo?.headquartersFee || 0}
                />
                <PriceItem
                  label="スマホ・タブレット連携利用料"
                  amount={contractInfo?.mobileAppFee || 0}
                />
                <PriceItem
                  label="初期費用"
                  amount={contractInfo?.initialCost || 0}
                />
              </Stack>
            </Stack>

            <PaymentInfoModalButton
              setPaymentToken={(token, cardLast4) => {
                setPaymentToken(token);
                setCardLast4(cardLast4);
              }}
              paymentToken={paymentToken}
              cardLast4={cardLast4}
            />

            <TermsOfService />

            <Link href={'https://pos.mycalinks.info/scta'}>
              <Typography variant="caption" color="grey.800">
                特定商取引法はこちら
              </Typography>
            </Link>

            <PrimaryButton
              type="submit"
              disabled={isSubmitting || !paymentToken}
              fullWidth
            >
              {isSubmitting ? '送信中...' : '利用規約に同意して登録'}
            </PrimaryButton>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

// 補助コンポーネント
const FormField = ({
  label,
  required,
  error,
  helperText,
  ...props
}: {
  label: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
} & React.ComponentProps<typeof TextField>) => (
  <Box>
    <Typography
      variant="subtitle2"
      fontWeight="bold"
      gutterBottom
      color="grey.800"
    >
      {label}
      {required && (
        <Typography component="span" color="error" sx={{ ml: 0.5 }}>
          *
        </Typography>
      )}
    </Typography>
    <TextField
      fullWidth
      size="small"
      required={required}
      error={error}
      helperText={helperText}
      {...props}
    />
  </Box>
);

const PriceItem = ({
  label,
  amount,
  unit = '円',
}: {
  label: string;
  amount: number;
  unit?: string;
}) => (
  <Typography variant="subtitle2" color="grey.900" fontWeight="bold">
    {label}
    <Box component="span" fontSize="20px" ml={1}>
      {amount.toLocaleString()}
    </Box>
    {unit}
  </Typography>
);

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <RegistrationForm />
    </Suspense>
  );
}
