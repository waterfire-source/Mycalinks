'use client';

import { MYCALINKS_PATH } from '@/app/mycalinks/(core)/constants/paths';
import { Button, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function ThanksPage() {
  const router = useRouter();
  return (
    <Stack
      sx={{
        width: '100%',
        minHeight: '100%',
      }}
      justifyContent="center"
      alignItems="center"
      spacing={2}
    >
      <p style={{ fontSize: '3rem', color: 'rgba(184,42,42,1)' }}>買取完了</p>
      <p style={{ fontSize: '2rem', color: '#888' }}>Thank You !!</p>
      <Button
        variant="contained"
        sx={{
          px: 6,
          py: 1.5,
          fontSize: '16px',
          fontWeight: 'bold',
          borderRadius: 3,
          minWidth: '200px',
        }}
        onClick={() => router.push(MYCALINKS_PATH.ASSESSMENT.root)}
      >
        査定一覧に戻る
      </Button>
    </Stack>
  );
}
