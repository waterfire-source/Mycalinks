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
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
});

type FormData = z.infer<typeof schema>;

const ChangePasswordPage = () => {
  const router = useRouter();
  const passwordResetFlow = usePasswordResetFlow();
  const { changePassword } = useEcPasswordReset();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    if (passwordResetFlow.initialized) {
      passwordResetFlow.redirectIfInvalidAccess('changePassword');
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
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      console.error('User IDが見つかりません');
      return;
    }
    try {
      const result = await changePassword({
        user: Number(userId),
        password: data.password,
      });

      if (result && 'ok' in result) {
        passwordResetFlow.completeFlow();
        // セキュリティ的にuserIdをsession利用
        sessionStorage.removeItem('userId');
        router.push(PATH.LOGIN);
      } else {
        console.error('パスワード変更に失敗しました:', result);
      }
    } catch (error) {
      console.error('パスワード変更に失敗しました:', error);
    }
  };

  if (
    !passwordResetFlow.initialized ||
    !passwordResetFlow.checkAccessFor('changePassword')
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
        -パスワード変更-
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
                パスワード変更
              </PrimaryButton>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default ChangePasswordPage;
