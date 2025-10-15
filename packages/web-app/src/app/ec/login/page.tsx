'use client';

import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Link as MuiLink,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomError } from '@/api/implement';
import { validateUserInfo } from '@/app/ec/(core)/utils/validateUserInfo';
import { useAppAuth } from '@/providers/useAppAuth';
import { PATH } from '@/app/ec/(core)/constants/paths';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signIn, getAccountInfo } = useAppAuth();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { appUserId } = await signIn({
        email,
        password,
      });

      if (!appUserId) {
        setError('メールアドレスまたはパスワードが正しくありません。');
        setLoading(false);
        return;
      }
      const userResult = await getAccountInfo();
      if (userResult instanceof CustomError) {
        setError('ユーザー情報の取得に失敗しました。');
        setLoading(false);
        return;
      }
      const validation = validateUserInfo(userResult);

      setLoading(false);

      if (validation.isValid) {
        // 必須情報が揃っている場合は注文ページへ
        router.push('/ec/order');
      } else {
        // 必須情報が不足している場合は会員情報編集ページへ
        router.push('/ec/account/edit');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('ログイン中にエラーが発生しました。');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* ログインフォーム */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: '100%',
            bgcolor: 'white',
            px: 3,
            py: 2,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            size="small"
            placeholder="メールアドレス"
            onChange={(e) => setEmail(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              sx: {
                '&::placeholder': {
                  color: 'grey.500',
                },
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            size="small"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              endAdornment: (
                <IconButton onClick={togglePasswordVisibility} size="small">
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              ),
            }}
            inputProps={{
              sx: {
                '&::placeholder': {
                  color: 'grey.500',
                },
              },
            }}
          />
          <Box sx={{ textAlign: 'right' }}>
            <MuiLink
              href={PATH.FORGET_PASSWORD.root}
              variant="body2"
              color="error"
              underline="hover"
            >
              パスワードをお忘れの方はこちら
            </MuiLink>
          </Box>
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 2,
              bgcolor: '#D32F2F',
              '&:hover': {
                bgcolor: '#B71C1C',
              },
            }}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </Box>

        <Box
          sx={{
            width: '100%',
            bgcolor: 'white',
            mt: 2,
            px: 3,
            py: 2,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography
            variant="body2"
            gutterBottom
            sx={{ textAlign: 'center', mb: 1 }}
          >
            会員登録がまだの方はこちら！
          </Typography>
          <Button
            component={Link}
            href="/ec/account/signup"
            variant="contained"
            fullWidth
            sx={{
              bgcolor: '#D32F2F',
              '&:hover': {
                bgcolor: '#B71C1C',
              },
            }}
          >
            新規会員登録
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
