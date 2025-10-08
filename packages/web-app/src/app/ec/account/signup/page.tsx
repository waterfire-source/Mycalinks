'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  FormHelperText,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { PATH } from '@/app/ec/(core)/constants/paths';

export const signupSchema = z
  .object({
    email: z.string().email('有効なメールアドレスを入力してください'),
    password: z.string().min(8, 'パスワードは8文字以上必要です'),
    confirmPassword: z.string().min(1, 'パスワード(確認)は必須です'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();

  const methods = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = (data: SignupFormData) => {
    sessionStorage.setItem('userData', JSON.stringify(data));
    router.push(PATH.ACCOUNT.signupConfirm);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 1 }}>
      <Typography
        variant="h5"
        component="h1"
        align="center"
        sx={{ mb: 2, fontWeight: 'bold' }}
      >
        新規アカウント登録
      </Typography>
      <Paper elevation={2} sx={{ p: 3, borderRadius: '8px' }}>
        <FormProvider {...methods}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    color: errors.email ? 'error.main' : 'inherit',
                  }}
                >
                  メールアドレス
                </Typography>
                <TextField
                  {...register('email')}
                  fullWidth
                  type="email"
                  size="small"
                  variant="outlined"
                  error={!!errors.email}
                />
                <ErrorMessage
                  errors={errors}
                  name="email"
                  render={({ message }) => (
                    <FormHelperText error>{message}</FormHelperText>
                  )}
                />
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
                  type="password"
                  size="small"
                  variant="outlined"
                  error={!!errors.password}
                />
                <ErrorMessage
                  errors={errors}
                  name="password"
                  render={({ message }) => (
                    <FormHelperText error>{message}</FormHelperText>
                  )}
                />
              </Box>

              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    color: errors.confirmPassword ? 'error.main' : 'inherit',
                  }}
                >
                  パスワード（確認）
                </Typography>
                <TextField
                  {...register('confirmPassword')}
                  fullWidth
                  type="password"
                  size="small"
                  variant="outlined"
                  error={!!errors.confirmPassword}
                />
                <ErrorMessage
                  errors={errors}
                  name="confirmPassword"
                  render={({ message }) => (
                    <FormHelperText error>{message}</FormHelperText>
                  )}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 1,
                    mb: 2,
                    py: 1.5,
                    bgcolor: '#c34646',
                    '&:hover': {
                      bgcolor: '#a93939',
                    },
                  }}
                >
                  入力内容を確認
                </Button>
              </Box>
            </Stack>
          </Box>
        </FormProvider>
      </Paper>
    </Container>
  );
}
