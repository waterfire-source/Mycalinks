import { ItemWithEcOrderSearchState } from '@/feature/ec/hooks/type';
import { Box, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';

interface Props {
  searchDate: {
    startDate: string;
    endDate: string;
  };
  handleStartDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  searchState: ItemWithEcOrderSearchState;
  setSearchState: React.Dispatch<
    React.SetStateAction<ItemWithEcOrderSearchState>
  >;
}

export const EcSearchProduct = ({
  searchDate,
  handleStartDateChange,
  handleEndDateChange,
  searchState,
  setSearchState,
}: Props) => {
  return (
    <>
      <TextField
        label="商品名"
        size="small"
        value={searchState.displayName}
        onChange={(event) =>
          setSearchState((prev) => ({
            ...prev,
            displayName: event.target.value,
          }))
        }
        sx={{ width: 150, backgroundColor: 'white' }}
        InputLabelProps={{
          sx: {
            color: 'black',
          },
        }}
      />

      <TextField
        label="型番"
        size="small"
        value={searchState.cardNumber}
        onChange={(event) =>
          setSearchState((prev) => ({
            ...prev,
            cardNumber: event.target.value,
          }))
        }
        sx={{ width: 100, backgroundColor: 'white' }}
        InputLabelProps={{
          sx: {
            color: 'black',
          },
        }}
      />

      <TextField
        label="レアリティ"
        size="small"
        value={searchState.rarity}
        onChange={(event) =>
          setSearchState((prev) => ({
            ...prev,
            rarity: event.target.value,
          }))
        }
        sx={{ width: 100, backgroundColor: 'white' }}
        InputLabelProps={{
          sx: {
            color: 'black',
          },
        }}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 0.5,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TextField
          label="取引日時"
          type="date"
          size="small"
          value={
            searchDate.startDate
              ? dayjs(searchDate.startDate).format('YYYY-MM-DD')
              : ''
          }
          onChange={handleStartDateChange}
          sx={{ width: 160, backgroundColor: 'white' }}
          InputLabelProps={{
            shrink: true,
            sx: {
              color: 'black',
            },
          }}
        />
        <Typography>~</Typography>
        <TextField
          type="date"
          size="small"
          value={
            searchDate.endDate
              ? dayjs(searchDate.endDate).format('YYYY-MM-DD')
              : ''
          }
          onChange={handleEndDateChange}
          sx={{ width: 160, backgroundColor: 'white' }}
          InputLabelProps={{
            shrink: true,
            sx: {
              color: 'black',
            },
          }}
        />
      </Box>
    </>
  );
};
