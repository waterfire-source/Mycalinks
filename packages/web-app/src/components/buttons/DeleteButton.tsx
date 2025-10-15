import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface Props {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  disabled?: boolean;
}

export const DeleteButton = ({ onClick, disabled }: Props) => {
  return (
    <IconButton onClick={(event) => onClick(event)} disabled={disabled}>
      <DeleteIcon />
    </IconButton>
  );
};
