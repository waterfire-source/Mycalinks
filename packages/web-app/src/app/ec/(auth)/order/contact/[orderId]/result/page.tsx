'use client';

import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { PATH } from '@/app/ec/(core)/constants/paths';

export default function ContactResultPage() {
  const router = useRouter();

  const handleBackToTop = () => {
    router.push(PATH.TOP);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 1 }}>
      <Typography
        variant="h5"
        component="h1"
        align="center"
        sx={{ mb: 2, fontWeight: 'bold' }}
      >
        お問合せありがとうございました
      </Typography>
      <Paper elevation={2} sx={{ p: 3, borderRadius: '8px' }}>
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1">
              ご入力いただいた内容を確認のうえ、該当のショップよりご連絡させていただきます。
            </Typography>
            <Typography variant="body1">
              ショップからの返信はご登録のメールアドレスへのメール、またはMycalinksMall内、メッセージセンターよりご確認いただけます。
            </Typography>
            <Typography variant="body1">
              ご連絡まで今しばらくお待ちください。
            </Typography>
          </Box>

          <Box
            sx={{
              mt: 2,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={handleBackToTop}
              sx={{
                textTransform: 'none',
              }}
            >
              Mycalinks Mall トップページへ戻る
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
