import { Box } from '@mui/material';
import { TabStatusFilterTable } from '@/feature/purchaseReception/components/tables/TabStatusFilterTable';

export const PurchaseReceptionContainer = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: 'calc(100vh - 162px)',
        gap: 1,
      }}
    >
      <TabStatusFilterTable />
    </Box>
  );
};
