import React from 'react';
import { Box, Card, CardMedia, Typography, Tooltip } from '@mui/material';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';

interface Props {
  onItemClick: (item: BackendItemAPI[0]['response']['200']['items'][0]) => void;
  items: BackendItemAPI[0]['response']['200']['items'];
}

const CardSearchResults: React.FC<Props> = ({ onItemClick, items }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '10px',
        height: '100%',
        alignContent: 'flex-start',
        justifyContent: 'flex-start',
        overflowY: 'auto',
        flex: 1,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gap: '10px',
          gridTemplateColumns: 'repeat(10, 1fr)',
        }}
      >
        {items.map((item) => (
          <Box
            key={item.products[0].id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
            }}
          >
            <Card
              sx={{
                marginBottom: '10px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                aspectRatio: '1 / 1.5',
              }}
              onClick={() => onItemClick(item)}
            >
              {item.image_url ? (
                <CardMedia
                  component="img"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  image={item.image_url}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'grey.300',
                  }}
                >
                  <Typography variant="body2">
                    {item.products[0]?.displayNameWithMeta || '名称未登録'}
                  </Typography>
                </Box>
              )}
            </Card>
            <Tooltip
              title={item.products[0]?.displayNameWithMeta || '名称未登録'}
            >
              <Typography
                sx={{
                  fontSize: '10px',
                  whiteSpace: 'normal',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  height: 'auto',
                  width: '100%',
                }}
              >
                {`${item.expansion || ''}${
                  item.expansion && item.cardnumber ? ' ' : ''
                }${item.cardnumber || ''}`}
              </Typography>
            </Tooltip>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CardSearchResults;
