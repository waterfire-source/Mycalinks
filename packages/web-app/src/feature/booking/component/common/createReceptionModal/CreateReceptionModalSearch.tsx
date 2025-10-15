import { Stack, TextField } from '@mui/material';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SearchIcon from '@mui/icons-material/Search';
import { ReservationsSearchState } from '@/feature/booking';
import { useState } from 'react';

interface Props {
  searchState: ReservationsSearchState;
  setSearchState: React.Dispatch<React.SetStateAction<ReservationsSearchState>>;
}

export const CreateReceptionModalSearch = ({
  searchState,
  setSearchState,
}: Props) => {
  const [input, setInput] = useState(searchState.productDisplayName);

  const onSearch = () => {
    setSearchState((prev) => {
      return {
        ...prev,
        productDisplayName: input?.trim() ?? undefined,
      };
    });
  };

  return (
    <Stack direction="row" gap={2} mt={1} alignItems="center">
      <TextField
        value={input ?? ''}
        onChange={(e) => setInput(e.target.value)}
        placeholder="商品名"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSearch();
          }
        }}
        sx={{ minWidth: 300, backgroundColor: 'white' }}
        size="small"
      />
      <PrimaryButtonWithIcon onClick={onSearch} icon={<SearchIcon />}>
        検索
      </PrimaryButtonWithIcon>
    </Stack>
  );
};
