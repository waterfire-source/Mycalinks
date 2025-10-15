import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { Box, TextField } from '@mui/material';
import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { toHalfWidthOnly } from '@/utils/convertToHalfWidth';

interface Props {
  setSearchState: React.Dispatch<React.SetStateAction<ItemSearchState>>;
  setIsReset?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ItemSearch = ({ setSearchState, setIsReset }: Props) => {
  const [searchName, setSearchName] = useState<string>('');
  const [searchModelExpansion, setSearchModelExpansion] = useState<string>('');
  const [searchModelNumber, setSearchModelNumber] = useState<string>('');
  const [rarity, setRarity] = useState<string>('');

  const handleClick = () => {
    setSearchState((prev) => ({
      ...prev,
      searchName: searchName === '' ? undefined : searchName,
      expansion: searchModelExpansion === '' ? undefined : searchModelExpansion,
      cardnumber: searchModelNumber === '' ? undefined : searchModelNumber,
      rarity: rarity === '' ? undefined : rarity,
    }));
    if (setIsReset) {
      setIsReset(true);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleClick(); // Enterキーで検索を実行
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'center',
      }}
    >
      <TextField
        placeholder="商品名"
        size="small"
        onChange={(event) => setSearchName(event.target.value)}
        onKeyDown={handleKeyDown} // Enterキーで検索
        value={searchName}
        sx={{ backgroundColor: 'white' }}
      />
      <TextField
        placeholder="エキスパンション"
        size="small"
        onChange={(event) =>
          setSearchModelExpansion(event.target.value)
        }
        onKeyDown={handleKeyDown} // Enterキーで検索
        value={searchModelExpansion}
        sx={{ backgroundColor: 'white' }}
      />
      <TextField
        placeholder="型番"
        size="small"
        onChange={(event) =>
          setSearchModelNumber(toHalfWidthOnly(event.target.value))
        }
        onKeyDown={handleKeyDown} // Enterキーで検索
        value={searchModelNumber}
        sx={{ backgroundColor: 'white' }}
      />
      <TextField
        placeholder="レアリティ"
        size="small"
        onChange={(event) => setRarity(event.target.value)}
        onKeyDown={handleKeyDown} // Enterキーで検索
        value={rarity}
        sx={{ backgroundColor: 'white' }}
      />
      <PrimaryButtonWithIcon
        onClick={handleClick}
        icon={<SearchIcon />}
        iconSize={20}
      >
        検索
      </PrimaryButtonWithIcon>
    </Box>
  );
};
