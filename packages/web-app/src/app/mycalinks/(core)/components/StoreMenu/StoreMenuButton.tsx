'use client';
import { ButtonBase, Typography } from '@mui/material';

interface Props {
  label: string;
  onClick: () => void;
  icon: React.ElementType;
}

export const StoreMenuButton = ({ label, onClick, icon: Icon }: Props) => {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        padding: 1,
        textAlign: 'center',
        aspectRatio: '1 / 1',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'grey.300',
        backgroundColor: 'background.paper',
        boxShadow: 6,
        '&:hover': {
          backgroundColor: 'action.hover',
          boxShadow: 3,
        },
      }}
    >
      <Icon
        sx={{
          fontSize: 32,
          color: 'grey.500',
        }}
      />
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
    </ButtonBase>
  );
};
