import { useEffect, useState } from 'react';
import { Box, Grid, IconButton, Stack, Typography } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useAlert } from '@/contexts/AlertContext';
import { useGuestOrderCart } from '@/contexts/GuestOrderCartContext';
import NumericTextField from '@/components/inputFields/NumericTextField';
import PrimaryIconButton from '@/components/buttons/PrimaryIconButton';
import { ProductItem } from '@/app/guest/[storeId]/stock/components/ProductItem';

interface ProductCardProps {
  product: ProductItem['products'][number];
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { cartItems, addToCart } = useGuestOrderCart();
  const [quantity, setQuantity] = useState(0);
  const { setAlertState } = useAlert();

  useEffect(() => {
    const cartItem = cartItems.find((item) => item.id === product.id);
    setQuantity(cartItem ? cartItem.quantity : 0);
  }, [cartItems, product.id]);

  const handleIncrease = () => {
    setQuantity((prev) =>
      Math.min(
        prev + 1,
        Math.min(product.stock_number, product.tablet_limit_count ?? Infinity),
      ),
    ); // 在庫を超えないように制御
  };

  const handleDecrease = () => {
    setQuantity((prev) => {
      return Math.max(0, prev - 1);
    }); // 0未満にならないように制御
  };

  const handleChange = (value: string | number) => {
    const newValue = Number(value);
    if (!isNaN(newValue)) {
      setQuantity(
        Math.min(
          Math.max(0, newValue),
          Math.min(
            product.stock_number,
            product.tablet_limit_count ?? Infinity,
          ),
        ),
      ); // 0以上 `stock_number` 以下に制御
    }
  };

  const handleAddToCart = () => {
    addToCart(
      product.id,
      quantity,
      product.actual_sell_price ?? 0,
      product.display_name,
      product.image_url,
      product.condition_option_display_name,
      Math.min(product.stock_number, product.tablet_limit_count ?? Infinity),
    );

    setAlertState({
      message: `${product.display_name}の${product.condition_option_display_name}を${quantity}枚カートに追加しました。`,
      severity: 'success',
    });
  };

  return (
    <Grid item xs={12}>
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          border: '2px solid',
          borderRadius: '8px',
          p: 2,
          boxShadow: 3,
          height: '60px',
          justifyContent: 'space-between',
          color: product.stock_number === 0 ? 'grey.700' : 'inherit',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* 商品情報 */}
          <Grid item xs={6}>
            <Typography
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'nowrap',
                gap: '8px',
              }}
            >
              <Box component="span" sx={{ fontWeight: 'bold' }}>
                {`【${product.condition_option_display_name}】 ${
                  product.specialty__display_name ?? ''
                }`}
              </Box>
              <Box
                component="span"
                sx={{
                  color:
                    product.stock_number === 0 ? 'grey.700' : 'primary.main',
                  fontWeight: 'bold',
                }}
              >
                {product.actual_sell_price?.toLocaleString()} 円
              </Box>
              {product.stock_number === 0
                ? '在庫 なし'
                : product.item_infinite_stock
                ? '在庫 ∞'
                : `在庫 ${product.stock_number} 枚`}
              {product?.tablet_limit_count !== undefined && (
                <Typography>
                  注文可能数: {product.tablet_limit_count} 枚
                </Typography>
              )}
            </Typography>
          </Grid>

          {/* 数量と操作ボタン */}
          {product.stock_number > 0 && (
            <Grid item xs={6}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="flex-end"
              >
                <IconButton onClick={handleDecrease} size="small">
                  <Remove fontSize="inherit" />
                </IconButton>
                <NumericTextField
                  value={quantity}
                  onChange={(value) => handleChange(value)}
                  InputProps={{
                    inputProps: {
                      style: {
                        textAlign: 'right',
                        width: '80px',
                      },
                      min: 0,
                      max: product.item_infinite_stock
                        ? undefined
                        : product.stock_number,
                    },
                  }}
                  size="small"
                />
                <IconButton onClick={handleIncrease} size="small">
                  <Add fontSize="inherit" />
                </IconButton>
                <PrimaryIconButton
                  type="submit"
                  icon={<AddShoppingCartIcon />}
                  onClick={handleAddToCart}
                  disabled={quantity <= 0}
                />
              </Stack>
            </Grid>
          )}
        </Grid>
      </Box>
    </Grid>
  );
};
