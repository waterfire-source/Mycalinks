'use client';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { PATH } from '@/constants/paths';
import { Typography, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function Error401() {
  const router = useRouter();
  return (
    <Box
      sx={{
        p: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
        justifyContent: 'center',
      }}
    >
      <ErrorOutlineIcon
        color="error"
        sx={{
          fontSize: 60,
          mb: 2,
        }}
      />
      <Typography variant="h4" component="h1" color="error" sx={{ mb: 2 }}>
        アクセス権限がありません
      </Typography>
      <Typography
        variant="body1"
        color="primary.main"
        align="center"
        sx={{ mb: 3 }}
      >
        このページにアクセスする権限がありません。
        <br />
        ホームページに戻ってください。
      </Typography>
      <SecondaryButton
        onClick={() => router.push(PATH.DASHBOARD)}
        sx={{ minWidth: 200 }}
      >
        ホームへ戻る
      </SecondaryButton>
    </Box>
  );
}
