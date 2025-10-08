'use client';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { Box, Link } from '@mui/material';

/**
 * 新機能ページ遷移用のコンポーネント
 *
 * 開発中の新機能へのナビゲーションを提供するページ。
 *
 */
export default function NewFeaturePage() {
  return (
    <Box
      width={'100vw'}
      height={'100%'}
      display={'flex'}
      justifyContent={'center'}
      alignItems={'center'}
    >
      {/* ここに新機能のリンクボタンを追加していく */}
      {/* 出荷管理ページ */}
      <PrimaryButtonWithIcon>
        <Link sx={{ color: 'white' }} href="/auth/store-shipment">
          出荷管理
        </Link>
      </PrimaryButtonWithIcon>
    </Box>
  );
}
