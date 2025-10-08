'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { UserRegisterInfo } from '@/app/ec/(core)/utils/validateUserInfo';
import { useAppAuth } from '@/providers/useAppAuth';

export default function SignupConfirmPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserRegisterInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAppAuth();

  useEffect(() => {
    const storedUserData = sessionStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData) as UserRegisterInfo;
        setUserData(parsedData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleConfirm = async () => {
    if (!userData) return;

    setLoading(true);

    try {
      const result = await signUp({
        email: userData.email,
        password: userData.password,
      });

      if (result && 'ok' in result) {
        sessionStorage.removeItem('userData');
        router.push('/ec/order');
      } else {
        setLoading(false);
        alert('会員登録に失敗しました。');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      setLoading(false);
      alert('エラーが発生しました。');
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (!userData) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <Paper
          elevation={2}
          sx={{ p: 2, borderRadius: '8px', fontSize: '0.875rem' }}
        >
          会員登録画面から情報を入力し直してください
          <Button
            onClick={handleBack}
            fullWidth
            variant="outlined"
            sx={{
              mt: 10,
              color: '#c34646',
              borderColor: '#c34646',
              '&:hover': {
                borderColor: '#a93939',
              },
            }}
            disabled={loading}
          >
            戻る
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 1 }}>
      <Typography
        variant="h5"
        component="h1"
        align="center"
        sx={{ mb: 2, fontWeight: 'bold' }}
      >
        入力内容の確認
      </Typography>
      <Paper elevation={2} sx={{ p: 3, borderRadius: '8px' }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              メールアドレス
            </Typography>
            <Typography variant="body1">{userData.email}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              パスワード
            </Typography>
            <Typography variant="body1">********</Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Stack direction="row" spacing={2}>
              <Button
                onClick={handleBack}
                fullWidth
                variant="outlined"
                sx={{
                  py: 1.5,
                  color: '#c34646',
                  borderColor: '#c34646',
                  '&:hover': {
                    borderColor: '#a93939',
                  },
                }}
                disabled={loading}
              >
                戻る
              </Button>
              <Button
                onClick={handleConfirm}
                fullWidth
                variant="contained"
                sx={{
                  py: 1.5,
                  bgcolor: '#c34646',
                  '&:hover': {
                    bgcolor: '#a93939',
                  },
                }}
                disabled={loading}
              >
                {loading ? '処理中...' : '会員登録を完了する'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
