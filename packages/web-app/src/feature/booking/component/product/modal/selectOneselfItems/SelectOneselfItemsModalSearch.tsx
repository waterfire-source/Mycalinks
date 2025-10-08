import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SearchIcon from '@mui/icons-material/Search';
import { Item_Genre } from '@prisma/client';

interface Props {
  searchState: {
    searchName?: string;
    selectedGenreId?: number;
    selectedCategoryId?: number;
  };
  genre: Item_Genre[] | undefined;
  handleSearchNameChange: (newName: string) => void;
  handleGenreChange: (newGenreId: number) => void;
  handleSearch: () => void;
}

export const SelectOneselfItemsModalSearch = ({
  searchState,
  genre,
  handleSearchNameChange,
  handleGenreChange,
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
          value={searchState.selectedGenreId ?? ''}
          onChange={(e) => handleGenreChange(Number(e.target.value))}
          label="ジャンル"
        >
          <MenuItem value={undefined} sx={{ color: 'text.primary' }}>
            <Typography color="text.primary">指定なし</Typography>
          </MenuItem>
          {genre?.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.display_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        value={searchState.searchName}
        onChange={(e) => handleSearchNameChange(e.target.value)}
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
