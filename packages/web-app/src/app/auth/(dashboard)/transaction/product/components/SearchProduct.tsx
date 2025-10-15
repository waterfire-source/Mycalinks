import { ItemWithTransactionSearchState } from '@/feature/transaction/hooks/useListItemsWithTransaction';
import { toHalfWidthOnly } from '@/utils/convertToHalfWidth';
import { Box, Stack, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useState } from 'react';

interface Props {
  searchDate: {
    startDate: string;
    endDate: string;
  };
  handleStartDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setSearchState: React.Dispatch<
    React.SetStateAction<ItemWithTransactionSearchState>
  >;
}

export const SearchProduct = ({
  searchDate,
  handleStartDateChange,
  handleEndDateChange,
  setSearchState,
}: Props) => {
  const [name, setName] = useState<string | undefined>(undefined);
  const [expansion, setExpansion] = useState<string | undefined>(undefined);
  const [cardnumber, setCardnumber] = useState<string | undefined>(undefined);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setSearchState((prev) => ({
        ...prev,
        searchProductName: name,
        searchProductExpansion: expansion,
        searchProductNumber: cardnumber,
      }));
    }
  };

  return (
    <Stack>
      <Stack direction="row" spacing={1}>
        <TextField
          label="商品名"
          size="small"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() =>
            setSearchState((prev) => ({
              ...prev,
              searchProductName: name,
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
          label="エキスパンション"
          size="small"
          value={expansion}
          onChange={(event) =>
            setExpansion(toHalfWidthOnly(event.target.value))
          }
          onKeyDown={handleKeyDown}
          onBlur={() =>
            setSearchState((prev) => ({
              ...prev,
              searchProductExpansion: expansion,
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
          value={cardnumber}
          onChange={(event) =>
            setCardnumber(toHalfWidthOnly(event.target.value))
          }
          onKeyDown={handleKeyDown}
          onBlur={() =>
            setSearchState((prev) => ({
              ...prev,
              searchProductNumber: cardnumber,
            }))
          }
          sx={{ width: 150, backgroundColor: 'white' }}
          InputLabelProps={{
            sx: {
              color: 'black',
            },
          }}
        />
        {/* <TextField
        label="タグ"
        size="small"
        value={searchState.searchProductTag}
        onChange={(event) =>
          setSearchState((prev) => ({
            ...prev,
            searchProductTag: toHalfWidthOnly(event.target.value),
          }))
        }
        sx={{ width: 100, backgroundColor: 'white' }}
        InputLabelProps={{
          sx: {
            color: 'black',
          },
        }}
      /> */}

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
      </Stack>
    </Stack>
  );
};
