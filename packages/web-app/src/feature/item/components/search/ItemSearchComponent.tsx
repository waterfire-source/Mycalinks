import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { Box, TextField } from '@mui/material';
import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';

interface Props {
  setSearchState: React.Dispatch<React.SetStateAction<ItemSearchState>>;
}

export const ItemSearchComponent = ({ setSearchState }: Props) => {
  const [searchName, setSearchName] = useState<string | undefined>(undefined);
  const [expansion, setExpansion] = useState<string | undefined>(undefined);
  const [cardnumber, setCardnumber] = useState<string | undefined>(undefined);
  const [rarity, setRarity] = useState<string | undefined>(undefined);

  const handleClick = () => {
    setSearchState((prev) => ({
      ...prev,
      searchName: searchName === '' ? undefined : searchName,
      expansion: expansion === '' ? undefined : expansion,
      cardnumber: cardnumber === '' ? undefined : cardnumber,
      rarity: rarity === '' ? undefined : rarity,
    }));
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
        gap: 2, // 各セレクトボックス間の間隔
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
        onChange={(event) => setExpansion(event.target.value)}
        onKeyDown={handleKeyDown} // Enterキーで検索
        value={expansion}
        sx={{ backgroundColor: 'white' }}
      />
      <TextField
        placeholder="型番"
        size="small"
        onChange={(event) => setCardnumber(event.target.value)}
        onKeyDown={handleKeyDown} // Enterキーで検索
        value={cardnumber}
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
