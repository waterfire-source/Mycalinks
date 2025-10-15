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
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
import {
  Specialties,
  useGetSpecialty,
} from '@/feature/specialty/hooks/useGetSpecialty';

interface Props {
  setProductSearchState: React.Dispatch<
    React.SetStateAction<ProductSearchState>
  >;
  specialties?: Specialties;
  formControlSx?: SxProps<Theme>;
}

export const SpecialtyFilter = ({
  setProductSearchState,
  formControlSx,
}: Props) => {
  const { specialties, fetchSpecialty } = useGetSpecialty();
  useEffect(() => {
    fetchSpecialty();
  }, []);
  const [selectValue, setSelectValue] = useState<string>('all');
  const handleSpecialtyStateChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectValue(value);

    const specialtyId = specialties.find((s) => s.id === Number(value))?.id;

    setProductSearchState((prev) => ({
      ...prev,
      specialtyId:
        value === 'all' ? undefined : value === 'none' ? false : specialtyId,
      resetPage: true,
    }));
  };

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
        <MenuItem value="all">すべて</MenuItem>
        <MenuItem value="none">なし</MenuItem>
        {specialties.map((specialty) => (
          <MenuItem key={specialty.id} value={specialty.id}>
            {specialty.display_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
