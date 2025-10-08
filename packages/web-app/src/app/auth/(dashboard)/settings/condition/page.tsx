'use client';

import { ConditionSection } from '@/app/auth/(dashboard)/settings/condition/components/ConditionSection';
import { EditConditionOptionsModal } from '@/app/auth/(dashboard)/settings/condition/components/EditConditionOptionsModal';
import { ShowConditionOptionsTable } from '@/app/auth/(dashboard)/settings/condition/components/showConditionOptionsTable';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { Stack } from '@mui/material';
import { useEffect, useState } from 'react';

export interface CardConditionOption {
  id: number;
  displayName: string;
  orderNumber: number;
  rateVariants: {
    autoSellPriceAdjustment: string;
    autoBuyPriceAdjustment: string;
    groupId?: number;
    genreId?: number;
  }[];
}

const ConditionSetting = () => {
  const [isOpenEditConditionModal, setIsOpenEditConditionModal] =
    useState(false);
  const { category, fetchCategoryList } = useCategory();
  const cardCategory = category?.itemCategories.find(
    (category) => category.handle === 'CARD',
  );

  const [cardConditionOptions, setCardConditionOptions] = useState<
    CardConditionOption[]
  >([]);

  const fetchData = async () => {
    await fetchCategoryList();
  };

  // カードの状態設定を取得
  useEffect(() => {
    fetchData();
  }, []);

  // カードのもののみ抽出
  useEffect(() => {
    if (!category) return;
    setCardConditionOptions(
      cardCategory?.condition_options.map((option) => ({
        id: option.id,
        displayName: option.display_name,
        orderNumber: option.order_number,
        rateVariants: option.rate_variants.map((variant) => ({
          autoSellPriceAdjustment: variant.auto_sell_price_adjustment,
          autoBuyPriceAdjustment: variant.auto_buy_price_adjustment,
          groupId: variant.group_id ?? undefined,
          genreId: variant.genre_id ?? undefined,
        })),
      })) ?? [],
    );
  }, [category]);

  const handleCloseModal = () => {
    setIsOpenEditConditionModal(false);
    fetchData();
  };

  return (
    <ContainerLayout title="状態設定" helpArchivesNumber={2409}>
      <Stack direction="column" spacing={2} sx={{ marginTop: 2 }}>
        <ConditionSection title="カードの状態">
          <Stack direction="column">
            <SecondaryButtonWithIcon
              sx={{
                width: '20%',
                minWidth: '150px',
                marginLeft: '1rem',
              }}
              onClick={() => setIsOpenEditConditionModal(true)}
            >
              状態を追加・編集
            </SecondaryButtonWithIcon>
            {cardCategory?.id && (
              <ShowConditionOptionsTable
                conditionOptions={cardConditionOptions}
                cardCategoryId={cardCategory?.id}
              />
            )}
          </Stack>
        </ConditionSection>
      </Stack>
      {cardCategory && (
        <EditConditionOptionsModal
          isOpen={isOpenEditConditionModal}
          onClose={handleCloseModal}
          conditionOptions={cardConditionOptions}
          itemCategoryId={cardCategory.id}
        />
      )}
    </ContainerLayout>
  );
};

export default ConditionSetting;
