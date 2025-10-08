import { Box, Card, CardContent, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Image from 'next/image';
import { UIGenre } from '@/app/auth/(dashboard)/settings/genre-and-category/components/AddGenreModalOpen';

interface GenreCardProps {
  genre: UIGenre;
  onSelect: (id: number) => void;
}

export const GenreCard = ({ genre, onSelect }: GenreCardProps) => {
  const isDisabled = genre.posGenre;
  return (
    <Card
      sx={{
        position: 'relative',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        border: genre.selected ? '2px solid #b82a2a' : '2px solid #e0e0e0',
        opacity: isDisabled ? 0.7 : 1,
        '&:hover': {
          boxShadow: isDisabled ? 'none' : '0 4px 8px rgba(0,0,0,0.1)',
        },
      }}
      onClick={() => {
        if (!isDisabled) {
          onSelect(genre.id);
        }
      }}
    >
      {genre.selected && (
        <CheckCircleIcon
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: '#b82a2a',
            zIndex: 1,
          }}
        />
      )}
      <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <Box
          sx={{
            width: 60,
            height: 80,
            bgcolor: '#f5f5f5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 1,
            mr: 2,
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {genre.single_genre_image ? (
            <Image
              src={genre.single_genre_image}
              alt={genre.display_name}
              width={60}
              height={80}
              style={{
                objectFit: 'contain',
                width: 'auto',
              }}
            />
          ) : (
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ textAlign: 'center' }}
            >
              No Image
            </Typography>
          )}
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: isDisabled ? 'text.disabled' : 'text.primary',
          }}
        >
          {genre.display_name}
        </Typography>
      </CardContent>
    </Card>
  );
};
