'use client';

import PrimaryButton from '@/components/buttons/PrimaryButton';
import { Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { useCreateOriginalGenres } from '@/feature/genre/hooks/useCreateOriginalGenres';
import { useAlert } from '@/contexts/AlertContext';
export default function OriginalGenrePage() {
  // 選択されたジャンルを管理するstate
  const [genreName, setGenreName] = useState<string[]>(['']);
  const { push } = useRouter();
  const { setAlertState } = useAlert();
  const handleAddGenre = () => {
    setGenreName([...genreName, '']);
  };
  const { createOriginalGenres } = useCreateOriginalGenres();
  const [isLoading, setIsLoading] = useState(false);
  const toComplete = async () => {
    // 空文字の場合作成しない
    const genreNames = genreName.filter((name) => name !== '');
    try {
      setIsLoading(true);
      await createOriginalGenres(genreNames);
      setAlertState({
        message: 'ジャンルを作成しました',
        severity: 'success',
      });
      push(PATH.SETUP.store.complete);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack
      alignItems="center"
      justifyContent="start"
      height="100%"
      mx={3}
      gap={3}
    >
      <Stack gap={1} alignItems="center">
        <Typography variant="h1">独自ジャンル設定</Typography>
        <Typography variant="body2">
          Mycalinks未登録のタイトルなどを追加してください。
          <br />
          デフォルトでジャンル「サプライ」「その他」は作成されます。
        </Typography>
      </Stack>
      <Stack gap={2}>
        {genreName.map((name, index) => (
          <Stack key={index} gap={1}>
            <Typography variant="body1">独自ジャンル{index + 1}</Typography>
            <Stack direction="row" alignItems="center" gap={1}>
              <TextField
                value={name}
                size="small"
                onChange={(e) => {
                  const newGenreName = [...genreName];
                  newGenreName[index] = e.target.value;
                  setGenreName(newGenreName);
                }}
              />
              <SecondaryButton
                sx={{ minWidth: '50px' }}
                onClick={() => {
                  const newGenreName = genreName.filter((_, i) => i !== index);
                  setGenreName(newGenreName);
                }}
              >
                削除
              </SecondaryButton>
            </Stack>
          </Stack>
        ))}
      </Stack>
      <Stack gap={2}>
        <SecondaryButton sx={{ width: '250px' }} onClick={handleAddGenre}>
          独自ジャンルを追加
        </SecondaryButton>
        <PrimaryButton
          sx={{ width: '250px' }}
          onClick={toComplete}
          loading={isLoading}
        >
          店舗アカウントの設定を完了する
        </PrimaryButton>
      </Stack>
    </Stack>
  );
}
