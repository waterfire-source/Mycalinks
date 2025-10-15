import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  Select,
  TextField,
  Typography,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import dayjs from 'dayjs';
import { SearchParams } from '@/feature/marketFluctuationsModal/type';

interface Props {
  searchParams: SearchParams;
  setSearchParams: Dispatch<SetStateAction<SearchParams>>;
}

export const FilterSection = ({ searchParams, setSearchParams }: Props) => {
  const [searchDate, setSearchDate] = useState(() => {
    if (!searchParams || !searchParams.marketPriceUpdatedAtGte) {
      return { date: '', time: '' };
    }
    const searchDate = new Date(searchParams.marketPriceUpdatedAtGte);
    return {
      date: dayjs(searchDate).format('YYYY-MM-DD'),
      time: dayjs(searchDate).format('HH:mm'),
    };
  });

  useEffect(() => {
    if (searchDate.date !== '' && searchDate.time !== '') {
      setSearchParams((prev) => ({
        ...prev,
        marketPriceUpdatedAtGte: `${searchDate.date} ${searchDate.time}`,
      }));
    }
  }, [searchDate, setSearchParams]);

  const [stockCheckState, setStockCheckState] = useState({
    hasStock: searchParams.hasStock === true,
    hasNotStock: searchParams.hasStock === false,
  });

  const handleChangeHasStock = (key: string, value: boolean) => {
    setStockCheckState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  useEffect(() => {
    const searchAll = stockCheckState.hasStock === stockCheckState.hasNotStock;
    setSearchParams((prev) => ({
      ...prev,
      hasStock: searchAll ? undefined : stockCheckState.hasStock,
    }));
  }, [stockCheckState, setSearchParams]);

  const generateTimeOptions = (): { label: string; value: string }[] => {
    return Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0');
      const time = `${hour}:00`;
      return { label: time, value: time };
    });
  };
  const updateTime = generateTimeOptions();
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        flexWrap: 'wrap',
        marginRight: 'auto',
      }}
    >
      {/* 日付入力 */}
      <TextField
        size="small"
        type="date"
        InputLabelProps={{
          shrink: true,
        }}
        value={searchDate.date}
        onChange={(e) =>
          setSearchDate((prev) => ({
            ...prev,
            date: e.target.value,
          }))
        }
        sx={{
          '& .MuiInputLabel-root': {
            color: 'black', // ラベルの色
          },
          '& .MuiInputBase-input': {
            color: 'black', // 入力値の文字色
          },
        }}
      />

      {/* 時刻選択 */}
      <FormControl
        variant="outlined"
        size="small"
        sx={{
          minWidth: 100,
          backgroundColor: 'common.white',
          '& .MuiInputLabel-root': {
            color: 'text.primary',
          },
        }}
      >
        <Select
          value={searchDate.time}
          onChange={(e) =>
            setSearchDate((prev) => ({
              ...prev,
              time: e.target.value,
            }))
          }
        >
          {updateTime.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.value}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography
        sx={{
          whiteSpace: 'nowrap',
        }}
      >
        以降更新
      </Typography>
      <Box
        sx={{
          marginLeft: 2,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={stockCheckState.hasStock}
              onChange={(e) =>
                handleChangeHasStock('hasStock', e.target.checked)
              }
            />
          }
          label="在庫あり"
        />
      </Box>
    </Box>
  );
};
