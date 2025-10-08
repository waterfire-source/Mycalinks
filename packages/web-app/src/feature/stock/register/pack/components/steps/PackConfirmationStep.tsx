'use client';

import { Box, Grid } from '@mui/material';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { PackItemTable } from '@/feature/stock/register/pack/components/PackItemTable';
import { PackItemRegisterSetting } from '@/feature/stock/register/pack/components/PackItemRegisterSetting';
import {
  BaseStepProps,
  RegisterParams,
} from '@/feature/stock/register/pack/types';
import { PackType } from '@/feature/stock/register/pack/components/PackTable';
import { PackItemType } from '@/feature/stock/register/pack/components/PackRegisterTab';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { WholesalePriceHistoryResourceType } from '@prisma/client';
import { usePackConfirmationStep } from '@/feature/stock/register/pack/hooks/usePackConfirmationStep';

interface PackConfirmationStepProps extends BaseStepProps {
  selectedPack: PackType | undefined;
  itemsToRegister: PackItemType[];
  setItemsToRegister: React.Dispatch<React.SetStateAction<PackItemType[]>>;
  selectedStorageProduct: number | string;
  setSelectedStorageProduct: (value: number | string) => void;
  openNumber: number;
  setOpenNumber: (value: number) => void;
  registerParams: RegisterParams;
  isDisabledEditOpenNumber: boolean;
  randomCardsPerPack: number;
  setRandomCardsPerPack: (count: number) => void;
  wholesalePrice: BackendProductAPI[9]['response']['200'] | undefined;
  fetchWholesalePrice: (
    product_id: number,
    itemCount?: number,
    isReturn?: boolean,
    reverse?: true,
    resourceType?: WholesalePriceHistoryResourceType,
    resourceID?: number,
  ) => Promise<BackendProductAPI[9]['response']['200'] | void>;
  restoredConditionOptionId: number | null;
  fixId?: number;
}

/**
 * パック開封確認ステップのコンポーネント
 */
export const PackConfirmationStep: React.FC<PackConfirmationStepProps> = ({
  storeId,
  selectedPack,
  itemsToRegister,
  setItemsToRegister,
  selectedStorageProduct,
  setSelectedStorageProduct,
  storageProducts,
  openNumber,
  setOpenNumber,
  handleBackProgress,
  registerParams,
  isDisabledEditOpenNumber,
  handleResetProgress,
  wholesalePrice,
  fetchWholesalePrice,
  restoredConditionOptionId,
  fixId,
  randomCardsPerPack,
  setRandomCardsPerPack,
}) => {
  // 確認画面専用フック
  const {
    totalUnitWholesalePrice,
    totalUnregisteredCardsQuantity, // 未登録カードの枚数
    amount,
    remainingAmount,
    handleSplitWholesalePrice,
    unregisterProductWholesalePrice,
    totalCards, // カード合計枚数
    totalRegisteredCards, // 登録枚数合計
    unitWholesalePrice, // カード1枚あたりの仕入れ値
  } = usePackConfirmationStep({
    openNumber,
    wholesalePrice,
    itemsToRegister,
    setItemsToRegister,
    randomCardsPerPack,
    isRandomOnly: !registerParams.isFixedPack && registerParams.isRandomPack,
    isFixedOnly: registerParams.isFixedPack && !registerParams.isRandomPack,
  });

  if (!selectedPack) {
    return null;
  }
  return (
    <ContainerLayout title="開封結果確認" helpArchivesNumber={708}>
      <Grid container spacing="24px" sx={{ height: 'calc(100% - 16px)' }}>
        <Grid item md={7} lg={8} sx={{ height: '100%' }}>
          <Box sx={{ width: '100%', minWidth: '600px', height: '100%' }}>
            <PackItemTable
              width="100%"
              height="100%"
              itemsToRegister={itemsToRegister}
              setItemsToRegister={setItemsToRegister}
              randomCardsPerPack={randomCardsPerPack}
              isRestoredFromHistory={!!fixId}
              unregisterProductWholesalePrice={unregisterProductWholesalePrice}
              totalUnitWholesalePrice={totalUnitWholesalePrice}
              amount={amount}
              remainingAmount={remainingAmount}
              handleSplitWholesalePrice={handleSplitWholesalePrice}
              isFixedOnly={
                registerParams.isFixedPack && !registerParams.isRandomPack
              }
            />
          </Box>
        </Grid>
        <Grid
          item
          md={5}
          lg={4}
          sx={{
            height: 'calc(100%)',
          }}
        >
          <PackItemRegisterSetting
            storeID={storeId}
            selectedPack={selectedPack}
            itemsToRegister={itemsToRegister}
            selectedStorageProduct={selectedStorageProduct}
            setSelectedStorageProduct={(value) =>
              setSelectedStorageProduct(value)
            }
            storageProducts={storageProducts || []}
            openNumber={openNumber}
            setOpenNumber={(value) => setOpenNumber(value)}
            onBackProgress={handleBackProgress}
            includeRandomPack={
              (registerParams.isRandomPack ?? false) || !!fixId
            }
            isDisabledEditOpenNumber={isDisabledEditOpenNumber}
            onResetProgress={handleResetProgress}
            setRandomCardsPerPack={setRandomCardsPerPack}
            wholesalePrice={wholesalePrice}
            fetchWholesalePrice={fetchWholesalePrice}
            restoredConditionOptionId={restoredConditionOptionId}
            fixId={fixId || null}
            totalUnregisteredCardsQuantity={totalUnregisteredCardsQuantity}
            setItemsToRegister={setItemsToRegister}
            randomCardsPerPack={randomCardsPerPack}
            totalCards={totalCards}
            totalRegisteredCards={totalRegisteredCards}
            remainingAmount={remainingAmount}
            unitWholesalePrice={unitWholesalePrice}
            amount={amount}
          />
        </Grid>
      </Grid>
    </ContainerLayout>
  );
};
