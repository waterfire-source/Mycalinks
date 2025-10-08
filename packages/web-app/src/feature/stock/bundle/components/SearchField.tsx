import { AddField } from '@/components/tabs/AddField';
import {
  SortOrder,
  SortType,
} from '@/feature/stock/bundle/components/TableContainer';
import {
  Box,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';

type Props = {
  setSortType: (value: string) => void;
  setSortOrder: (value: string) => void;
};

export const SearchField = ({ setSortType, setSortOrder }: Props) => {
  const handleSortTypeChange = (event: SelectChangeEvent<SortType>) => {
    setSortType(event.target.value);
  };

  const handleSortOrderChange = (event: SelectChangeEvent<SortOrder>) => {
    setSortOrder(event.target.value);
  };
  return (
    <AddField>
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Box>
          <Select
            defaultValue={SortType.SET_BUNDLE}
            style={{ width: 200, height: 35, marginLeft: 16 }}
            onChange={handleSortTypeChange}
          >
            <MenuItem value={SortType.SET_BUNDLE}>セット/バンドル</MenuItem>
            <MenuItem value={SortType.SET}>セット</MenuItem>
            <MenuItem value={SortType.BUNDLE}>バンドル</MenuItem>
          </Select>
        </Box>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2">並び替え</Typography>
          <Select
            defaultValue={SortOrder.START_DATE_DESC}
            style={{ width: 200, height: 35, marginLeft: 10, marginRight: 16 }}
            onChange={handleSortOrderChange}
          >
            <MenuItem value={SortOrder.START_DATE_ASC}>開始日時昇順</MenuItem>
            <MenuItem value={SortOrder.START_DATE_DESC}>開始日時降順</MenuItem>
            <MenuItem value={SortOrder.END_DATE_ASC}>終了日時昇順</MenuItem>
            <MenuItem value={SortOrder.END_DATE_DESC}>終了日時降順</MenuItem>
          </Select>
        </Box>
      </Box>
    </AddField>
  );
};
