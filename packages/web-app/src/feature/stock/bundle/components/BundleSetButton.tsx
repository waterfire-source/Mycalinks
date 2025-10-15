import { useState, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, MenuItem } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';

export const BundleSetButton = () => {
  // メニューの開閉状態を管理するstate
  const [buttonListAnchor, setButtonListAnchor] = useState<null | HTMLElement>(
    null,
  );
  const isOpenButtonList = Boolean(buttonListAnchor);

  const handleButtonListAnchorClick = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    setButtonListAnchor(event.currentTarget);
  };
  const handleCloseButtonListAnchor = () => {
    setButtonListAnchor(null);
  };

  const router = useRouter();
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <>
      <PrimaryButton
        id="basic-button"
        aria-controls={isOpenButtonList ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={isOpenButtonList ? 'true' : undefined}
        onClick={handleButtonListAnchorClick}
      >
        新規バンドル・セット作成
      </PrimaryButton>

      <Menu
        id="basic-menu"
        anchorEl={buttonListAnchor}
        open={isOpenButtonList}
        onClose={() => handleCloseButtonListAnchor()}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={() => handleNavigation(`/auth/stock/bundle/register`)}
        >
          新規バンドル作成
        </MenuItem>
        <MenuItem onClick={() => handleNavigation(`/auth/stock/set/register`)}>
          新規セット作成
        </MenuItem>
      </Menu>
    </>
  );
};
