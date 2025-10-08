import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useParamsAsState } from '@/hooks/useParamsAsState';
import { palette } from '@/theme/palette';
import { Stack, TextField } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';

export const SearchArrival = () => {
  const [params, setParams] = useParamsAsState('name');
  const [query, setQuery] = useState(params);
  useEffect(() => {
    setQuery(params);
  }, [params]);
  const onSearch = () => {
    setParams(query ?? '');
  };
  return (
    <Stack direction="row" gap="16px">
      <TextField
        value={query}
        placeholder="品番・商品名・商品コードを検索"
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setQuery(e.target.value)
        }
        size="small"
        // enter押したときにonSearch実行
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSearch();
          }
        }}
        sx={{ minWidth: '400px', backgroundColor: palette.common.white }}
      />
      <PrimaryButton sx={{ minWidth: '100px' }} onClick={onSearch}>
        検索
      </PrimaryButton>
    </Stack>
  );
};
