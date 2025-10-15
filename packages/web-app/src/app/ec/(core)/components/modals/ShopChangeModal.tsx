import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Stack,
  IconButton,
  Box,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEcProduct } from '@/app/ec/(core)/hooks/useEcProduct';
import { StockSelect } from '@/app/ec/(core)/components/selects/StockSelect';
import { useEffect, useState } from 'react';
import { ConditionOptionHandle, SpecialtyHandle } from '@prisma/client';
import { ConditionTag } from '@/app/ec/(core)/components/tags/ConditionTag';
import { SpecialtyTag } from '@/app/ec/(core)/components/tags/SpecialtyTag';

// ショップ変更時の選択商品情報の型定義
export type ShopChangeSelection = {
  id: number; // 商品ID
  store_id: number; // ストアID
  count: number; // 選択数量
  price?: number; // 商品価格
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  product: {
    product_id: number;
    original_item_count: number;
    store_id?: number;
    product: {
      condition_option: {
        handle: ConditionOptionHandle | null;
      };
      mycaItem: {
        id: number;
        cardname: string | null;
        cardnumber: string | null;
        rarity: string | null;
        full_image_url: string | null;
      };
      specialty?: {
        handle: SpecialtyHandle;
      } | null;
    };
  };
  // 現在のカート内の商品情報
  currentCartItems?: Array<{
    product_id: number;
    store_id: number;
    original_item_count: number;
  }>;
  onConfirm: (selections: ShopChangeSelection[]) => void;
};

export const ShopChangeModal = ({
  isOpen,
  onClose,
  product,
  currentCartItems = [],
  onConfirm,
}: Props) => {
  const { getEcProduct } = useEcProduct();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Array<{
    id: number;
    store: {
      id: number;
      display_name: string | null;
      ec_setting: {
        same_day_limit_hour: number | null;
        shipping_days: number | null;
        free_shipping: boolean;
      };
    };
    price: number;
    ec_stock_number: number;
    condition_option: {
      handle: ConditionOptionHandle | null;
    };
    specialty?: {
      handle: SpecialtyHandle | null;
    };
  }> | null>(null);
  // ショップ変更の選択内容を保持するステート
  const [shopChangeSelections, setShopChangeSelections] = useState<
    ShopChangeSelection[]
  >([]);

  // 確定ボタンの有効/無効を管理
  const isConfirmButtonEnabled = () => {
    // 選択された商品の合計数量が0より大きい場合にボタンを有効化
    const totalSelected = shopChangeSelections.reduce(
      (sum, selection) => sum + selection.count,
      0,
    );
    return totalSelected > 0;
  };

  // 確定ボタンクリック時の処理
  const handleConfirm = () => {
    if (!isConfirmButtonEnabled()) return;

    // 選択情報を親コンポーネントに渡す（既にステートで管理しているのでそのまま渡す）
    onConfirm(shopChangeSelections);
    onClose();
  };

  // 数量変更時の処理
  const handleQuantityChange = (productId: number, quantity: number) => {
    // 対応する商品データを取得
    const productData = products?.find((p) => p.id === productId);

    if (!productData) return;

    setShopChangeSelections((prev) => {
      // 既存の選択内容から該当商品を探す
      const existingIndex = prev.findIndex((item) => item.id === productId);

      if (quantity === 0) {
        // 数量が0の場合は配列から削除
        return existingIndex >= 0
          ? prev.filter((item) => item.id !== productId)
          : prev;
      } else if (existingIndex >= 0) {
        // 既存のアイテムを更新
        return prev.map((item) =>
          item.id === productId ? { ...item, count: quantity } : item,
        );
      } else {
        // 新しいアイテムを追加
        return [
          ...prev,
          {
            id: productId,
            store_id: productData.store.id,
            count: quantity,
            price: productData.price, // 価格情報も保存
          },
        ];
      }
    });
  };

  // 各商品の選択数量を取得するヘルパー関数
  const getSelectedQuantity = (productId: number): number => {
    const selection = shopChangeSelections.find(
      (item) => item.id === productId,
    );
    return selection?.count || 0;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!product.product.mycaItem.id) return;

      setIsLoading(true);
      try {
        // 親カードの状態（コンディション）を取得
        const parentCondition = product.product?.condition_option?.handle;

        // 同じカード、同じコンディションの商品を取得
        const res = await getEcProduct(product.product.mycaItem.id, {
          hasStock: true,
          conditionOption: parentCondition || undefined,
        });

        if (res) {
          // 親の出品情報を除外
          const filteredProducts = res.products
            .filter((item) => item.id !== product.product_id)
            .map((item) => {
              return {
                id: item.id,
                store: {
                  id: item.store.id,
                  display_name: item.store.display_name,
                  ec_setting: item.store.ec_setting,
                },
                price: item.actual_ec_sell_price ?? 0,
                ec_stock_number: item.ec_stock_number,
                condition_option: item.condition_option,
                specialty: item.specialty,
              };
            });
          setProducts(filteredProducts);
        }
      } catch (error) {
        console.error('商品情報の取得に失敗しました', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchProducts();
      // モーダルを開くたびに選択状態をリセット
      setShopChangeSelections([]);
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '10px',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          textAlign: 'center',
          fontSize: '1rem !important',
          fontWeight: 'bold',
          py: 1,
          position: 'relative',
        }}
      >
        ショップを変更
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* 左: カード画像 */}
            <Box
              sx={{
                width: 120,
                height: 120,
                bgcolor: 'white',
                borderRadius: 1,
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {product.product?.mycaItem?.full_image_url ? (
                <Box
                  component="img"
                  src={product.product.mycaItem.full_image_url}
                  alt={product.product.mycaItem.cardname || 'カード画像'}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  画像なし
                </Typography>
              )}
            </Box>

            {/* 中央: カード名、型番、レアリティ */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                flex: 1,
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                {product.product?.mycaItem?.cardname || 'カード名未設定'}
              </Typography>
              <Typography variant="body2">
                {product.product?.mycaItem?.cardnumber || '型番未設定'}
              </Typography>
              <Typography variant="body2">
                {product.product?.mycaItem?.rarity || 'レア度未設定'}
              </Typography>
            </Box>

            {/* 右: 状態、注文数 */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                alignItems: 'flex-end',
              }}
            >
              {product.product?.specialty?.handle && (
                // 特殊状態
                <SpecialtyTag value={product.product?.specialty.handle} />
              )}
              {product.product?.condition_option?.handle ? (
                <ConditionTag
                  value={
                    (product.product?.condition_option
                      ?.handle as ConditionOptionHandle) ?? null
                  }
                />
              ) : (
                '状態未設定'
              )}
              <Typography variant="body2" fontWeight="bold">
                注文数：{product.original_item_count}
              </Typography>
            </Box>
          </Box>

          {/* ショップ一覧 */}
          <Box sx={{ mt: 4 }}>
            {isLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '200px',
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <Stack
                spacing={2}
                sx={{
                  maxHeight: 400,
                  overflowY: 'auto',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    bgcolor: 'grey.100',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'grey.400',
                    borderRadius: '3px',
                  },
                }}
              >
                {products && products.length > 0 ? (
                  products.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'grey.300',
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{ textDecoration: 'underline' }}
                        >
                          {item.store.display_name || 'ショップ名未設定'}
                        </Typography>
                        <Typography variant="h3" fontWeight="bold">
                          {item.price.toLocaleString()}円
                        </Typography>
                        {/* 状態 */}
                        {item.specialty?.handle && (
                          // 特殊状態
                          <Box sx={{ width: 'fit-content' }}>
                            <SpecialtyTag value={item.specialty.handle} />
                          </Box>
                        )}
                        <Box sx={{ width: 'fit-content' }}>
                          <ConditionTag
                            value={
                              (item.condition_option
                                ?.handle as ConditionOptionHandle) ?? null
                            }
                          />
                        </Box>
                      </Box>
                      <StockSelect
                        maxStock={item.ec_stock_number}
                        value={getSelectedQuantity(item.id)}
                        onChange={(value) =>
                          handleQuantityChange(item.id, value)
                        }
                      />
                    </Box>
                  ))
                ) : (
                  <Box
                    sx={{
                      p: 4,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body1">
                      同じ状態の商品は他の店舗からは出品されていません
                    </Typography>
                  </Box>
                )}
              </Stack>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Stack
          direction="column"
          spacing={2}
          sx={{ width: '100%', px: 2, pb: 2 }}
        >
          <Button
            onClick={handleConfirm}
            variant="contained"
            sx={{ borderRadius: '6px' }}
            disabled={!isConfirmButtonEnabled()}
          >
            変更を確定
          </Button>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              bgcolor: 'grey.500',
              color: 'white',
              '&:hover': {
                bgcolor: 'grey.600',
              },
              borderRadius: '6px',
            }}
          >
            変更をキャンセル
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
