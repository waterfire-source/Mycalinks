import { Typography, Box, Stack } from '@mui/material';
import { CashSearchField } from '@/feature/cash/components/CashSearchField';
import { Store } from '@prisma/client';
import { CashHistorySearchState } from '@/feature/cash/hooks/useCashHistorySearch';
import { Dispatch, SetStateAction } from 'react';
import { TabCashTable } from '@/feature/cash/components/TabCashTable';

interface Props {
  store: Store;
  searchState: CashHistorySearchState;
  setSearchState: Dispatch<SetStateAction<CashHistorySearchState>>;
  performSearch: () => void;
}

export const CashContainer = ({
  store,
  searchState,
  setSearchState,
  performSearch,
}: Props) => {
  return (
    <Stack gap={2} sx={{ height: '100%' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-start"
        sx={{
          gap: '20px',
        }}
      >
        <Typography variant="body2">現在のレジ内金額</Typography>
        {store?.id && (
          <Typography
            variant="body2"
            sx={{ fontWeight: 'bold', color: 'primary.main' }}
          >
            {(store.total_cash_price || 0).toLocaleString()}円
          </Typography>
        )}
      </Stack>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          minHeight: 0,
        }}
      >
        {/* レジ履歴表示フィールド */}
        <TabCashTable
          cashHistories={searchState.searchResults}
          addField={
            <CashSearchField
              searchState={searchState}
              setSearchState={setSearchState}
              onSearch={performSearch}
            />
          }
          searchState={searchState}
          setSearchState={setSearchState}
          performSearch={performSearch}
        />
      </Box>
    </Stack>
  );
};
