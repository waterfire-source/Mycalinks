import { useCashRegister } from '@/feature/cashRegister/hooks/useCashRegister';
import { useStore } from '@/contexts/StoreContext';
import { MenuItem, Select, SxProps } from '@mui/material';
import { useEffect } from 'react';

interface Props {
  cashRegisterId: number | null;
  setCashRegisterId: (value: number | null) => void;
  sx?: SxProps;
}
export const SelectRegister = ({
  cashRegisterId,
  setCashRegisterId,
  sx,
}: Props) => {
  const { cashRegisters, fetchCashRegisterList } = useCashRegister();
  const { store } = useStore();
  useEffect(() => {
    fetchCashRegisterList(store.id, true);
  }, [fetchCashRegisterList, store.id]);
  useEffect(() => {
    setCashRegisterId(cashRegisters?.[0]?.id ?? null);
  }, [cashRegisters, setCashRegisterId]);
  return (
    <Select
      size="small"
      sx={{ ...sx }}
      value={cashRegisterId}
      onChange={(e) => {
        if (e.target.value === '') {
          setCashRegisterId(null);
        } else {
          setCashRegisterId(Number(e.target.value));
        }
      }}
    >
      {cashRegisters?.map((cashRegister) => (
        <MenuItem key={cashRegister.id} value={cashRegister.id}>
          {cashRegister.display_name}
        </MenuItem>
      ))}
    </Select>
  );
};
