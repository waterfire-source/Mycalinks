import { Box, Card, CardMedia, Typography } from '@mui/material';
import { SearchItemDetail } from '@/components/modals/searchModal/SearchDetail';

interface Props {
  onItemClick: (item: SearchItemDetail) => void;
  items: SearchItemDetail[];
}

export const SearchResults = ({ onItemClick, items }: Props) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: '10px',
        gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
        alignContent: 'flex-start',
        justifyContent: 'flex-start',
        overflowY: 'auto',
        overflowX: 'hidden',
        flex: 1,
        maxHeight: '100%',
        margin: '0 auto', // 中央寄せ
      }}
      data-testid="search-results-container"
    >
      {items.map((item) => (
        <Box
          key={item.id}
          sx={{ display: 'flex', flexDirection: 'column', width: '60px' }}
          data-testid={`product-card-${item.id}`}
        >
          <Card
            sx={{
              marginBottom: '10px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '60px',
              height: '80px',
            }}
            onClick={() => onItemClick(item)}
            data-testid={`product-card-clickable-${item.id}`}
          >
            {item.image_url ? (
              <CardMedia
                component="img"
                sx={{
                  width: '60px',
                  height: '80px',
                  objectFit: 'contain',
                }}
                image={item.image_url ?? ''}
                alt={item.display_name ?? ''}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '150px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    width: '60px',
                    height: '80px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '10px',
                    textAlign: 'center',
                  }}
                >
                  {item.display_name || '名称未登録'}
                </Typography>
              </Box>
            )}
          </Card>
          <Typography
            sx={{
              fontSize: '10px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: '100%',
              padding: '0 5px',
            }}
          >
            {`${item.expansion || ''}${
              item.expansion && item.cardnumber ? ' ' : ''
            }${item.cardnumber || ''}`}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
