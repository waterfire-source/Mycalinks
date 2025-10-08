import { PosRunMode } from '@/types/next-auth';
import { Check } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';

interface Props {
  mode: PosRunMode;
  onClick: () => void;
  selectedMode: PosRunMode;
}

export const ModeBox = ({ mode, onClick, selectedMode }: Props) => {
  const isSelected = selectedMode === mode;
  return (
    <Stack
      sx={{
        border: '1px solid',
        borderColor: isSelected ? 'primary.main' : 'grey.300',
        cursor: 'pointer',
      }}
      borderRadius={1}
      p={1}
      justifyContent="center"
      alignItems="center"
      direction="row"
      gap={1}
      onClick={onClick}
    >
      {isSelected ? (
        <Check
          sx={{
            color: isSelected ? 'primary.main' : 'grey.300',
            width: 20,
            height: 20,
          }}
        />
      ) : (
        <Box
          sx={{
            width: 20,
            height: 20,
          }}
        />
      )}
      <Typography
        variant="body2"
        color={isSelected ? 'primary.main' : 'grey.600'}
      >
        {mode === PosRunMode.admin ? '管理モード' : 'ストアモード'}
      </Typography>
    </Stack>
  );
};
