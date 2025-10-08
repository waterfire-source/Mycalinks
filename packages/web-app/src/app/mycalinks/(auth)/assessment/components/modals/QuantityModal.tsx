import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  TextField,
} from '@mui/material';
import { ModifiedTransactionCart } from '@/app/mycalinks/(auth)/assessment/types/assessment';

interface Props {
  open: boolean;
  onClose: () => void;
  item: ModifiedTransactionCart;
  onConfirm: (quantity: number) => void;
}
//数量変更モーダル
export const QuantityModal = ({ open, onClose, item, onConfirm }: Props) => {
  const [quantity, setQuantity] = useState<number>(0);

  useEffect(() => {
    setQuantity(item?.item_count);
  }, [item?.item_count]);

  const handleQuantityChange = (change: number) => {
    setQuantity((prevQuantity) =>
      Math.min(item.max_item_count ?? 0, Math.max(0, prevQuantity + change)),
    );
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const numValue = parseInt(value, 10);

    // 空文字列または数値の場合のみ処理
    if (value === '' || !isNaN(numValue)) {
      if (value === '') {
        setQuantity(0);
      } else {
        // 最大値と最小値の制限を適用
        const clampedValue = Math.min(
          item.max_item_count ?? 0,
          Math.max(0, numValue),
        );
        setQuantity(clampedValue);
      }
    }
  };

  const handleConfirm = () => {
    onConfirm(quantity);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '15px!important',
          textAlign: 'center',
          py: 1,
        }}
      >
        買取枚数変更
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: 3,
          py: 2,
          overflow: 'auto',
          maxHeight: 'calc(100vh - 120px)', // スマホのキーボード表示を考慮
          minHeight: '250px', // 最小高さを設定
          // スマホでのキーボード表示時のスクロール改善
          '@media (max-height: 600px)': {
            maxHeight: 'calc(100vh - 80px)',
          },
        }}
      >
        {item && (
          <>
            <Box
              sx={{
                display: 'flex',
                width: '100%',
                mb: 2,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                component="img"
                src={item.product__image_url || ''}
                alt={item.product__display_name}
                sx={{
                  width: '25%',
                  aspectRatio: '0.71',
                  objectFit: 'contain',
                }}
              />
              <Box
                sx={{
                  width: '70%',
                  ml: '5%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Typography sx={{ fontSize: '14px!important' }}>
                  {item.product__display_name}
                </Typography>
                <Typography fontSize="14px!important">
                  ({item.item_expansion} {item.item_cardnumber}{' '}
                  {item.item_rarity})
                </Typography>
                <Typography sx={{ fontSize: '14px!important' }}>
                  状態:{' '}
                  {item.product__conditions
                    ? item.product__conditions[0]
                        ?.condition_option__display_name
                    : null}
                </Typography>
                <Typography sx={{ fontSize: '14px!important' }}>
                  {item.product__specialty__display_name ?? ''}
                </Typography>
                <Typography sx={{ fontSize: '14px!important' }}>
                  査定額: ¥{(item.total_unit_price ?? 0)?.toLocaleString()}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                flex: 1,
              }}
            >
              <Typography sx={{ fontSize: '12px!important', mr: 2 }}>
                買取数
              </Typography>

              <Button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity === 0}
                variant="contained"
                sx={{
                  minWidth: 20,
                  height: 20,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 0,
                  opacity: quantity === 0 ? 0.4 : 1,
                  borderRadius: 1,
                }}
              >
                ー
              </Button>

              <TextField
                value={String(quantity)}
                onChange={handleInputChange}
                inputProps={{
                  style: {
                    textAlign: 'center',
                    fontSize: 24,
                    fontWeight: 'bold',
                    padding: '6px 10px',
                    width: 60,
                  },
                }}
                variant="standard"
                sx={{ mx: 2, flex: 1 }}
              />

              <Button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity === item?.max_item_count}
                variant="contained"
                sx={{
                  minWidth: 20,
                  height: 20,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 0,
                  opacity: quantity === item?.max_item_count ? 0.4 : 1,
                  borderRadius: 1,
                }}
              >
                +
              </Button>
            </Box>

            <Button
              onClick={handleConfirm}
              variant="contained"
              sx={{
                width: '40%',
                py: 1.25,
                backgroundColor: 'primary.main',
                fontWeight: 'bold',
                fontSize: 18,
                borderRadius: 1,
                flex: '0 0 auto', // 固定サイズにしてスクロール時に縮まないようにする
                mt: 'auto', // 上部の余白を自動調整
              }}
            >
              確定
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
