import { useListSuppliers } from '@/feature/stock/hooks/useListSuppliers';
import { MenuItem, Select } from '@mui/material';
import { useEffect } from 'react';

interface Props {
  supplierID: number | null;
  setSupplierID: (id: number) => void;
  isReadOnly?: boolean;
  disabled?: boolean;
}
export const SupplierSelect = ({
  supplierID,
  setSupplierID,
  isReadOnly = false,
  disabled = false,
}: Props) => {
  const { suppliers, listSuppliers } = useListSuppliers();
  useEffect(() => {
    listSuppliers();
  }, [listSuppliers]);
  return (
    <Select
      disabled={disabled}
      sx={{ width: '70%' }}
      value={supplierID ?? ''}
      size="small"
      readOnly={isReadOnly}
    >
      {suppliers.map((s) => (
        <MenuItem key={s.id} onClick={() => setSupplierID(s.id)} value={s.id}>
          {s.display_name}
        </MenuItem>
      ))}
    </Select>
  );
};
