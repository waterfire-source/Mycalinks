import React, { useState, useMemo } from 'react';
import { CustomTab, TabDef } from '@/components/tabs/CustomTab';
import { Box } from '@mui/material';
import { OriginalPackProduct } from '@/app/auth/(dashboard)/original-pack/page';
import { OriginalPackProductCardListHeader } from '@/feature/originalPack/disassembly/components/OriginalPackProductCardListHeader';
import { OriginalPackProductCardListContent } from '@/feature/originalPack/disassembly/components/OriginalPackProductCardListContent';
import { OriginalPackProductCardListFooter } from '@/feature/originalPack/disassembly/components/OriginalPackProductCardListFooter';

interface OriginalPackProductCardListProps {
  storeId: number;
  originalPackProducts: OriginalPackProduct[];
  updateQuantity: (id: number, processId: string, newQuantity: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const OriginalPackProductCardList: React.FC<
  OriginalPackProductCardListProps
> = ({
  storeId,
  originalPackProducts,
  updateQuantity,
  onConfirm: handleConfirm,
  onCancel: handleCancel,
}) => {
  // TODO: 子機との連携
  const singleTab: TabDef[] = [
    { key: 'all', value: 'すべて' },
    // { key: 'dev', value: '※開発中' },
  ];

  // フィルタリング条件
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >(undefined);
  const [selectedConditionOptionId, setSelectedConditionOptionId] = useState<
    number | undefined
  >(undefined);
  const [rarityInput, setRarityInput] = useState<string>('');

  const filteredProducts = useMemo(() => {
    return originalPackProducts.filter((product) => {
      const categoryMatch =
        selectedCategoryId === undefined ||
        product.item_category_id === selectedCategoryId;
      const conditionMatch =
        selectedConditionOptionId === undefined ||
        product.condition_option_id === selectedConditionOptionId;
      const rarityMatch =
        rarityInput === '' ||
        (product.item_rarity ?? '')
          .toLowerCase()
          .includes(rarityInput.toLowerCase());
      return categoryMatch && conditionMatch && rarityMatch;
    });
  }, [
    originalPackProducts,
    selectedCategoryId,
    selectedConditionOptionId,
    rarityInput,
  ]);

  return (
    <Box sx={{ height: '100%' }}>
      <CustomTab
        tabs={singleTab}
        tabDescription="解体で出た商品数を登録してください"
        header={
          <OriginalPackProductCardListHeader
            storeId={storeId}
            selectedCategoryId={selectedCategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
            selectedConditionOptionId={selectedConditionOptionId}
            setSelectedConditionOptionId={setSelectedConditionOptionId}
            rarityInput={rarityInput}
            setRarityInput={setRarityInput}
          />
        }
        content={
          <OriginalPackProductCardListContent
            originalPackProducts={filteredProducts}
            updateQuantity={updateQuantity}
          />
        }
        footer={
          <OriginalPackProductCardListFooter
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        }
        onTabChange={() => {
          // TODO: タブ切り替え時の処理
          console.log('Tab changed (mock)');
        }}
      />
    </Box>
  );
};
