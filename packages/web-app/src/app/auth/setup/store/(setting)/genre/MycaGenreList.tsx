import { useStore } from '@/contexts/StoreContext';
import { useAppGenre } from '@/feature/genre/hooks/useAppGenre';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { Box, Grid, Stack, Chip } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import { ItemText } from '@/feature/item/components/ItemText';
import {
  GenreImportSelectionModal,
  getOptionDisplayName,
} from '@/app/auth/setup/store/(setting)/genre/GenreImportSelectionModal';
import { SelectionOption } from '@/app/auth/setup/store/(setting)/genre/page';

// 選択オプションの型定義

interface Props {
  width: string;
  selectedGenreIds: number[];
  setSelectedGenreIds: Dispatch<SetStateAction<number[]>>;
  genreSelections: Map<number, SelectionOption>;
  setGenreSelections: Dispatch<SetStateAction<Map<number, SelectionOption>>>;
}

export const MycaGenreList = ({
  width,
  selectedGenreIds,
  setSelectedGenreIds,
  genreSelections,
  setGenreSelections,
}: Props) => {
  const { appGenre, fetchAppGenreList } = useAppGenre();
  const { store } = useStore();

  // 選択肢モーダルの状態
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [editingGenreId, setEditingGenreId] = useState<number | null>(null);
  const [selectedGenreName, setSelectedGenreName] = useState<string>('');

  useEffect(() => {
    fetchAppGenreList(store.id);
  }, [fetchAppGenreList, store.id]);

  const handleGenreClick = (id: number, genreName: string) => {
    // 既に選択されている場合は選択を解除
    if (selectedGenreIds.includes(id)) {
      setSelectedGenreIds((prev) => prev.filter((genreId) => genreId !== id));
      setGenreSelections((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    } else {
      // 新規選択の場合は選択肢モーダルを開く
      setEditingGenreId(id);
      setSelectedGenreName(genreName);
      setIsOptionModalOpen(true);
    }
  };

  // 選択肢モーダルでオプションを選択した時の処理
  const handleOptionSelect = (option: SelectionOption) => {
    if (editingGenreId === null) return;

    setSelectedGenreIds((prev) => [...prev, editingGenreId]);
    setGenreSelections((prev) => new Map(prev.set(editingGenreId, option)));
    setIsOptionModalOpen(false);
    setEditingGenreId(null);
    setSelectedGenreName('');
  };

  // 画像URLのチェック
  const isValidHttpUrl = (src: string | null | undefined): boolean => {
    if (!src) return false;
    return src.startsWith('http://') || src.startsWith('https://');
  };

  return (
    <>
      <Grid container spacing={2} width={width}>
        {appGenre?.appGenres.map((genre) => (
          <Grid item xs={3} key={genre.id}>
            <Stack
              onClick={() => handleGenreClick(genre.id, genre.display_name)}
              sx={{
                width: '100%',
                minHeight: '120px',
                height: 'auto',
                borderRadius: '8px',
                p: 2,
                border: '1px solid',
                borderColor: selectedGenreIds.includes(genre.id)
                  ? 'primary.main'
                  : 'grey.300',
                justifyContent: 'start',
                alignItems: 'center',
                position: 'relative',
                cursor: 'pointer',
              }}
              direction="row"
              gap={2}
            >
              {selectedGenreIds.includes(genre.id) && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: 'primary.main',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 1,
                  }}
                >
                  <CheckIcon sx={{ color: 'white', fontSize: 18 }} />
                </Box>
              )}
              <Box width={50} height={70} sx={{ flexShrink: 0 }}>
                <ItemImage imageUrl={genre.single_genre_image} height={70} />
              </Box>
              <Stack sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ mb: 1 }}>
                  <ItemText text={genre.display_name} />
                </Box>
                {selectedGenreIds.includes(genre.id) &&
                  genreSelections.has(genre.id) && (
                    <Chip
                      label={getOptionDisplayName(
                        genreSelections.get(genre.id)!,
                      )}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{
                        fontSize: '0.65rem',
                        height: '22px',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        '& .MuiChip-label': {
                          px: 0.5,
                          fontSize: '0.65rem',
                          lineHeight: 1,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        },
                      }}
                    />
                  )}
              </Stack>
            </Stack>
          </Grid>
        ))}
      </Grid>

      {/* 選択肢モーダル */}
      <GenreImportSelectionModal
        open={isOptionModalOpen}
        onClose={() => {
          setIsOptionModalOpen(false);
          setEditingGenreId(null);
          setSelectedGenreName('');
        }}
        onOptionSelect={handleOptionSelect}
        genreName={selectedGenreName}
      />
    </>
  );
};
