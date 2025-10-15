'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import Image from 'next/image';
import { MycaAppGenre } from 'backend-core';

interface CategorySelectModalProps {
  open: boolean;
  onClose: () => void;
  genres: MycaAppGenre[];
  onSelect: (genre: MycaAppGenre) => void;
}

interface CategoryCardProps {
  genre: MycaAppGenre;
  onClick: () => void;
}

const CategoryCard = ({ genre, onClick }: CategoryCardProps) => {
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = '/images/ec/noimage.png';
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: 160,
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0px 4px 20px rgba(0,0,0,0.12)',
          transform: 'translateY(-4px)',
        },
        border: '1px solid #e0e0e0',
        borderRadius: 2,
      }}
      onClick={onClick}
    >
      <CardMedia
        sx={{
          height: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#fafafa',
        }}
      >
        <Image
          src={genre.single_genre_image || '/images/ec/noimage.png'}
          alt={genre.display_name}
          width={80}
          height={80}
          style={{ objectFit: 'contain' }}
          onError={handleImageError}
        />
      </CardMedia>
      <CardContent sx={{ p: 2, height: 60 }}>
        <Typography
          variant="body2"
          component="div"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {genre.display_name}
        </Typography>
      </CardContent>
    </Card>
  );
};

export const CategorySelectModal = ({
  open,
  onClose,
  genres,
  onSelect,
}: CategorySelectModalProps) => {
  const handleCategorySelect = (genre: MycaAppGenre) => {
    onSelect(genre);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          カテゴリを選択してください
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'grey.500',
            '&:hover': { bgcolor: 'grey.100' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, textAlign: 'center' }}
        >
          検索するカテゴリを選択してください
        </Typography>

        <Grid container spacing={2}>
          {genres.map((genre) => (
            <Grid item xs={6} sm={4} md={3} key={genre.id}>
              <CategoryCard
                genre={genre}
                onClick={() => handleCategorySelect(genre)}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
