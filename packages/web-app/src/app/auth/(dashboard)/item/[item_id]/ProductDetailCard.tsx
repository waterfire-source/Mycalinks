import React from 'react';
import { Typography, Card, CardContent, Grid } from '@mui/material';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';

interface Props {
  product: BackendItemAPI[0]['response']['200']['items'][0]['products'][0];
}

const ProductDetailCard: React.FC<Props> = ({ product }) => {
  // genre1 が "appraisal_option" のタグをフィルタリング
  const appraisalOptionTags =
    product.tags?.filter((tag) => tag.genre1 === 'appraisal_option') ?? [];

  // genre1 が "appraisal_option" ではないタグをフィルタリング
  const nonAppraisalOptionTags =
    product.tags?.filter((tag) => tag.genre1 !== 'appraisal_option') ?? [];

  return (
    <Card
      sx={{
        mb: 1,
      }}
    >
      <Typography
        sx={{
          backgroundColor: 'grey.700',
          color: 'text.secondary',
          padding: '16px',
          textAlign: 'left',
          borderBottomRightRadius: '0',
          borderBottomLeftRadius: '0',
        }}
      >
        {product.product_code} : {product.displayNameWithMeta}
      </Typography>
      <CardContent sx={{ backgroundColor: 'common.white' }}>
        <Grid container spacing={1}>
          <Grid
            item
            xs={2}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {product?.image_url && (
              <img
                src={product.image_url}
                alt="Card"
                style={{ width: '50px', objectFit: 'cover' }}
              />
            )}
          </Grid>
          <Grid item xs={10}>
            <Typography>商品ID : {product.id}</Typography>
            <Typography>
              販売価格 : {product.sell_price?.toLocaleString()}円
            </Typography>
            <Typography>
              買取価格 : {product.buy_price?.toLocaleString()}円
            </Typography>
            <Typography>在庫数 : {product.stock_number ?? 0}枚</Typography>
            <Typography>
              コンディション : {product.conditions[0]?.option_name}
            </Typography>
            <Typography>
              鑑定結果 :{' '}
              {appraisalOptionTags.length > 0
                ? appraisalOptionTags.map((tag, index) => (
                    <span key={index}>
                      {tag.tag_name} ({tag.genre2})
                      {index < appraisalOptionTags.length - 1 && ', '}
                    </span>
                  ))
                : ''}
            </Typography>
            <Typography>
              タグ :{' '}
              {nonAppraisalOptionTags.length > 0
                ? nonAppraisalOptionTags.map((tag, index) => (
                    <span key={index}>
                      {tag.tag_name}
                      {index < nonAppraisalOptionTags.length - 1 && ', '}
                    </span>
                  ))
                : ''}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ProductDetailCard;
