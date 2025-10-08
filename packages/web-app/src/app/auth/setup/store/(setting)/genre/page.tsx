'use client';

import { MycaGenreList } from '@/app/auth/setup/store/(setting)/genre/MycaGenreList';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { useCreateMycaGenreAndImportItems } from '@/feature/item/hooks/useCreateMycaGenreAndImportItems';
import { ItemCategoryHandle } from '@prisma/client';

// 選択オプションの型定義
export type SelectionOption = 'all' | ItemCategoryHandle;
export default function GenrePage() {
  // 選択されたジャンルを管理するstate
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  // 各ジャンルの選択オプションを管理
  const [genreSelections, setGenreSelections] = useState<
    Map<number, SelectionOption>
  >(new Map());
  const { push } = useRouter();
  const { createMultipleMycaGenresAndImportItems, isLoading } =
    useCreateMycaGenreAndImportItems();
  const handleAddGenre = async () => {
    if (selectedGenreIds.length === 0) {
      return;
    }

    // ジャンルデータを準備
    const genreData = selectedGenreIds.map((genreId) => {
      const targetCategoryHandles: ItemCategoryHandle[] | undefined =
        genreSelections.get(genreId) === 'all'
          ? undefined
          : [genreSelections.get(genreId) as ItemCategoryHandle];
      return {
        mycaGenreID: genreId,
        targetCategoryHandles,
      };
    });

    // 一括登録を実行
    const result = await createMultipleMycaGenresAndImportItems(genreData);

    // 成功した場合のみ次のページに進む
    if (result.ok) {
      push(PATH.SETUP.store.originalGenre);
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
        <Typography variant="h1">取り扱いジャンル設定</Typography>
        <Typography variant="body2">
          ジャンルを選択すると、インポートする商品の種類を選択できます
          <br />
          （すべての商品、すべてのカード、すべてのBOX）
          <br />
          下記の一覧にないジャンルは独自ジャンルとして追加してください
        </Typography>
      </Stack>
      <MycaGenreList
        width="80%"
        selectedGenreIds={selectedGenreIds}
        setSelectedGenreIds={setSelectedGenreIds}
        genreSelections={genreSelections}
        setGenreSelections={setGenreSelections}
      />
      <PrimaryButton
        onClick={handleAddGenre}
        loading={isLoading}
        disabled={selectedGenreIds.length === 0}
      >
        独自ジャンルの追加に進む
      </PrimaryButton>
    </Stack>
  );
}
