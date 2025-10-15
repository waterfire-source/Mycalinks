import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { CheckCircleOutline } from '@mui/icons-material';
import { Stack } from '@mui/material';
import { Inventory_Shelf } from '@prisma/client';

interface ShelfButtonsProps {
  shelfs: Inventory_Shelf[];
  selectedShelfId: number | 'all';
  onShelfChange: (shelfId: number | 'all') => void;
  isGrid?: boolean;
  noneAll?: boolean;
}

export function ShelfButtons({
  shelfs,
  selectedShelfId,
  onShelfChange,
  isGrid = false,
  noneAll = false,
}: ShelfButtonsProps) {
  return (
    <Stack
      direction="row"
      gap={2}
      whiteSpace={isGrid ? 'normal' : 'nowrap'}
      overflow={isGrid ? 'inherit' : 'auto'}
      flexWrap={isGrid ? 'wrap' : 'nowrap'}
    >
      {!noneAll && (
        <SecondaryButtonWithIcon
          key="all"
          onClick={() => onShelfChange('all')}
          selected={selectedShelfId === 'all'}
          icon={selectedShelfId === 'all' && <CheckCircleOutline />}
        >
          すべて
        </SecondaryButtonWithIcon>
      )}
      {shelfs.map((shelf, index) => (
        <SecondaryButtonWithIcon
          key={index}
          onClick={() => onShelfChange(shelf.id)}
          selected={selectedShelfId === shelf.id}
          icon={selectedShelfId === shelf.id && <CheckCircleOutline />}
        >
          {shelf.display_name}
        </SecondaryButtonWithIcon>
      ))}
    </Stack>
  );
}
