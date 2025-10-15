import { Box, Typography, SxProps, Theme } from '@mui/material';

interface Props {
  text: string;
  variant?: 'primary' | 'secondary' | 'third' | 'fourth';
  sx?: SxProps<Theme>;
}

export const Chip = ({ text, variant = 'secondary', sx }: Props) => {
  const getChipStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          border: 'none',
          textColor: 'white',
        };
      case 'third':
        return {
          backgroundColor: 'white',
          color: 'black',
          border: '1px solid black',
          textColor: 'black',
        };
      case 'fourth':
        return {
          backgroundColor: 'grey.700',
          color: 'white',
          border: 'none',
          textColor: 'white',
        };
      case 'secondary':
      default:
        return {
          backgroundColor: 'grey.300',
          color: 'text.primary',
          border: 'none',
          textColor: 'black',
        };
    }
  };

  const styles = getChipStyles();

  return (
    <Box
      sx={{
        display: 'inline-flex',
        width: 'fit-content',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        border: styles.border,
        borderRadius: 0.5,
        px: 0.3,
        py: 0.5,
        lineHeight: 1,
        ...sx,
      }}
    >
      <Typography variant="caption" color={styles.textColor}>
        {text}
      </Typography>
    </Box>
  );
};
