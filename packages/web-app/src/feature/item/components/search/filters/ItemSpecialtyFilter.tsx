import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  SxProps,
  Theme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useGetSpecialty } from '@/feature/specialty/hooks/useGetSpecialty';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { TableRow } from '@/feature/item/components/search/ItemSearchLayout';

interface Props {
  setItemSearchState: React.Dispatch<React.SetStateAction<ItemSearchState>>;
  setTableData?: React.Dispatch<React.SetStateAction<TableRow[]>>;
  formControlSx?: SxProps<Theme>;
}

export const ItemSpecialtyFilter = ({ setTableData, formControlSx }: Props) => {
  const { specialties, fetchSpecialty } = useGetSpecialty();
  useEffect(() => {
    fetchSpecialty();
  }, []);

  const [selectValue, setSelectValue] = useState<string>('all');
  const handleSpecialtyStateChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectValue(value);
  };

  useEffect(() => {
    if (setTableData) {
      setTableData((prev) =>
        prev.map((p) => ({
          ...p,
          selectedSpecialtyId:
            selectValue === 'all' ? undefined : Number(selectValue),
        })),
      );
    }
  }, [selectValue]);

  return (
    <FormControl size="small" sx={{ minWidth: 100, ...formControlSx }}>
      <InputLabel sx={{ color: 'black' }} shrink>
        特殊状態
      </InputLabel>
      <Select
        value={selectValue}
        onChange={handleSpecialtyStateChange}
        label="特殊状態"
      >
        <MenuItem value="all">なし</MenuItem>
        {specialties.map((specialty) => (
          <MenuItem key={specialty.id} value={specialty.id}>
            {specialty.display_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
