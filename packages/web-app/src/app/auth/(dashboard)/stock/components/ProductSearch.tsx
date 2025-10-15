import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
import { Box, TextField } from '@mui/material';
import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { SimpleButtonWithIcon } from '@/components/buttons/SimpleButtonWithIcon';
import { PATH } from '@/constants/paths';
import { useRouter } from 'next/navigation';
import { HelpIcon } from '@/components/common/HelpIcon';

interface Props {
  setSearchState: React.Dispatch<React.SetStateAction<ProductSearchState>>;
  isShowAdvancedButton?: boolean;
}

export const ProductSearch = ({
  setSearchState,
  isShowAdvancedButton,
}: Props) => {
  const [searchName, setSearchName] = useState<string | undefined>(undefined);
  const [searchModelExpansion, setSearchModelExpansion] = useState<
    string | undefined
  >(undefined);
  const [searchModelNumber, setSearchModelNumber] = useState<
    string | undefined
  >(undefined);
  const [rarity, setRarity] = useState<string | undefined>(undefined);
  const { push } = useRouter();

  const handleClick = () => {
    setSearchState((prev) => ({
      ...prev,
      searchName: searchName === '' ? undefined : searchName,
      modelExpansion:
        searchModelExpansion === '' ? undefined : searchModelExpansion,
      modelNumber: searchModelNumber === '' ? undefined : searchModelNumber,
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
        onChange={(event) => setSearchModelExpansion(event.target.value)}
        onKeyDown={handleKeyDown} // Enterキーで検索
        value={searchModelExpansion}
        sx={{ backgroundColor: 'white' }}
      />
      <TextField
        placeholder="型番"
        size="small"
        onChange={(event) => setSearchModelNumber(event.target.value)}
        onKeyDown={handleKeyDown} // Enterキーで検索
        value={searchModelNumber}
        sx={{ backgroundColor: 'white' }}
      />
      <TextField
        placeholder="レアリティ"
        size="small"
        onChange={(event) => setRarity(event.target.value)} // 🔹 tagName の更新
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
      {isShowAdvancedButton !== false && (
        <Box
          display="flex"
          justifyContent="flex-end"
          sx={{ alignItems: 'center' }}
        >
          <SimpleButtonWithIcon
            onClick={() => push(PATH.STOCK.changeHistory.root)}
          >
            在庫数変更履歴
          </SimpleButtonWithIcon>
          <HelpIcon helpArchivesNumber={1576} />
        </Box>
      )}
    </Box>
  );
};
