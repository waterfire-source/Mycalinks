import { Filter } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryProductEditTable';
import { CustomTabTableStyle } from '@/components/tabs/CustomTabTableStyle';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { Box, Tabs } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

interface Props {
  setFilter: Dispatch<SetStateAction<Filter>>;
}

export const InventoryProductTabComponent = ({ setFilter }: Props) => {
  const [tabIndex, setTabIndex] = useState(0);
  const { genre, fetchGenreList } = useGenre();

  useEffect(() => {
    fetchGenreList();
  }, []);

  const genreTabs = [
    { label: 'すべて', key: 'all' },
    ...(genre?.itemGenres?.map((g) => ({
      label: g.display_name,
      key: g.id.toString(), // id を key として文字列に変換
    })) || []),
  ];

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);

    // 「すべて」の場合は undefined、それ以外は選択されたジャンルの id を取得
    const isAllTab = newValue === 0;
    const selectedGenreId: number | undefined = isAllTab
      ? undefined
      : genre?.itemGenres[newValue - 1]?.id;

    setFilter((prev) => ({ ...prev, genreId: selectedGenreId }));
  };

  return (
    <Box
      sx={{
        borderBottom: '8px solid #b82a2a',
        display: 'flex',
        alignItems: 'center',
        padding: 0,
      }}
    >
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable" // 横スクロールを有効化
        allowScrollButtonsMobile // モバイル対応
        sx={{
          margin: 0,
          padding: 0,
          minHeight: '31px',
          '& .MuiTabs-scrollButtons': {
            display: 'none', // スクロールボタンを完全に非表示
          },
        }}
      >
        {genreTabs.map((tab) => (
          <CustomTabTableStyle key={tab.key} label={<Box>{tab.label}</Box>} />
        ))}
      </Tabs>
    </Box>
  );
};
