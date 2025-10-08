import { Box, Typography, SxProps, Theme } from '@mui/material';

interface Props {
  condition: string;
  sx?: SxProps<Theme>;
}
export const ConditionChip = ({ condition, sx }: Props) => {
  return (
    <Box
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        borderRadius: '8px',
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'fit-content',
        minWidth: '60px',
        ...sx,
      }}
    >
      <Typography variant="caption">{condition}</Typography>
    </Box>
  );
};
