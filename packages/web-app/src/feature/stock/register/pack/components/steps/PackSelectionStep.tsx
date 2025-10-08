'use client';

import { Box, Grid } from '@mui/material';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import PackTable from '@/feature/stock/register/pack/components/PackTable';
import { PackOpenSetting } from '@/feature/stock/register/pack/components/PackOpenSetting';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { PATH } from '@/constants/paths';
import { useRouter } from 'next/navigation';
import {
  BaseStepProps,
  RegisterParams,
} from '@/feature/stock/register/pack/types';
import { PackType } from '@/feature/stock/register/pack/components/PackTable';

interface PackSelectionStepProps extends BaseStepProps {
  selectedPack: PackType | undefined;
  setSelectedPack: (pack: PackType | undefined) => void;
  registerParams: RegisterParams;
  setRegisterParams: (params: RegisterParams) => void;
  isDirty: boolean;
}

/**
 * パック選択ステップのコンポーネント
 */
export const PackSelectionStep: React.FC<PackSelectionStepProps> = ({
  storeId,
  selectedPack,
  setSelectedPack,
  registerParams,
  setRegisterParams,
  storageProducts,
  handleNextProgress,
  isDirty,
}) => {
  const router = useRouter();

  return (
    <ContainerLayout
      title="開封する商品を検索"
      helpArchivesNumber={708}
      actions={
        <Box sx={{ width: '90%', display: 'flex', justifyContent: 'flex-end' }}>
          <SecondaryButton
            onClick={() => {
              router.push(`${PATH.STOCK.openPackHistory.root}`);
            }}
          >
            パック開封履歴
          </SecondaryButton>
        </Box>
      }
    >
      <Grid container spacing={3} sx={{ height: 'calc(100% - 16px)' }}>
        <Grid item md={7} lg={8} sx={{ height: '100%' }}>
          <Box sx={{ height: '100%' }}>
            <PackTable
              width="100%"
              height="100%"
              storeID={storeId}
              onSelectPack={(selectedPack) => setSelectedPack(selectedPack)}
            />
          </Box>
        </Grid>
        <Grid
          item
          md={5}
          lg={4}
          sx={{
            height: 'calc(100% - 56px - 20px)',
            marginTop: 'calc(56px + 20px)',
          }}
        >
          <PackOpenSetting
            tableHeight="100%"
            selectedPack={selectedPack}
            registerParams={registerParams}
            storageProducts={storageProducts || []}
            onSetRegisterParams={setRegisterParams}
            onNextProgress={handleNextProgress}
            storeID={storeId}
            isDirty={isDirty}
          />
        </Grid>
      </Grid>
    </ContainerLayout>
  );
};
