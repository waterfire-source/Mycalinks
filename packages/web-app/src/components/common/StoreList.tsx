import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';

interface Store {
  id: number;
  name: string;
}

interface Props {
  stores: Store[]; // 表示する店舗の配列
  setSelectedStoreID: (id: number) => void;
  setIsOpenModal: (isOpen: boolean) => void;
}

/**
 * 店舗一覧を表示するコンポーネント
 * 各店舗はIDと店舗名を持つカードとして表示され、
 * 編集モードの場合は削除ボタンも表示される
 */
export const StoreList: React.FC<Props> = ({
  stores,
  setSelectedStoreID,
  setIsOpenModal,
}) => {
  const onEdit = (id: number) => {
    setSelectedStoreID(id);
    setIsOpenModal(true);
  };
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 2,
        width: '100%',
        maxHeight: '200px',
        overflow: 'scroll',
      }}
    >
      {stores.map((store) => (
        <Box
          key={store.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            margin: '4px 0',
          }}
        >
          {/* 店舗リンク */}
          <Tooltip title={`${store.id}. ${store.name}`} enterDelay={200}>
            <Box
              component="a"
              onClick={() => onEdit(store.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'underline',
                cursor: 'pointer',
                width: '100%',
                maxWidth: '200px',
                '&:hover': { opacity: 0.8 },
              }}
            >
              <Typography noWrap sx={{ maxWidth: '200px' }}>
                {store.id}.{' '}
                {store.name.length > 16
                  ? `${store.name.substring(0, 16)}...`
                  : store.name}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      ))}
    </Box>
  );
};
