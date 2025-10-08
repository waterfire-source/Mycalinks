import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { ReservationsSearchState } from '@/feature/booking';

interface Props {
  searchState?: ReservationsSearchState;
  setSearchState?: React.Dispatch<
    React.SetStateAction<ReservationsSearchState>
  >;
}

export const CreateReceptionTableSearch = ({
  searchState,
  setSearchState,
}: Props) => {
  const handleChangeOrderBy = (newValue: string) => {
    setSearchState?.((prev) => ({
      ...prev,
      orderBy: newValue,
    }));
  };

  return (
    <Box
      sx={{
        borderBottom: '1px solid',
        borderBottomColor: 'grey.200',
        backgroundColor: 'white',
      }}
    >
      <Stack direction="row" p={2} justifyContent="space-between">
        <Stack direction="row" gap={2} alignItems="center">
          <Typography variant="h2">予約受付中の商品</Typography>
        </Stack>

        <Stack direction="row" gap={1} alignItems="center">
          <Typography>並び替え</Typography>
          <FormControl
            size="small"
            sx={{
              minWidth: 100,
              '@media (min-width: 1400px)': {
                minWidth: 120,
              },
            }}
          >
            <InputLabel id="createAt" sx={{ color: 'text.primary' }}>
              受付日時
            </InputLabel>
            <Select
              labelId="createAt"
              label="受付日時"
              value={searchState?.orderBy || ''}
              onChange={(e) => {
                handleChangeOrderBy(e.target.value as string);
              }}
            >
              <MenuItem value="">指定なし</MenuItem>
              <MenuItem value="created_at_asc">昇順</MenuItem>
              <MenuItem value="created_at_desc">降順</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>
    </Box>
  );
};
