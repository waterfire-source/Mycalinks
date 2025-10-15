'use client';

import PrimaryButton from '@/components/buttons/PrimaryButton';
import {
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { useActivateStore } from '@/feature/store/hooks/useActivateStore';
import { LocalStorageManager } from '@/utils/localStorage';
import { useAlert } from '@/contexts/AlertContext';
import { CustomError } from '@/api/implement';
export default function StoreSignupPage() {
  const { push } = useRouter();
  const { setAlertState } = useAlert();

  const [storeCode, setStoreCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { activateStore } = useActivateStore();

  const handleActivateStore = async () => {
    if (password !== confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }
    try {
      const res = await activateStore({
        code: storeCode,
        password: password,
      });
      const storeLocalStorageManager = new LocalStorageManager('store');
      storeLocalStorageManager.setItem({ storeId: res?.store?.id });
      push(PATH.SETUP.store.info);
    } catch (error) {
      if (error instanceof CustomError) {
        console.error(error);
        setAlertState({
          message: `${error.status}:${error.message}`,
          severity: 'error',
        });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Stack alignItems="center" justifyContent="start" height="100%" gap={3}>
      <Typography variant="h1">店舗アカウント初期設定</Typography>
      <Stack width="300px" gap={3}>
        <Stack gap={0.5}>
          <Typography variant="body1">店舗IDを入力してください</Typography>
          <Typography variant="caption">
            店舗IDは法人アカウントのメールアドレス宛に送信されています。
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="email"
            value={storeCode}
            onChange={(e) => setStoreCode(e.target.value)}
          />
        </Stack>
        <Stack gap={1}>
          <Typography variant="body1">
            店舗パスワードを設定してください
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
            店舗パスワードを入力してください(確認用)
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
      <PrimaryButton onClick={handleActivateStore} sx={{ width: '350px' }}>
        パスワードを設定して店舗情報設定へ進む
      </PrimaryButton>
    </Stack>
  );
}
