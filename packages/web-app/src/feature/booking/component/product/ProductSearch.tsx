import { palette } from '@/theme/palette';
import { Stack, TextField } from '@mui/material';
import { ChangeEvent, SetStateAction, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { ReservationsSearchState } from '@/feature/booking';

type Props = {
  searchState: ReservationsSearchState;
  setSearchState: (value: SetStateAction<ReservationsSearchState>) => void;
};
export const ReservationProductSearch = ({
  searchState,
  setSearchState,
}: Props) => {
  const [input, setInput] = useState(searchState.productDisplayName);

  const onSearch = () => {
    setSearchState((prev) => {
      return {
        ...prev,
        searchCurrentPage: 0,
        productDisplayName: input?.trim() ?? undefined,
      };
    });
  };

  return (
    <Stack direction="row" gap="16px" mt={2} component="form">
      <TextField
        value={input}
        placeholder="商品名"
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setInput(e.target.value)
        }
        size="small"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSearch();
          }
        }}
        sx={{ minWidth: '400px', backgroundColor: palette.common.white }}
      />
      <PrimaryButtonWithIcon onClick={onSearch} icon={<SearchIcon />}>
        検索
      </PrimaryButtonWithIcon>
    </Stack>
  );
};
