'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Paper,
  AppBar,
  Toolbar,
  Stack,
  Snackbar,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Image from 'next/image';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { z } from 'zod';
import { REGISTER_PATH } from '@/constants/paths';
import PrimaryButton from '@/components/buttons/PrimaryButton';

// バリデーションスキーマ
const pricingSchema = z.object({
  mainAccountFee: z.string().transform(Number),
  headquartersFee: z.string().transform(Number),
  mobileAppFee: z.string().transform(Number),
  initialCost: z.string().transform(Number),
  planName: z.string().min(1, 'プラン名を入力してください'),
});

const PricingAdminPage = () => {
  // 状態管理
  const [pricingData, setPricingData] = useState<{
    mainAccountFee: string;
    headquartersFee: string;
    mobileAppFee: string;
    initialCost: string;
    planName: string;
  }>({
    mainAccountFee: '50000',
    headquartersFee: '0',
    mobileAppFee: '0',
    initialCost: '0',
    planName: '',
  });

  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (
      [
        'mainAccountFee',
        'headquartersFee',
        'mobileAppFee',
        'initialCost',
      ].includes(name)
    ) {
      if (value === '' || /^\d+$/.test(value)) {
        setPricingData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setPricingData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // エラーをクリア
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // リンク生成ハンドラ
  const handleGenerateLink = async () => {
    try {
      // バリデーション実行
      pricingSchema.parse(pricingData);

      setErrors({});

      try {
        // TODO: API繋ぎ込み
        const mockApiResponse = await new Promise<{ id: string }>((resolve) => {
          setTimeout(() => {
            // 実際の実装では、POSTリクエストを送信してIDを取得
            resolve({
              id: `${Math.random().toString(36).substring(2, 10)}`,
            });
          }, 1000);
        });

        const baseUrl = window.location.origin;
        const link = `${baseUrl}/${REGISTER_PATH.thanks}`;

        setGeneratedLink(link);
      } catch (apiError) {
        console.error('API呼び出しエラー:', apiError);
        setErrors({
          general:
            'リンク生成中にエラーが発生しました。もう一度お試しください。',
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  // クリップボードにコピー
  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setSnackbarOpen(true);
    }
  };

  return (
    <Box>
      <AppBar position="fixed" color="default" elevation={2}>
        <Toolbar>
          <Box width={140}>
            <Image
              src="/images/logo/logo.png"
              alt="MycalinksPos Logo"
              width={140}
              height={40}
              priority
              style={{ objectFit: 'contain' }}
            />
          </Box>
          <Typography variant="h6" component="div" sx={{ ml: 2 }}>
            管理画面
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ pt: 10, pb: 2 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            color="grey.800"
            align="center"
            mb={4}
          >
            料金設定・リンク発行
          </Typography>

          <Stack gap={2}>
            <FormField
              label="プラン名"
              name="planName"
              value={pricingData.planName}
              onChange={handleChange}
              required
              error={!!errors.planName}
              helperText={
                errors.planName || 'URLに使用されるプラン名を入力してください'
              }
              placeholder="例: ⚪︎⚪︎株式会社様用プラン"
            />

            <Typography variant="subtitle2" fontWeight="bold" color="grey.800">
              料金設定（円）
            </Typography>

            <FormField
              label="メインアカウント月額利用料"
              name="mainAccountFee"
              value={pricingData.mainAccountFee}
              onChange={handleChange}
              error={!!errors.mainAccountFee}
              helperText={errors.mainAccountFee}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">円</InputAdornment>
                ),
              }}
            />

            <FormField
              label="本部管理アカウント"
              name="headquartersFee"
              value={pricingData.headquartersFee}
              onChange={handleChange}
              error={!!errors.headquartersFee}
              helperText={errors.headquartersFee}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">円</InputAdornment>
                ),
              }}
            />

            <FormField
              label="スマホ・タブレット連携利用料"
              name="mobileAppFee"
              value={pricingData.mobileAppFee}
              onChange={handleChange}
              error={!!errors.mobileAppFee}
              helperText={errors.mobileAppFee}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">円</InputAdornment>
                ),
              }}
            />

            <FormField
              label="初期費用"
              name="initialCost"
              value={pricingData.initialCost}
              onChange={handleChange}
              error={!!errors.initialCost}
              helperText={errors.initialCost}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">円</InputAdornment>
                ),
              }}
            />

            <PrimaryButton onClick={handleGenerateLink} fullWidth>
              リンクを生成する
            </PrimaryButton>

            {generatedLink && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.400', borderRadius: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  生成されたリンク:
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TextField
                    value={generatedLink}
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                  <IconButton
                    onClick={handleCopyLink}
                    color="primary"
                    sx={{ bgcolor: 'grey.200' }}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="リンクをクリップボードにコピーしました"
      />
    </Box>
  );
};

export default PricingAdminPage;

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
