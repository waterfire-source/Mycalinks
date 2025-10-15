import { useGenre } from '@/feature/genre/hooks/useGenre';
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
import { useEffect } from 'react';
interface Props {
  selectedGenreHandle: string | null | undefined;
  onSelect: (e: SelectChangeEvent) => void;
  inputLabel?: string;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
  disabled?: boolean;
}

export const GenreHandleSelect = ({
  selectedGenreHandle,
  onSelect,
  inputLabel,
  size = 'small',
  sx,
  disabled = false,
}: Props) => {
  const { genre, fetchGenreList } = useGenre();
  useEffect(() => {
    fetchGenreList();
  }, [fetchGenreList]);

  // 独自ジャンルを除外
  const filteredGenre = genre?.itemGenres.filter(
    (itemGenre) => itemGenre.handle !== null,
  );

  return (
    <FormControl
      variant="outlined"
      size={size}
      sx={{
        ...sx,
        '& .MuiInputLabel-root': {
          color: 'text.primary',
        },
      }}
    >
      {inputLabel && (
        <InputLabel sx={{ color: 'text.primary' }}>{inputLabel}</InputLabel>
      )}
      <Select
        value={selectedGenreHandle || ''}
        onChange={onSelect}
        disabled={disabled}
        label={inputLabel}
      >
        {/* genre.itemGenresから選択肢を生成 */}
        {filteredGenre?.map((itemGenre) => (
          <MenuItem key={itemGenre.id} value={itemGenre.handle || ''}>
            <Typography color="text.primary">
              {itemGenre.display_name}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
