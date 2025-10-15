import { useStore } from '@/contexts/StoreContext';
import { MenuItem, Select } from '@mui/material';

interface Props {
  storeID: number | null;
  setStoreID: (id: number) => void;
}
export const StoreSelect = ({ storeID, setStoreID }: Props) => {
  const { stores } = useStore();

  return (
    <Select sx={{ width: '70%' }} value={storeID ?? ''} size="small">
      {stores.map((s) => (
        <MenuItem key={s.id} onClick={() => setStoreID(s.id)} value={s.id}>
          {s.display_name}
        </MenuItem>
      ))}
    </Select>
  );
};
