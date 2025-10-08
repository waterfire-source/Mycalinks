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
  selectedGenreId: number | null | undefined;
  onSelect: (e: SelectChangeEvent) => void;
  inputLabel?: string;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
  disabled?: boolean;
}

export const GenreSelect = ({
  selectedGenreId,
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
        value={selectedGenreId ? selectedGenreId.toString() : ''}
        onChange={onSelect}
        disabled={disabled}
        label={inputLabel}
      >
        {/* "指定なし"オプション */}
        <MenuItem value="" sx={{ color: 'grey' }}>
          <Typography color="text.primary">指定なし</Typography>
        </MenuItem>

        {/* genre.itemGenresから選択肢を生成 */}
        {genre?.itemGenres.map((itemGenre) => (
          <MenuItem key={itemGenre.id} value={itemGenre.id}>
            <Typography color="text.primary">
              {itemGenre.display_name}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
