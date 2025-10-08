import React from 'react';
import { Box, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';

interface SaleRegistrationModalProps {
  open: boolean;
  onClose: () => void;
}

const SaleRegistrationModal: React.FC<SaleRegistrationModalProps> = ({
  open,
  onClose,
}) => {
  const router = useRouter();

  /**
   * 指定されたパスへ画面遷移する
   */
  const handleNavigation = (path: string): void => {
    router.push(path);
  };

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title="セール対象選択"
      hideButtons={true}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          padding: '20px',
        }}
      >
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 0, width: '400px', maxWidth: '100%' }}
          onClick={() =>
            handleNavigation(`${PATH.STOCK.sale.register}?type=department`)
          }
        >
          ジャンル・カテゴリ
        </Button>
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 2, width: '400px', maxWidth: '100%' }}
          onClick={() =>
            handleNavigation(`${PATH.STOCK.sale.register}?type=item`)
          }
        >
          商品
        </Button>
      </Box>
    </CustomModalWithIcon>
  );
};

export default SaleRegistrationModal;
