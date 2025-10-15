import { Box, Typography } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';

interface PackRegisterFooterProps {
  numberOfRegisterdCards: number;
  prevButtonLabel: string;
  prevButtonOnClick: () => void;
  nextButtonLabel: string;
  nextButtonOnClick: () => void;
}

export const PackRegisterFooter: React.FC<PackRegisterFooterProps> = ({
  numberOfRegisterdCards,
  prevButtonLabel,
  prevButtonOnClick,
  nextButtonLabel,
  nextButtonOnClick,
}: PackRegisterFooterProps) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'end',
      }}
    >
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'start', pl: 2 }}>
        <Typography variant="body1">
          現在の登録枚数：{numberOfRegisterdCards}
        </Typography>
      </Box>

      <PrimaryButton
        sx={{ width: 220 }}
        onClick={prevButtonOnClick}
        variant="text"
      >
        {prevButtonLabel}
      </PrimaryButton>

      <PrimaryButton sx={{ width: 220 }} onClick={nextButtonOnClick}>
        {nextButtonLabel}
      </PrimaryButton>
    </Box>
  );
};
