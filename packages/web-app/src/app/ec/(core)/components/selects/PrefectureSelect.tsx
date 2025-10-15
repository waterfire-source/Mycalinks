'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Menu, MenuItem } from '@mui/material';
import { prefectures } from '@/constants/prefectures';
import { useRouter, useSearchParams } from 'next/navigation';

type Prefecture = (typeof prefectures)[0];

interface Props {
  defaultPrefectureId?: number;
  setPrefectureId?: (prefectureId: number) => void;
  label?: string;
  onPrefectureChange?: (prefectureId: number) => void;
}

export const PrefectureSelect = ({
  defaultPrefectureId = 13, // デフォルトは東京都
  label = 'お届け先',
  setPrefectureId,
  onPrefectureChange,
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 初期都道府県の設定
  const [selectedPrefecture, setSelectedPrefecture] = useState(() => {
    const prefectureId =
      Number(searchParams.get('prefecture')) || defaultPrefectureId;
    return prefectures.find((p) => p.id === prefectureId) || prefectures[0];
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (!defaultPrefectureId) return;
    const prefecture = prefectures.find((p) => p.id === defaultPrefectureId);
    if (!prefecture) return;
    setSelectedPrefecture(prefecture);
  }, [defaultPrefectureId]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (prefecture: Prefecture) => {
    setSelectedPrefecture(prefecture);
    setPrefectureId?.(prefecture.id);

    // コールバック関数があれば実行
    onPrefectureChange?.(prefecture.id);

    handleClose();

    // URLパラメータを更新
    const params = new URLSearchParams(window.location.search);
    params.set('prefecture', prefecture.id.toString());
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {label && (
        <Typography variant="body2" sx={{ mr: 1 }}>
          {label}:
        </Typography>
      )}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid rgba(0, 0, 0, 0.23)',
          borderRadius: '4px',
          px: 1,
          py: 0.5,
          cursor: 'pointer',
        }}
        onClick={handleClick}
        aria-controls={open ? 'prefecture-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        tabIndex={0}
        role="combobox"
      >
        <Typography variant="body2">{selectedPrefecture.name}</Typography>
        <Typography variant="body2" color="grey.500" sx={{ ml: 1 }}>
          ▼
        </Typography>
      </Box>

      <Menu
        id="prefecture-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'prefecture-button',
          sx: { maxHeight: 300 },
          role: 'listbox',
        }}
      >
        {prefectures.map((prefecture) => (
          <MenuItem
            key={prefecture.id}
            onClick={() => handleSelect(prefecture)}
            selected={prefecture.id === selectedPrefecture.id}
            dense
            role="option"
            aria-selected={prefecture.id === selectedPrefecture.id}
          >
            {prefecture.name}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
