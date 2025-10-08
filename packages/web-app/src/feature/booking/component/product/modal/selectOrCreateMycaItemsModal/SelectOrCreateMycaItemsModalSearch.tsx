import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { MycaAppGenre } from 'backend-core';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SearchIcon from '@mui/icons-material/Search';

interface Props {
  searchState: {
    searchTerm: string;
    selectedCategory: number | null;
  };
  genres: MycaAppGenre[];
  handleSearchTermChange: (newTerm: string) => void;
  handleCategoryChange: (newCategory: number | null) => void;
  handleSearch: () => void;
}

export const SelectOrCreateMycaItemsModalSearch = ({
  searchState,
  genres,
  handleSearchTermChange,
  handleCategoryChange,
  handleSearch,
}: Props) => {
  return (
    <Stack direction="row" gap={2} mt={1} alignItems="center">
      <FormControl
        variant="outlined"
        size="small"
        sx={{
          minWidth: 150,
          backgroundColor: 'common.white',
          '& .MuiInputLabel-root': {
            color: 'text.primary',
          },
        }}
      >
        <InputLabel sx={{ color: 'text.primary' }}>ジャンル</InputLabel>
        <Select
          value={searchState.selectedCategory}
          onChange={(e) =>
            handleCategoryChange(e.target.value ? Number(e.target.value) : null)
          }
          label="ジャンル"
        >
          <MenuItem value={undefined} sx={{ color: 'text.primary' }}>
            <Typography color="text.primary">指定なし</Typography>
          </MenuItem>
          {genres.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.display_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        value={searchState.searchTerm}
        onChange={(e) => handleSearchTermChange(e.target.value)}
        placeholder="商品名"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        }}
        sx={{ minWidth: 300, backgroundColor: 'white' }}
        size="small"
      />
      <PrimaryButtonWithIcon onClick={handleSearch} icon={<SearchIcon />}>
        検索
      </PrimaryButtonWithIcon>
    </Stack>
  );
};
