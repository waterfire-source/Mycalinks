import React, { ReactNode } from 'react';
import { Box, styled, Typography, useMediaQuery } from '@mui/material';
import theme from '@/theme';
import { ItemImage } from '@/feature/item/components/ItemImage';

interface ProductDetailProps {
  imageUrl: string;
  title: string;
  condition?: string;
  rarity?: string;
  price?: number;
  total_unit_price?: number;
  discountPrice?: number | null;
  quantity?: number;
  customerSideQuantity?: number;
  sellPrice?: number;
  buyPrice?: number;
  children?: ReactNode;
  genre?: string;
  category?: string;
  specialty?: string;
  managementNumber?: string;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  imageUrl,
  title,
  condition,
  rarity,
  price,
  total_unit_price,
  discountPrice,
  quantity,
  customerSideQuantity,
  sellPrice,
  buyPrice,
  children,
  genre,
  category,
  specialty,
  managementNumber,
}) => {
  const isQuantityDifferent =
    quantity !== undefined &&
    customerSideQuantity !== undefined &&
    quantity !== customerSideQuantity;
  const textColor = isQuantityDifferent ? 'primary.main' : 'text.primary';

  const StyledTypography = styled(Typography)(({ theme }) => ({
    fontSize: isMobile ? '10px' : theme.typography.body2.fontSize,
    color: textColor,
  }));

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', boxShadow: 'none' }}>
        <Box sx={{ width: isMobile ? 40 : 50, mr: 2 }}>
          <ItemImage imageUrl={imageUrl} />
        </Box>
        <Box sx={{ boxShadow: 'none' }}>
          <StyledTypography>{title}</StyledTypography>
          {/* conditionが存在する場合にのみ表示 */}
          {condition && <StyledTypography>状態: {condition}</StyledTypography>}
          {/* 特殊状態が存在する場合にのみ表示 */}
          {specialty && (
            <StyledTypography>特殊状態: {specialty}</StyledTypography>
          )}
          {/* 管理番号が存在する場合にのみ表示 */}
          {managementNumber && (
            <StyledTypography>管理番号: {managementNumber}</StyledTypography>
          )}

          {/* genre と category の両方が存在する場合のみ表示 ✅ */}
          {genre && category && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
              }}
            >
              <StyledTypography
                variant="caption"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'grey.300',
                  borderRadius: '2px',
                  p: '2px',
                }}
              >
                {genre}
              </StyledTypography>
              <Typography
                variant="caption"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {'>'}
              </Typography>
              <StyledTypography
                variant="caption"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'grey.300',
                  borderRadius: '2px',
                  p: '2px',
                }}
              >
                {category}
              </StyledTypography>
            </Box>
          )}

          {/* rarityが存在する場合にのみ表示 */}
          {rarity && <StyledTypography>レアリティ: {rarity}</StyledTypography>}
          {/* sellPriceとbuyPriceが存在する場合に表示 */}
          {(sellPrice !== undefined || buyPrice !== undefined) && (
            <StyledTypography>
              売買/買取: ¥{sellPrice?.toLocaleString() || '---'} / ¥
              {buyPrice?.toLocaleString() || '---'}
            </StyledTypography>
          )}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {/* priceが存在する場合にのみ表示 */}
            {price !== undefined && (
              <StyledTypography>
                ¥
                {discountPrice
                  ? (price + discountPrice).toLocaleString()
                  : price.toLocaleString()}
              </StyledTypography>
            )}
            {/* total_unit_priceが存在する場合にのみ表示 */}
            {total_unit_price !== undefined && (
              <StyledTypography>
                (合計：¥
                {total_unit_price.toLocaleString()})
              </StyledTypography>
            )}
            {/* discountPriceが存在し、かつ0でない場合にのみ表示 */}
            {discountPrice && discountPrice !== 0 ? (
              <StyledTypography>
                {
                  discountPrice >= 0
                    ? `(うち割増￥${discountPrice.toLocaleString()})` // 正の数の場合
                    : `(うち割引￥${discountPrice.toLocaleString()})` // 負の数の場合
                }
              </StyledTypography>
            ) : null}
            {/* quantityが存在する場合にのみ表示 */}
            {quantity !== undefined && (
              <StyledTypography>
                数量 {quantity}{' '}
                {isQuantityDifferent &&
                  customerSideQuantity !== undefined &&
                  ` > ${customerSideQuantity}`}
              </StyledTypography>
            )}
          </Box>
        </Box>
      </Box>
      {children}
    </Box>
  );
};
