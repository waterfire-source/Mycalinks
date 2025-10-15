import { formatPrice } from '@/app/ec/(core)/utils/price';
import { Box, Container, Stack, Typography } from '@mui/material';
import Image from 'next/image';

type Props = {
  product: {
    name: string;
    cardNumber: string;
    rarity: string;
    imageUrl: string;
    price: number | null;
  };
  isScrollHeader?: boolean;
  isVisible?: boolean;
};

export const ProductSummaryCard = ({
  product,
  isScrollHeader = false,
  isVisible = true,
}: Props) => {
  const { name, cardNumber, rarity, imageUrl, price } = product;

  const scrollHeaderStyle = isScrollHeader
    ? {
        position: 'fixed',
        top: '64px',
        left: 0,
        right: 0,
        zIndex: 1000,
        bgcolor: 'white',
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease-in-out',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }
    : {};

  const Content = () => (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        py: 1,
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '60px',
          height: '60px',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          style={{ objectFit: 'contain' }}
        />
      </Box>
      <Stack sx={{ flex: 1 }}>
        <Typography variant="h5" fontWeight="bold">
          {name}
        </Typography>
        <Typography>
          {cardNumber} {rarity}
        </Typography>
        {price !== null && (
          <Typography color="primary.main" fontWeight="bold">
            {formatPrice(price)}円
          </Typography>
        )}
      </Stack>
    </Stack>
  );

  return (
    <Box sx={scrollHeaderStyle}>
      {isScrollHeader ? (
        <Container maxWidth="md">
          <Content />
        </Container>
      ) : (
        <Content />
      )}
    </Box>
  );
};
