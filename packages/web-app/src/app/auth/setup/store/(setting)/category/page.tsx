'use client';

import PrimaryButton from '@/components/buttons/PrimaryButton';
import { Skeleton, Stack, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { useAlert } from '@/contexts/AlertContext';
import { useState, useEffect } from 'react';
import { useCreateCategory } from '@/feature/category/hooks/useCreateCategory';
import { PATH } from '@/constants/paths';
import { useCategory } from '@/feature/category/hooks/useCategory';
export default function CategoryPage() {
  const { push } = useRouter();
  const { setAlertState } = useAlert();
  const [originalCategories, setOriginalCategories] = useState<string[]>([]);
  const {
    category,
    fetchCategoryList,
    isFetching: isCategoryFetchLoading,
  } = useCategory();
  const { createCategory } = useCreateCategory();
  const [isLoading, setIsLoading] = useState(false);
  // 独自カテゴリを追加
  const addOriginalCategory = () => {
    setOriginalCategories([...originalCategories, '']);
  };
  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);
  // 店舗アカウントの設定を完了する
  const toConditionSetting = async () => {
    // 独自カテゴリがない場合は作成をせずに条件設定画面に遷移
    if (originalCategories.length === 0) {
      push(PATH.SETUP.store.condition);
      return;
    }
    // 独自カテゴリーの名前が空文字の時はエラーを表示
    if (originalCategories.some((category) => category === '')) {
      setAlertState({
        message: '独自カテゴリーの名前が設定されていません',
        severity: 'error',
      });
      return;
    }
    // 同じ名前が作成される場合はエラーを表示
    if (
      originalCategories.some(
        (category) =>
          originalCategories.filter((c) => c === category).length > 1,
      )
    ) {
      setAlertState({
        message: '同じ名前の独自カテゴリーが作成されています',
        severity: 'error',
      });
      return;
    }
    try {
      setIsLoading(true);
      await Promise.all(
        originalCategories.map(
          async (category) => await createCategory(category),
        ),
      );
      push(PATH.SETUP.store.condition);
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
      gap={3}
      alignSelf="center"
      width="70%"
    >
      <Stack gap={1} alignItems="center">
        <Typography variant="h1">カテゴリ追加</Typography>
        <Typography variant="body2" textAlign="center">
          デフォルトカテゴリは削除できません(表示名は後から編集できます)
          <br />
          デフォルトでカテゴリ「その他」は作成されます。
        </Typography>
      </Stack>
      <Stack
        gap={2}
        p={2}
        borderRadius={1}
        direction="row"
        flexWrap="wrap"
        sx={{
          position: 'relative',
          border: '1px solid #000',
          minWidth: '300px',
          minHeight: '30px',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            position: 'absolute',
            top: '-12px',
            left: '16px',
            backgroundColor: 'white',
            px: 1,
          }}
        >
          デフォルトカテゴリ
        </Typography>
        {isCategoryFetchLoading ? (
          <Skeleton variant="text" width="100%" height="30px" />
        ) : (
          category?.itemCategories.map((category, index) => (
            <Typography key={index} variant="body1">
              {category.display_name}
            </Typography>
          ))
        )}
      </Stack>
      <Stack gap={2} width="250px" alignItems="center" justifyContent="center">
        {originalCategories.map((category, index) => (
          <Stack key={index} gap="4px" width="100%">
            <Typography variant="body1">独自カテゴリ{index + 1}</Typography>
            <Stack direction="row" alignItems="center" gap={1} width="100%">
              <TextField
                size="small"
                value={category}
                sx={{
                  width: '180px',
                }}
                onChange={(e) =>
                  setOriginalCategories(
                    originalCategories.map((c, i) =>
                      i === index ? e.target.value : c,
                    ),
                  )
                }
              />
              <SecondaryButton
                sx={{ minWidth: '50px' }}
                onClick={() => {
                  const newCategories = originalCategories.filter(
                    (_, i) => i !== index,
                  );
                  setOriginalCategories(newCategories);
                }}
              >
                削除
              </SecondaryButton>
            </Stack>
          </Stack>
        ))}
      </Stack>
      <Stack gap={2}>
        <SecondaryButton sx={{ width: '250px' }} onClick={addOriginalCategory}>
          独自カテゴリを追加
        </SecondaryButton>
        <PrimaryButton
          sx={{ width: '250px' }}
          onClick={toConditionSetting}
          loading={isLoading}
        >
          状態設定に進む
        </PrimaryButton>
      </Stack>
    </Stack>
  );
}
