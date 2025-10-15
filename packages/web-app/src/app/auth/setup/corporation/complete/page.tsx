'use client';

import { CancelButton } from '@/components/buttons/CancelButton';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';

export default function CompletePage() {
  const { push } = useRouter();
  return (
    <Stack alignItems="center" justifyContent="start" height="100%" gap={3}>
      <Typography variant="h1">法人アカウント作成完了</Typography>
      <Stack width="80%" gap={3} alignItems="center">
        <Typography variant="body1" textAlign="center">
          法人アカウント作成が完了しました。
          <br />
          お疲れ様でした。
        </Typography>
        <PrimaryButton
          sx={{ width: '290px' }}
          onClick={() => push(PATH.SETUP.store.root)}
        >
          続けて店舗アカウントの作成に進む
        </PrimaryButton>
        <SecondaryButton
          sx={{ width: '290px' }}
          onClick={() => push(PATH.DASHBOARD)}
        >
          ダッシュボードへ移動
        </SecondaryButton>
        <CancelButton
          sx={{ width: '290px' }}
          onClick={() => push(PATH.CORPORATION_LOGIN)}
        >
          ログインページに戻る
        </CancelButton>
      </Stack>
    </Stack>
  );
}
