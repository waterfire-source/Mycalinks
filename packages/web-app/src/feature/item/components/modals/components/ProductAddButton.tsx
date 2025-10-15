import React, { useState } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { ItemListMenu } from '@/app/auth/(dashboard)/item/components/ItemListMenu';

export const ProductAddButton = () => {
  //メニュー関連
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  return (
    <>
      <PrimaryButtonWithIcon
        sx={{ ml: 2 }}
        onClick={(event) => setAnchorEl(event.currentTarget)} // メニューを開く処理を直接記述
        icon={<AddCircleOutlineIcon />}
      >
        新規商品登録
      </PrimaryButtonWithIcon>
      <ItemListMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      />
    </>
  );
};
