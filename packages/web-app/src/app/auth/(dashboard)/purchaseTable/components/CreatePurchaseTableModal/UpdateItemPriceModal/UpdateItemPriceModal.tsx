import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import TertiaryButtonWithIcon from '@/components/buttons/TertiaryButtonWithIcon';
import { Box, Modal, Typography } from '@mui/material';
import { FaTimes } from 'react-icons/fa';

interface Props {
  open: boolean;
  onClose: () => void;
  onTertiaryButtonClick: () => void;
  onPrimaryButtonClick: () => void;
  tertiaryButtonLoading: boolean;
  primaryButtonLoading: boolean;
  canClick: boolean;
}

export const UpdateItemPriceModal = ({
  open,
  onClose,
  onTertiaryButtonClick,
  onPrimaryButtonClick,
  tertiaryButtonLoading,
  primaryButtonLoading,
  canClick,
}: Props) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'white',
          borderRadius: 2,
          boxShadow: 24,
          pt: 1,
          pr: 2,
          pl: 2,
          pb: 2,
        }}
      >
        <FaTimes
          size={20}
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '5px',
            color: 'black',
            backgroundColor: 'white',
            cursor: 'pointer',
            borderRadius: '50%',
            padding: '5px',
          }}
        />

        {/* タイトル */}
        <Typography variant="h1" fontWeight="bold" color="primary.main" mt={2}>
          買取表生成
        </Typography>

        {/* 説明文 */}
        <Typography mt={1.5}>
          商品の買取価格を買取表掲載価格に変更しますか？
        </Typography>
        <Typography>
          ※型番違いなど買取価格が変わらない商品もございますので
          実際の買取の際はご注意ください。
        </Typography>

        {/* 必須項目入力なしの場合の注意書き */}
        {canClick ? (
          <Typography mt={1} color="primary.main">
            ※必須項目を全て入力してください。
          </Typography>
        ) : undefined}
        {/* ボタン */}
        <Box display="flex" justifyContent="flex-end" mt={1.5} gap={2}>
          <TertiaryButtonWithIcon
            loading={tertiaryButtonLoading}
            onClick={onTertiaryButtonClick}
            disabled={canClick}
          >
            変更せずに生成
          </TertiaryButtonWithIcon>
          <PrimaryButtonWithIcon
            loading={primaryButtonLoading}
            onClick={onPrimaryButtonClick}
            disabled={canClick}
          >
            変更して生成
          </PrimaryButtonWithIcon>
        </Box>
      </Box>
    </Modal>
  );
};
