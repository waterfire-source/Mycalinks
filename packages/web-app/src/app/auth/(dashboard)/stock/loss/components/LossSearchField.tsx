import React, { useState } from 'react';
import { SxProps, Theme, TextField, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';

interface Props {
  sx?: SxProps<Theme>;
  onSearch: (searchParams: { reason: string; displayName: string }) => void;
  initialReason?: string;
  initialDisplayName?: string;
}

const LossSearchField: React.FC<Props> = ({
  sx,
  onSearch,
  initialReason = '',
  initialDisplayName = '',
}) => {
  const [reason, setReason] = useState(initialReason);
  const [displayName, setDisplayName] = useState(initialDisplayName);

  const handleSearch = () => {
    onSearch({
      reason,
      displayName,
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
    >
      <Stack direction="row" alignItems="center" gap="10px" sx={{ ...sx }}>
        {/* 商品名検索フィールド */}
        <TextField
          variant="outlined"
          placeholder="商品名"
          value={displayName}
          type="text"
          size="small"
          onChange={(e) => setDisplayName(e.target.value)}
          sx={{
            width: '40%',
            backgroundColor: 'white',
          }}
        />

        {/* ロス理由検索フィールド */}
        <TextField
          variant="outlined"
          placeholder="ロス理由"
          value={reason}
          type="text"
          size="small"
          onChange={(e) => setReason(e.target.value)}
          sx={{
            width: '40%',
            backgroundColor: 'white',
          }}
        />

        <PrimaryButtonWithIcon
          type="submit"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
        >
          検索
        </PrimaryButtonWithIcon>
      </Stack>
    </form>
  );
};

export default LossSearchField;