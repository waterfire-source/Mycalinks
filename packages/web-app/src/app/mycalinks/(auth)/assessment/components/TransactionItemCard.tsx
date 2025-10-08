import { TransactionCart } from '@/app/mycalinks/(auth)/assessment/types/assessment';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  item: TransactionCart;
  onQuantityChange: (item: TransactionCart) => void;
}

/**
 * 取引商品カードコンポーネント
 */
export function TransactionItemCard({ item, onQuantityChange }: Props) {
  // 単価計算
  const totalUnitPrice =
    (item.unit_price || 0) +
    (item.discount_price || 0) +
    (item.sale_discount_price || 0);

  const itemTotalPrice = totalUnitPrice * item.item_count;

  return (
    <Box
      display="flex"
      width="100%"
      sx={{
        flex: 1,
        backgroundColor: 'rgba(248,248,248,1)',
        borderBottom: '1px solid #e0e0e0',
        position: 'relative',
        pb: 0.5,
      }}
    >
      {/* 商品画像 */}
      <Box
        component="img"
        src={item.product__image_url || ''}
        alt={item.product__display_name}
        sx={{
          height: '100%',
          width: '13%',
          objectFit: 'contain',
        }}
      />

      {/* 商品情報 */}
      <Box
        display="flex"
        sx={{
          flex: 1,
          height: '100%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          mx: '3%',
        }}
      >
        <Typography fontWeight="bold" fontSize="14px!important">
          {item.product__display_name} ({item.item_expansion}{' '}
          {item.item_cardnumber} {item.item_rarity})
        </Typography>

        <Typography fontSize="12px!important" color="grey.600">
          状態:{' '}
          {item.product__conditions
            ? item.product__conditions[0]?.condition_option__display_name
            : null}
        </Typography>
        {item.product__specialty__display_name && (
          <Typography fontSize="12px" color="grey.600">
            {item.product__specialty__display_name}
          </Typography>
        )}

        <Box display="flex">
          <Typography fontSize="12px!important" color="grey.600" mr={1}>
            ¥{totalUnitPrice?.toLocaleString()}
          </Typography>
          <Typography fontSize="12px!important" color="grey.600">
            数量: {item.item_count}
          </Typography>
        </Box>
      </Box>

      {/* 右側のボタンと金額 */}
      <Box
        sx={{
          width: '30%',
          height: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Button
          variant="contained"
          size="small"
          onClick={() => onQuantityChange(item)}
          sx={{
            backgroundColor: 'primary.main',
            width: '100%',
            borderRadius: '5px',
            padding: '5px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          枚数変更
        </Button>

        <Typography fontWeight="bold" fontSize="20px!important">
          ¥{itemTotalPrice.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
}
