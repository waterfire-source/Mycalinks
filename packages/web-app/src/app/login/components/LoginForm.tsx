import { Suspense, useState } from 'react';
import {
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { LoginInfo } from '@/app/login/page';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useSearchParams } from 'next/navigation';

interface Props {
  loginInfo: LoginInfo;
  setLoginInfo: (loginInfo: LoginInfo) => void;
  launch: () => void;
}
export const LoginForm = ({ loginInfo, setLoginInfo, launch }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Stack
      width={isMobile ? '100%' : 560}
      gap={isMobile ? '16px' : '24px'}
      aria-labelledby="login_heading"
    >
      <Suspense>
        <LoginError />
      </Suspense>
      <TextField
        label="メールアドレス"
        value={loginInfo.email}
        InputLabelProps={{
          sx: {
            color: 'grey.600',
          },
        }}
        onChange={(e) => setLoginInfo({ ...loginInfo, email: e.target.value })}
        fullWidth
      />
      <TextField
        label="パスワード"
        type={showPassword ? 'text' : 'password'}
        InputLabelProps={{
          sx: {
            color: 'grey.600',
          },
        }}
        value={loginInfo.password}
        onChange={(e) =>
          setLoginInfo({ ...loginInfo, password: e.target.value })
        }
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        fullWidth
      />
      <PrimaryButton onClick={() => launch()} fullWidth>
        次へ
      </PrimaryButton>
    </Stack>
  );
};

function LoginError() {
  const searchParams = useSearchParams();
  const errored = searchParams.get('error') == 'CredentialsSignin';

  return (
    <>
      {errored && (
        <Typography
          sx={{
            textAlign: 'center',
            color: 'error.light',
            fontSize: 13,
          }}
        >
          メールアドレスかパスワードが間違っている可能性があります。
        </Typography>
      )}
    </>
  );
}
