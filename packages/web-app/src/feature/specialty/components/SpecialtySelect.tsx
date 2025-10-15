import { Specialties } from '@/feature/specialty/hooks/useGetSpecialty';
import {
  FormControl,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent,
  Theme,
  SxProps,
  InputLabel,
} from '@mui/material';
interface Props {
  specialties: Specialties;
  selectedSpecialtyId: number | null | undefined;
  onSelect: (e: SelectChangeEvent) => void;
  inputLabel?: string;
  sx?: SxProps<Theme>;
  disabled?: boolean;
}

export const SpecialtySelect = ({
  selectedSpecialtyId,
  onSelect,
  inputLabel = '特殊状態',
  sx,
  disabled = false,
  specialties,
}: Props) => {
  if (specialties.length === 0) {
    return null;
  }
  return (
    <FormControl
      size="small"
      sx={{
        backgroundColor: 'common.white',
        ...sx,
      }}
    >
      <InputLabel sx={{ color: 'text.primary' }}>{inputLabel}</InputLabel>
      <Select
        value={selectedSpecialtyId?.toString() ?? ''}
        onChange={onSelect}
        disabled={disabled}
        label={inputLabel}
      >
        {/* "指定なし"オプション */}
        <MenuItem value="" sx={{ color: 'grey' }}>
          <Typography color="text.primary">指定なし</Typography>
        </MenuItem>

        {/* スペシャルティから選択肢を生成 */}
        {specialties.map((specialty) => (
          <MenuItem key={specialty.id} value={specialty.id}>
            {specialty.display_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
