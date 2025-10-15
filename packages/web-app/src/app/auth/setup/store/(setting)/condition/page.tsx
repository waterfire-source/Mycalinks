'use client';

import PrimaryButton from '@/components/buttons/PrimaryButton';
import { Stack, Typography } from '@mui/material';
import { useAlert } from '@/contexts/AlertContext';
import { ConditionSetting } from '@/app/auth/setup/store/(setting)/condition/components/ConditionSetting';
import { useConditionsSetup } from '@/app/auth/setup/store/(setting)/condition/hooks/useConditionsSetup';
import { useConditionOption } from '@/feature/conditionOption/hooks/useConditionOption';
import { useState, useEffect } from 'react';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';

export default function ConditionPage() {
  const { push } = useRouter();
  const { setAlertState } = useAlert();
  const { conditions, setConditions } = useConditionsSetup();
  const { createConditionOption, updateConditionOption } = useConditionOption();
  const { fetchCategoryList, cardConditionOptions } = useCategory();
  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);
  useEffect(() => {
    if (cardConditionOptions) {
      setConditions(
        cardConditionOptions.map((option) => ({
          id: option.id,
          name: option.display_name,
          sellPercent: Number(
            // %という文字列を取り除く
            option.rate_variants[0].auto_sell_price_adjustment.replace('%', ''),
          ),
          buyPercent: Number(
            option.rate_variants[0].auto_buy_price_adjustment.replace('%', ''),
          ),
        })),
      );
    }
  }, [cardConditionOptions]);
  const [isLoading, setIsLoading] = useState(false);
  // 取り扱いジャンルの選択に進む
  const toGenreSelection = async () => {
    try {
      setIsLoading(true);
      conditions.map(async (condition) => {
        if (condition.id) {
          return await updateConditionOption({
            id: condition.id,
            displayName: condition.name,
            rateVariants: [
              {
                autoSellPriceAdjustment: `${condition.sellPercent}%`,
                autoBuyPriceAdjustment: `${condition.buyPercent}%`,
              },
            ],
          });
        }
        return await createConditionOption({
          displayName: condition.name,
          rateVariants: [
            {
              autoSellPriceAdjustment: `${condition.sellPercent}%`,
              autoBuyPriceAdjustment: `${condition.buyPercent}%`,
            },
          ],
        });
      });
      push(PATH.SETUP.store.genre);
    } catch (error) {
      console.error(error);
      setAlertState({
        message: '状態設定に失敗しました',
        severity: 'error',
      });
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
        <Typography variant="h1">状態設定</Typography>
      </Stack>
      <ConditionSetting conditions={conditions} setConditions={setConditions} />
      <Stack gap={2}>
        <PrimaryButton
          sx={{ width: '250px' }}
          onClick={toGenreSelection}
          loading={isLoading}
        >
          取り扱いジャンルの選択に進む
        </PrimaryButton>
      </Stack>
    </Stack>
  );
}
