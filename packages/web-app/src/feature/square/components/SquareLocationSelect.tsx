import { useSquareLocations } from '@/feature/square/hooks/useSquareLocations';
import { Select, MenuItem } from '@mui/material';
import { useEffect } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}
export const SquareLocationSelect = ({ value, onChange }: Props) => {
  const { locations, fetchLocations } = useSquareLocations();
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
    >
      <MenuItem value="">Squareロケーションを選択してください</MenuItem>
      {locations.map((location) => (
        <MenuItem key={location.id} value={location.id}>
          {location.name}
        </MenuItem>
      ))}
    </Select>
  );
};
