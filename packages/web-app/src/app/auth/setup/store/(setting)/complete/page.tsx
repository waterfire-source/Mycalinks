'use client';

import { CancelButton } from '@/components/buttons/CancelButton';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';

export default function StoreSetupCompletePage() {
  const { push } = useRouter();

  return (
    <Stack alignItems="center" justifyContent="start" height="100%" gap={3}>
      <Typography variant="h1">店舗アカウント作成完了</Typography>
      <Stack width="80%" gap={3} alignItems="center">
        <Typography variant="body1" textAlign="center">
          店舗アカウント作成が完了しました。
          <br />
          お疲れ様でした。
        </Typography>
        <PrimaryButton
          sx={{ width: '300px' }}
          onClick={() => push(PATH.DASHBOARD)}
        >
          店舗アカウントでPOSにログイン
        </PrimaryButton>
        <CancelButton
          sx={{ width: '300px' }}
          onClick={() => push(PATH.SETUP.store.root)}
        >
          ログインページに戻る
        </CancelButton>
      </Stack>
    </Stack>
  );
}
