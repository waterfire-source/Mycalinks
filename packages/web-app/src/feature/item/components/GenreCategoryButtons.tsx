import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useStore } from '@/contexts/StoreContext';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { isOriginalProductCategory } from '@/feature/item/utils';

interface Props {
  onChange: (categoryId?: number, genreId?: number) => void;
  notDisplayOriginalProductCategory?: boolean; // オリパや福袋などは表示しない
}

export const GenreCategoryButtons: React.FC<Props> = ({
  onChange,
  notDisplayOriginalProductCategory,
}) => {
  const { store } = useStore();
  const { category, fetchCategoryList } = useCategory();
  const { genre, fetchGenreList } = useGenre();

  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    undefined,
  );
  const [selectedGenre, setSelectedGenre] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    if (store) {
      fetchGenreList();
      fetchCategoryList();
    }
  }, [store]);

  useEffect(() => {
    onChange(selectedCategory, selectedGenre);
  }, [selectedCategory, selectedGenre]);

  const CategoryButtons = useCallback(() => {
    return (
      <>
        <SecondaryButton
          key="root-category"
          variant="contained"
          onClick={() => {
            setSelectedCategory(undefined);
          }}
          sx={{
            backgroundColor: !selectedCategory ? 'grey.700' : 'grey.300',
            color: !selectedCategory ? 'text.secondary' : 'grey.700',
            whiteSpace: 'nowrap',
            height: '30px',
            width: 'auto',
            minWidth: 'auto',
          }}
        >
          全て
        </SecondaryButton>
        {category?.itemCategories
          .filter(
            (cat) =>
              !notDisplayOriginalProductCategory ||
              !isOriginalProductCategory(cat.handle),
          )
          .map((cat) => (
            <SecondaryButton
              key={cat.id}
              variant="contained"
              onClick={() => {
                setSelectedCategory(cat.id);
              }}
              sx={{
                backgroundColor:
                  selectedCategory === cat.id ? 'grey.700' : 'grey.300',
                color:
                  selectedCategory === cat.id ? 'text.secondary' : 'grey.700',
                whiteSpace: 'nowrap',
                height: '30px',
                width: 'auto',
                minWidth: 'auto',
              }}
            >
              {cat.display_name}
            </SecondaryButton>
          ))}
      </>
    );
  }, [category, selectedCategory]);

  const GenreButtons = useCallback(() => {
    return (
      <>
        <SecondaryButton
          key="root-genre"
          variant="contained"
          onClick={() => {
            setSelectedGenre(undefined);
          }}
          sx={{
            backgroundColor: !selectedGenre ? 'grey.700' : 'grey.300',
            color: !selectedGenre ? 'text.secondary' : 'grey.700',
            whiteSpace: 'nowrap',
            height: '30px',
            width: 'auto',
            minWidth: 'auto',
          }}
        >
          全て
        </SecondaryButton>
        {genre?.itemGenres.map((gen) => (
          <SecondaryButton
            key={gen.id}
            variant="contained"
            onClick={() => {
              setSelectedGenre(gen.id);
            }}
            sx={{
              backgroundColor:
                selectedGenre === gen.id ? 'grey.700' : 'grey.300',
              color: selectedGenre === gen.id ? 'text.secondary' : 'grey.700',
              whiteSpace: 'nowrap',
              height: '30px',
              width: 'auto',
              minWidth: 'auto',
            }}
          >
            {gen.display_name}
          </SecondaryButton>
        ))}
      </>
    );
  }, [genre, selectedGenre]);

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        flexShrink: 0,
        flexDirection: 'column',
      }}
    >
      {/* ジャンルボタン */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingX: '10px',
          backgroundColor: 'grey.100',
          flexWrap: 'nowrap',
          // overflowX: 'auto',
          width: '100%',
        }}
      >
        <Typography noWrap sx={{ minWidth: 'fit-content' }}>
          ジャンル
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: '10px',
            backgroundColor: 'grey.100',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            flexGrow: 1,
            gap: '10px',
          }}
        >
          <GenreButtons />
        </Box>
      </Box>
      {/* カテゴリボタン */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          backgroundColor: 'grey.100',
          paddingX: '10px',
          flexWrap: 'nowrap',
          width: '100%',
        }}
      >
        <Typography noWrap sx={{ minWidth: 'fit-content' }}>
          カテゴリ
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: '10px',
            backgroundColor: 'grey.100',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            flexGrow: 1,
            gap: '10px',
          }}
        >
          <CategoryButtons />
        </Box>
      </Box>
    </Box>
  );
};
