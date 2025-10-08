'use client';

import PrimaryButton from '@/components/buttons/PrimaryButton';
import {
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/contexts/AlertContext';
import { signIn } from 'next-auth/react';
import { PATH } from '@/constants/paths';
import { PosRunMode } from '@/types/next-auth';

export default function CorporationLoginPage() {
  const { push } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setAlertState } = useAlert();
  const [isLoading, setIsLoading] = useState(false);

  // URLパラメータからemailを取得して自動入力
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setAlertState({
        message: 'パスワードが一致しません',
        severity: 'error',
      });
      return;
    }
    try {
      setIsLoading(true);
      // 法人アカウントとしてログインAPIを叩くと、パスワードが設定されていない場合はパスワードが設定される
      // この際すでに法人メールアドレスは登録されている
      await signIn('credentials', {
        email,
        password,
        mode: PosRunMode.admin,
        redirect: false,
      });
      // }
      push(PATH.SETUP.corporation.info);
    } catch (error) {
      setAlertState({
        message: 'ログインに失敗しました',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Stack alignItems="center" justifyContent="start" height="100%" gap={3}>
      <Typography variant="h1">法人アカウント初期設定</Typography>
      <Stack width="80%" gap={3}>
        <Stack gap={1}>
          <Typography variant="body1">
            登録した法人メールアドレスを入力してください
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Stack>
        <Stack gap={1}>
          <Typography variant="body1">
            法人パスワードを設定してください
          </Typography>
          <TextField
            fullWidth
            size="small"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
        <Stack gap={1}>
          <Typography variant="body1">
            法人パスワードを入力してください(確認)
          </Typography>
          <TextField
            fullWidth
            size="small"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Stack>
      <PrimaryButton
        loading={isLoading}
        onClick={handleSignup}
        sx={{ width: '80%' }}
      >
        新規作成
      </PrimaryButton>
    </Stack>
  );
}
