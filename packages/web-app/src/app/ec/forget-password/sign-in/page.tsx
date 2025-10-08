'use client';

import React, { useEffect, useState } from 'react';
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
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Image from 'next/image';
import { useEcPasswordReset } from '@/app/ec/(core)/hooks/useEcPasswordReset';
import { PATH } from '@/app/ec/(core)/constants/paths';
import { usePasswordResetFlow } from '@/app/ec/(core)/hooks/usePasswordResetFlow';

const schema = z.object({
  mail: z.string().email('正しいメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

type FormData = z.infer<typeof schema>;

const ForgetPasswordSignInPage = () => {
  const router = useRouter();
  const passwordResetFlow = usePasswordResetFlow();
  const { signIn } = useEcPasswordReset();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    if (passwordResetFlow.initialized) {
      passwordResetFlow.redirectIfInvalidAccess('signIn');
    }
  }, [passwordResetFlow.initialized]);

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
      const res = await signIn({ email: data.mail, password: data.password });
      if (res && res.length > 0 && res[0].id) {
        // セキュリティ的にuserIdをsession保持
        sessionStorage.setItem('userId', res[0].id);
        passwordResetFlow.markAsAuthenticated();
        router.push(PATH.FORGET_PASSWORD.changePassword);
        return;
      }
    } catch (error) {
      console.error('Login request failed:', error);
    }
  };

  if (
    !passwordResetFlow.initialized ||
    !passwordResetFlow.checkAccessFor('signIn')
  ) {
    return (
      <Container
        maxWidth="md"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 1 }}>
      <Typography
        variant="h5"
        align="center"
        sx={{ mb: 2, fontWeight: 'bold' }}
      >
        サインイン
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
        <Typography variant="body2" color="error" align="center" sx={{ mb: 2 }}>
          仮パスワードが書かれたメールを送信しました
          <br />
          下記よりログインし、すぐにパスワードを更新してください
        </Typography>
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
            <Box>
              <Typography
                variant="body1"
                sx={{
                  mb: 1,
                  color: errors.password ? 'error.main' : 'inherit',
                }}
              >
                パスワード
              </Typography>
              <TextField
                {...register('password')}
                fullWidth
                type={showPassword ? 'text' : 'password'}
                size="small"
                variant="outlined"
                error={!!errors.password}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={togglePasswordVisibility} size="small">
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  ),
                }}
              />
              {errors.password && (
                <FormHelperText error>{errors.password.message}</FormHelperText>
              )}
            </Box>
            <Box sx={{ mt: 2 }}>
              <PrimaryButton type="submit" fullWidth>
                ログイン
              </PrimaryButton>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default ForgetPasswordSignInPage;
