import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { InquirySearchState } from '@/feature/ec/inquiry/hooks/useInquirySearch';
import { OrderKind } from '@/feature/ec/inquiry/const';
import { useState } from 'react';
import NumericTextField from '@/components/inputFields/NumericTextField';

interface InquiryListHeaderProps {
  searchState: InquirySearchState;
  setSearchState: React.Dispatch<React.SetStateAction<InquirySearchState>>;
  setOrder: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
}

export const InquiryTabHeader: React.FC<InquiryListHeaderProps> = ({
  searchState,
  setSearchState,
  setOrder,
}: InquiryListHeaderProps) => {
  const [sortOption, setSortOption] = useState<
    'last_sent_at-asc' | 'last_sent_at-desc' | 'code-asc' | 'code-desc'
  >('last_sent_at-desc');

  // 絞り込みハンドラ
  const handleKindChange = (e: SelectChangeEvent<string>) => {
    if (!e.target.value) {
      setSearchState((prev) => ({ ...prev, kind: undefined }));
      return;
    }
    setSearchState((prev) => ({
      ...prev,
      kind: e.target.value as OrderKind,
    }));
  };
  const handleCodeInputChange = (value: number) => {
    if (value === 0) {
      setSearchState((prev) => ({ ...prev, orderId: undefined }));
      return;
    }
    setSearchState((prev) => ({ ...prev, orderId: value }));
  };

  const handleOrderChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value as typeof sortOption;
    setSortOption(value);
    // 「last_sent_at-asc」 → ["last_sent_at","asc"]
    const [field, dir] = value.split('-') as [
      'last_sent_at' | 'order_id',
      'asc' | 'desc',
    ];
    setSearchState((prev) => ({ ...prev, orderBy: field }));
    setOrder(dir);
  };

  return (
    // フィルタリング用のドロップダウン
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {/* コード番号での絞り込み */}
        <NumericTextField
          label="注文番号"
          variant="outlined"
          value={Number(searchState.code) ?? ''}
          onChange={handleCodeInputChange}
          size="small"
          placeholder="注文番号"
          sx={{
            width: 130,
          }}
          InputLabelProps={{
            shrink: true,
            sx: { color: 'text.primary' },
          }}
        />
        {/* ステータスでの絞り込み */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id={'kind-filter-label'} sx={{ color: 'text.primary' }}>
            種類
          </InputLabel>
          <Select
            labelId={'kind-filter-label'}
            label={'種類'}
            value={searchState.kind ?? ''}
            onChange={handleKindChange}
          >
            <MenuItem value="">すべて</MenuItem>
            {Object.keys(OrderKind).map((kind, index) => (
              <MenuItem key={index} value={kind}>
                {OrderKind[kind as OrderKind]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {/* ソート */}
        <Typography>並び替え</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select value={sortOption} onChange={handleOrderChange}>
            <MenuItem value="last_sent_at-asc">日付 昇順</MenuItem>
            <MenuItem value="last_sent_at-desc">日付 降順</MenuItem>
            <MenuItem value="order_id-asc">注文番号 昇順</MenuItem>
            <MenuItem value="order_id-desc">注文番号 降順</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};
