'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import {
  TextField,
  Typography,
  Box,
  Container,
  Stack,
  Paper,
  FormHelperText,
} from '@mui/material';
import Image from 'next/image';
import { useEcPasswordReset } from '@/app/ec/(core)/hooks/useEcPasswordReset';
import { PATH } from '@/app/ec/(core)/constants/paths';
import { usePasswordResetFlow } from '@/app/ec/(core)/hooks/usePasswordResetFlow';

const schema = z.object({
  mail: z
    .string()
    .email(
      'メールアドレスのご登録が確認できませんでした。再度正しいメールアドレスを入力してください',
    ),
});

type FormData = z.infer<typeof schema>;

const ForgotPasswordPage = () => {
  const router = useRouter();
  const { forgetPassword } = useEcPasswordReset();
  const { startResetFlow } = usePasswordResetFlow();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await forgetPassword({ mail: data.mail });

      if (result && result.ok) {
        startResetFlow();
        router.push(PATH.FORGET_PASSWORD.signIn);
      } else if (result && result.error) {
        console.error('パスワード再設定APIエラー:', result.error);
      } else {
        console.error(
          'パスワード再設定APIが予期しない結果を返しました:',
          result,
        );
      }
    } catch (error) {
      console.error('パスワード再設定リクエストが失敗しました:', error);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 1 }}>
      <Typography
        variant="h5"
        align="center"
        sx={{ mb: 2, fontWeight: 'bold' }}
      >
        -パスワード再発行-
      </Typography>
      <Paper elevation={2} sx={{ p: 3, borderRadius: '8px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Image
            src="/images/logo/mycaLogoOnly.png"
            alt="Mycalinks Logo"
            width={96}
            height={96}
          />
        </Box>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="body1"
                sx={{
                  mb: 1,
                  color: errors.mail ? 'error.main' : 'inherit',
                }}
              >
                メールアドレス
              </Typography>
              <TextField
                {...register('mail')}
                fullWidth
                type="email"
                size="small"
                variant="outlined"
                error={!!errors.mail}
              />
              {errors.mail && (
                <FormHelperText error>{errors.mail.message}</FormHelperText>
              )}
            </Box>
            <Box sx={{ mt: 2 }}>
              <PrimaryButton type="submit" fullWidth>
                送信する
              </PrimaryButton>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default ForgotPasswordPage;
