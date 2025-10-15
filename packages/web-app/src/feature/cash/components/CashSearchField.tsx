import { Dispatch, SetStateAction, useEffect } from 'react';
import { Box, TextField, Stack } from '@mui/material';
import { CashHistorySearchState } from '@/feature/cash/hooks/useCashHistorySearch';

interface Props {
  searchState: CashHistorySearchState;
  setSearchState: Dispatch<SetStateAction<CashHistorySearchState>>;
  onSearch: () => void;
}

export const CashSearchField = ({
  searchState,
  setSearchState,
  onSearch,
}: Props) => {
  // searchStateの検索要素が変更されたら履歴を取得しなおす
  useEffect(() => {
    onSearch();
  }, [
    searchState.sourceKind,
    searchState.startAt,
    searchState.endAt,
    onSearch,
  ]);
  return (
    <Box
      sx={{
        py: '5px',
        backgroundColor: 'common.white',
        borderBottom: 'none',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '50px',
          display: 'flex',
          py: '6px',
        }}
      >
        <Stack direction="row" gap="16px">
          <Stack
            flexDirection="row"
            gap={1}
            alignItems="center"
            sx={{ height: '100%', paddingLeft: 4 }}
          >
            <TextField
              label="入出金日時"
              variant="outlined"
              placeholder="検索開始日"
              value={searchState.startAt}
              type="date"
              onChange={(e) => {
                setSearchState((prev) => ({
                  ...prev,
                  startAt: e.target.value,
                }));
              }}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                margin: 0,
                height: '100%',
                backgroundColor: 'common.white',
                '& .MuiInputBase-input': {
                  color: 'text.primary',
                },
                '& .MuiInputLabel-root': {
                  color: 'black',
                },
                '& .MuiInput-underline:before': {
                  borderBottomColor: 'grey.700',
                },
                '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                  borderBottomColor: 'grey.700',
                },
                '& .MuiOutlinedInput-root': {
                  height: '100%',
                  '& fieldset': {
                    borderColor: 'grey.700',
                  },
                  '&:hover fieldset': {
                    borderColor: 'grey.700',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'grey.700',
                  },
                },
              }}
            />
            ~
            <TextField
              variant="outlined"
              placeholder="検索終了日"
              value={searchState.endAt}
              type="date"
              onChange={(e) => {
                setSearchState((prev) => ({
                  ...prev,
                  endAt: e.target.value,
                }));
              }}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                margin: 0,
                height: '100%',
                backgroundColor: 'common.white',
                '& .MuiInputBase-input': {
                  color: 'text.primary',
                },
                '& .MuiInput-underline:before': {
                  borderBottomColor: 'grey.700',
                },
                '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                  borderBottomColor: 'grey.700',
                },
                '& .MuiOutlinedInput-root': {
                  height: '100%',
                  '& fieldset': {
                    borderColor: 'grey.700',
                  },
                  '&:hover fieldset': {
                    borderColor: 'grey.700',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'grey.700',
                  },
                },
              }}
            />
          </Stack>
          {/* <TextField
            size="small"
            sx={{ width: 300, height: '100%' }}
            placeholder="担当者 ※未実装"
          ></TextField> */}
        </Stack>
      </Box>
    </Box>
  );
};
