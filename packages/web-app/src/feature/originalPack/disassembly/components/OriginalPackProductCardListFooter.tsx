import { Box } from '@mui/material';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import TertiaryButtonWithIcon from '@/components/buttons/TertiaryButtonWithIcon';

interface OriginalPackProductCardListFooterProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const OriginalPackProductCardListFooter: React.FC<
  OriginalPackProductCardListFooterProps
> = ({
  onConfirm: handleConfirm,
  onCancel: handleCancel,
}: OriginalPackProductCardListFooterProps) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'end',
        gap: 2,
      }}
    >
      <TertiaryButtonWithIcon sx={{ width: 150 }} onClick={handleCancel}>
        解体をやめる
      </TertiaryButtonWithIcon>
      <PrimaryButtonWithIcon sx={{ width: 150 }} onClick={handleConfirm}>
        解体結果の確認
      </PrimaryButtonWithIcon>
    </Box>
  );
};
