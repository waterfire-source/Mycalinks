'use client';
import { useState } from 'react';
import { EcSalesStatsTable } from '@/app/auth/(dashboard)/ec/sales-analytics/components/EcSalesStatsTable';

import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { Stack, Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { EcSalesStat } from '@/feature/ec/hooks/useListSalesStats';
import { EcSalesDetailContent } from '@/app/auth/(dashboard)/ec/sales-analytics/components/EcSalesDetailContent';

const ECSalesAnalyticsPage = () => {
  const [selectedStats, setSelectedStats] = useState<EcSalesStat | null>(null);
  const [taxMode, setTaxMode] = useState<'exclusive' | 'inclusive'>(
    'inclusive',
  );

  const handleRowClick = (item: EcSalesStat) => {
    setSelectedStats(item);
  };

  const handleTaxModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: 'exclusive' | 'inclusive' | null,
  ) => {
    if (newValue !== null) {
      setTaxMode(newValue);
    }
  };

  const actions = (
    <Box
      sx={{
        width: '90%',
        display: 'flex',
        justifyContent: 'flex-start',
        ml: 1,
      }}
    >
      <ToggleButtonGroup
        value={taxMode}
        exclusive
        onChange={handleTaxModeChange}
        size="small"
        color="primary"
      >
        <ToggleButton value="exclusive">税別</ToggleButton>
        <ToggleButton value="inclusive">税込</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );

  return (
    <ContainerLayout title="MycalinksMALL売上分析" actions={actions}>
      <Stack
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
        direction="row"
        spacing={2}
      >
        <Stack sx={{ flex: 7, minWidth: 0, height: '100%' }}>
          <EcSalesStatsTable
            onRowClick={handleRowClick}
            isTaxIncluded={taxMode === 'inclusive'}
          />
        </Stack>

        <Stack sx={{ flex: 4, minWidth: 0, height: '100%' }}>
          <EcSalesDetailContent
            selectedStats={selectedStats}
            isTaxIncluded={taxMode === 'inclusive'}
          />
        </Stack>
      </Stack>
    </ContainerLayout>
  );
};

export default ECSalesAnalyticsPage;
