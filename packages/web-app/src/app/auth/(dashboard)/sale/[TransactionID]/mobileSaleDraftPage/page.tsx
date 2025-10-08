'use client';

import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { Box, Card, Stack, Typography } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';

const MobileSaleDraftPage = () => {
  const router = useRouter();
  const params = useParams();
  const transactionId = Number(params.TransactionID);

  return (
    <Box sx={{ height: '100%', width: '100%', padding: 4 }}>
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100%',
          width: '100%',
        }}
      >
        {/* Header */}
        <Typography
          variant="h6"
          sx={{
            backgroundColor: 'primary.main',
            color: 'text.secondary',
            textAlign: 'center',
            width: '100%',
            padding: '10px 0',
            borderRadius: '4px 4px 0 0',
          }}
        >
          受付番号
        </Typography>

        <Stack
          sx={{
            height: '80%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          gap={4}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 'bold',
            }}
          >
            {transactionId}
          </Typography>

          {/* Buttons */}
          <Stack spacing={2}>
            <PrimaryButton
              variant="contained"
              color="error"
              onClick={() => router.push('/auth/sale')}
            >
              TOPへ
            </PrimaryButton>
            <SecondaryButton
              variant="contained"
              color="inherit"
              onClick={() =>
                router.push(`/auth/sale?transactionID=${transactionId}`)
              }
            >
              商品を追加・削除
            </SecondaryButton>
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
};

export default MobileSaleDraftPage;
