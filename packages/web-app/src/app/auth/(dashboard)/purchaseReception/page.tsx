'use client';

import React from 'react';

import { PurchaseReceptionContainer } from '@/app/auth/(dashboard)/purchaseReception/components/PurchaseReceptionContainer';
import { MobilePurchaseReceptionPage } from '@/app/auth/(dashboard)/purchaseReception/components/MobilePurchaseReceptionPage';
import { Box, Stack, useMediaQuery } from '@mui/material';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { PurchaseHeaderButtons } from '@/app/auth/(dashboard)/purchaseReception/components/PurchaseHeaderButtons';
import theme from '@/theme';
import { PurchaseSettingButton } from '@/feature/purchaseReception/components/purchaseTerm/PurchaseSettingButton';

const PurchaseReceptionPage: React.FC = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box width={'100vw'} height={'100%'}>
      {isMobile ? (
        <MobilePurchaseReceptionPage />
      ) : (
        <ContainerLayout
          title="買取受付一覧"
          helpArchivesNumber={561}
          actions={
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              width="100%"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PurchaseSettingButton />
              </Box>
              <Stack flexDirection="row" gap={1}>
                <PurchaseHeaderButtons />
              </Stack>
            </Stack>
          }
        >
          <PurchaseReceptionContainer />
        </ContainerLayout>
      )}
    </Box>
  );
};

export default PurchaseReceptionPage;
