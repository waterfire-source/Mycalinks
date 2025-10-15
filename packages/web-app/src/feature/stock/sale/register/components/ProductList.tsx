import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Divider,
  SxProps,
  Theme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { SaleItem } from '@/app/auth/(dashboard)/stock/sale/register/page';
import { TransactionKind, SaleRule } from '@prisma/client';
import { useStore } from '@/contexts/StoreContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useSearchParams } from 'next/navigation';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { getConditionDisplayName } from '@/feature/products/utils/conditionDisplayName';
/**
 * 商品の表示用データ型
 */
export interface DisplayProduct {
  id: number;
  productName: string;
  displayNameWithMeta: string;
  imageUrl: string | null;
  sellPrice: number | null;
  buyPrice: number | null;
  conditionOptionDisplayName: string;
  stocks: number;
}

/**
 * 商品リストコンポーネントのProps
 */
interface ProductListProps {
  selectedSale: SaleItem; // 選択中のセール情報
  setSelectedSale: React.Dispatch<React.SetStateAction<SaleItem>>; // セール情報更新関数
  sx?: SxProps<Theme>; // スタイル
}

/**
 * セール・キャンペーンの対象/除外商品を表示するリストコンポーネント
 */
export const ProductList: React.FC<ProductListProps> = ({
  selectedSale,
  setSelectedSale,
  sx,
}) => {
  const { store } = useStore();
  const clientAPI = createClientAPI();
  const { setAlertState } = useAlert();
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const searchParams = useSearchParams();
  const type = searchParams.get('type');

  // 商品情報の初期取得
  useEffect(() => {
    const fetchProducts = async () => {
      if (selectedSale.products.length === 0) return;

      const res = await clientAPI.product.listProducts({
        storeID: store.id,
        id: selectedSale.products.map((product) => product.productId),
      });
      if (res instanceof CustomError) {
        console.error('Failed to fetch products:', res);
        setAlertState({
          message: `商品の取得に失敗しました。${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      if (!('products' in res)) return;
      if (res.products.length === 0) return;
      setProducts(
        res.products.map((product) => {
          return {
            id: product.id,
            productName: product.display_name,
            displayNameWithMeta: product.displayNameWithMeta,
            imageUrl: product.image_url,
            sellPrice: product.sell_price,
            buyPrice: product.buy_price,
            conditionOptionDisplayName: getConditionDisplayName(product),
            stocks: product.stock_number,
          };
        }),
      );
    };

    fetchProducts();
  }, [store.id]);

  // 商品リストが更新されたらセール情報も更新
  useEffect(() => {
    setSelectedSale((prev) => ({
      ...prev,
      products: products.map((product) => ({
        rule: type === 'department' ? SaleRule.exclude : SaleRule.include,
        productId: product.id,
        productName: product.productName,
        productDisplayNameWithMeta: product.displayNameWithMeta,
      })),
    }));
  }, [products]);

  // セール情報と商品リストの同期を維持
  useEffect(() => {
    const productIds = products.map((p) => p.id);
    const saleProductIds = selectedSale.products.map((p) => p.productId);

    // 不要な商品を削除
    if (products.some((p) => !saleProductIds.includes(p.id))) {
      setProducts(products.filter((p) => saleProductIds.includes(p.id)));
    }

    // 新規商品の取得と追加
    const fetchNewProducts = async () => {
      const uniqueProductIds = [...new Set(saleProductIds)];
      const newProductIds = uniqueProductIds.filter(
        (id) => !productIds.includes(id),
      );
      if (newProductIds.length === 0) return;

      const res = await clientAPI.product.listProducts({
        storeID: store.id,
        id: newProductIds,
      });

      if (res instanceof CustomError) {
        console.error('Failed to fetch products:', res);
        setAlertState({
          message: `商品の取得に失敗しました。${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }

      if (!('products' in res)) return;
      if (res.products.length === 0) return;

      // 重複を除去しながら新しい商品を追加
      setProducts((prev) => {
        const newProducts = res.products.map((product) => ({
          id: product.id,
          productName: product.display_name,
          displayNameWithMeta: product.displayNameWithMeta,
          imageUrl: product.image_url,
          sellPrice: product.sell_price,
          buyPrice: product.buy_price,
          conditionOptionDisplayName: product.is_special_price_product
            ? '特価'
            : product.condition_option_display_name,
          stocks: product.stock_number,
        }));

        const combined = [...prev, ...newProducts];
        return [...new Map(combined.map((item) => [item.id, item])).values()];
      });
    };

    fetchNewProducts();
  }, [selectedSale.products]);

  // 商品追加時のオートフォーカス処理
  const lastItemRef = useRef<HTMLLIElement | null>(null);
  const prevLengthRef = useRef<number>(products.length);
  useEffect(() => {
    // 商品の削除時には発火しないように、直前の商品リストの数と比較して増えている場合のみ下までスクロールする
    if (products.length > prevLengthRef.current && lastItemRef.current) {
      lastItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    prevLengthRef.current = products.length; // 比較用に現在の商品リスト数を保存
  }, [products.length]);

  return (
    <>
      <Box sx={{ ...sx }}>
        <List>
          {products.map((product, index) => (
            <React.Fragment key={product.id}>
              <ListItem
                ref={index === products.length - 1 ? lastItemRef : null}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
                >
                  {/* 商品画像 */}
                  {product.imageUrl && (
                    <Box
                      sx={{
                        width: 60,
                        height: 80,
                        mr: 2,
                        position: 'relative',
                      }}
                    >
                      <ItemImage imageUrl={product.imageUrl} fill />
                    </Box>
                  )}
                  {/* 商品情報 */}
                  <ListItemText
                    primary={
                      <ItemText text={product.displayNameWithMeta} wrap />
                    }
                    secondary={
                      <Box>
                        <Box sx={{ mb: 1, mt: 1 }}>
                          <Typography
                            variant="caption"
                            component="div"
                            sx={{
                              color: 'white',
                              backgroundColor: 'primary.main',
                              borderRadius: '2px',
                              px: 1,
                              py: 0.5,
                              width: 'fit-content',
                            }}
                          >
                            {product.conditionOptionDisplayName}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          component="div"
                          sx={{ color: 'black' }}
                        >
                          {selectedSale.transactionKind === TransactionKind.sell
                            ? `販売価格: ${product.sellPrice?.toLocaleString()}円`
                            : `買取価格: ${product.buyPrice?.toLocaleString()}円`}
                        </Typography>
                      </Box>
                    }
                  />
                  {/* 削除ボタン */}
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => {
                        setProducts(
                          products.filter((p) => p.id !== product.id),
                        );
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </Box>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>
    </>
  );
};
