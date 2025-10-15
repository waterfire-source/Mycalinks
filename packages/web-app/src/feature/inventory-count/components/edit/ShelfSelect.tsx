import {
  FormControl,
  Select,
  MenuItem,
  Typography,
  Theme,
  SxProps,
  InputLabel,
} from '@mui/material';
import { Inventory_Shelf } from '@prisma/client';

interface Props {
  shelfs: Inventory_Shelf[];
  selectedShelf: Inventory_Shelf | null;
  onShelfChange: (shelf: Inventory_Shelf) => void;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
}

export const ShelfSelect = ({
  shelfs,
  selectedShelf,
  onShelfChange,
  size = 'small',
  sx,
}: Props) => {
  return (
    <FormControl
      variant="outlined"
      size={size}
      sx={{
        ...sx,
        backgroundColor: 'common.white',
        borderRadius: '4px',
        minWidth: '120px',
        '& .MuiInputLabel-root': {
          color: 'text.primary',
        },
      }}
    >
      <InputLabel
        sx={{ color: 'text.primary', backgroundColor: 'common.white' }}
      >
        棚を選択
      </InputLabel>
      <Select
        value={selectedShelf?.id}
        onChange={(e) => {
          const newValue = Number(e.target.value);
          const newShelf = shelfs.find((shelf) => shelf.id === newValue);
          if (newShelf) {
            onShelfChange(newShelf);
          }
        }}
      >
        {/* shelfsから選択肢を生成 */}
        {shelfs.map((shelf) => (
          <MenuItem key={shelf.id} value={shelf.id}>
            <Typography color="text.primary">{shelf.display_name}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
