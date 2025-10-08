import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, MenuItem, Box } from '@mui/material';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { PATH } from '@/constants/paths';
import { useSaveLocalStorageRegister } from '@/app/auth/(dashboard)/arrival/register/hooks/useSaveLocalStorageRegister';

interface Props {
  setTaxType: (taxType: 'include' | 'exclude') => void;
  setIsRestoreModalOpen: (isRestoreModalOpen: boolean) => void;
}

export const RegisterStockingButton = ({
  setTaxType,
  setIsRestoreModalOpen,
}: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { push } = useRouter();
  // ローカルストレージ操作
  const { getLocalStorageItem } = useSaveLocalStorageRegister();

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRegister = (taxType: 'include' | 'exclude') => {
    setTaxType(taxType);
    //復元するデータがあるかどうか
    const isRestoreData = getLocalStorageItem(-1, taxType).length !== 0;

    if (isRestoreData) {
      setIsRestoreModalOpen(true);
    } else {
      push(`${PATH.ARRIVAL.register}?tax=${taxType}`);
    }
    handleMenuClose();
  };

  return (
    <Box display="flex" alignItems="center" gap="8px">
      <PrimaryButtonWithIcon
        sx={{ ml: 2 }}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        新規発注登録
      </PrimaryButtonWithIcon>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleRegister('exclude')}>
          税抜き価格で登録
        </MenuItem>
        <MenuItem onClick={() => handleRegister('include')}>
          税込み価格で登録
        </MenuItem>
      </Menu>
    </Box>
  );
};
