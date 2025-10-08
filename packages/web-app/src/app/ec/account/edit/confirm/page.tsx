'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { UserInfo } from '@/app/ec/(core)/utils/validateUserInfo';
import { useAppAuth } from '@/providers/useAppAuth';
import { PATH } from '@/app/ec/(core)/constants/paths';

export default function SignupConfirmPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const { updateUserInfo } = useAppAuth();

  useEffect(() => {
    const storedUserData = sessionStorage.getItem('userData');

    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData) as UserInfo;
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
      const requestBody = {
        displayName: userData.displayName,
        birthday: userData.birthday,
        fullName: userData.fullName,
        fullNameRuby: userData.fullNameRuby,
        phoneNumber: userData.phoneNumber,
        address2: userData.address2,
        city: userData.city,
        prefecture: userData.prefecture,
        building: userData.building,
        zipCode: userData.zipCode,
        mail: userData.mail,
      };
      const result = await updateUserInfo(requestBody);

      if (result && 'ok' in result) {
        sessionStorage.removeItem('userData');
        router.push(PATH.ORDER.root);
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
        <CircularProgress />
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
              表示名
            </Typography>
            <Typography variant="body1">{userData.displayName}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              お名前
            </Typography>
            <Typography variant="body1">{userData.fullName}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              フリガナ
            </Typography>
            <Typography variant="body1">{userData.fullNameRuby}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              生年月日
            </Typography>
            <Typography variant="body1">{userData.birthday}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              電話番号
            </Typography>
            <Typography variant="body1">{userData.phoneNumber}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              メールアドレス
            </Typography>
            <Typography variant="body1">{userData.mail}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              郵便番号
            </Typography>
            <Typography variant="body1">{userData.zipCode}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              都道府県
            </Typography>
            <Typography variant="body1">{userData.prefecture}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              市区町村
            </Typography>
            <Typography variant="body1">{userData.city}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              以降の住所
            </Typography>
            <Typography variant="body1">{userData.address2}</Typography>
          </Box>

          {userData.building && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                建物名など
              </Typography>
              <Typography variant="body1">{userData.building}</Typography>
            </Box>
          )}

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
                {loading ? '処理中...' : '会員情報を編集する'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
