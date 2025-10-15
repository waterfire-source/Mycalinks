import { Box, IconButton, Typography } from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

interface Props {
  onBack: () => void;
  title: string;
  custom?: React.ReactElement;
}

export const HeaderWithBackButton = ({ onBack, title, custom }: Props) => {
  return (
    <Box
      sx={{ p: 2, display: 'flex', alignItems: 'center', position: 'relative' }}
    >
      <IconButton onClick={onBack} sx={{ position: 'absolute', left: 0 }}>
        <KeyboardArrowLeftIcon
          sx={{ color: 'primary.main', width: 40, height: 40 }}
        />
      </IconButton>
      <Typography
        variant="h4"
        sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 'bold' }}
      >
        {title}
      </Typography>
      {custom && <Box sx={{ position: 'absolute', right: '5%' }}>{custom}</Box>}
    </Box>
  );
};
