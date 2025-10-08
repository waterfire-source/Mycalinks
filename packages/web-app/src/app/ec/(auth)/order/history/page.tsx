'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  Stack,
  CircularProgress,
  Box,
} from '@mui/material';
import Link from 'next/link';
import { useEcOrder } from '@/app/ec/(core)/hooks/useEcOrder';
import { useAppAuth } from '@/providers/useAppAuth';
import { useAlert } from '@/contexts/AlertContext';
import {
  transformEcOrder,
  TransformedEcOrder,
} from '@/app/ec/(core)/utils/transformEcOrder';

// API レスポンス型定義
interface ApiProduct {
  product_id: number;
  total_unit_price: number;
  original_item_count: number;
  item_count: number;
  product: {
    ec_stock_number: number;
    condition_option: {
      handle: string;
    };
    specialty: {
      handle: string;
    } | null;
    item: {
      myca_item_id: number;
    };
    images: Array<{
      image_url: string;
      description: string;
      order_number: number;
    }>;
    description: string;
    mycaItem: {
      id: number;
      cardname: string;
      rarity: string;
      expansion: string;
      cardnumber: string;
      full_image_url: string;
    };
  };
}

interface ApiCartStore {
  store_id: number;
  store: {
    display_name: string;
  };
  total_price: number;
  shipping_method_id: number;
  shipping_fee: number;
  shipping_method: {
    display_name: string;
  };
  status: string;
  code: string;
  products: ApiProduct[];
}

interface ApiOrder {
  id: number;
  status: string;
  payment_method: string;
  customer_name: string;
  shipping_address: string;
  shipping_address_prefecture: string;
  shipping_total_fee: number;
  total_price: number;
  ordered_at: string;
  cart_stores: ApiCartStore[];
}

// 統合処理用の商品型
interface ExtendedCartUnifiableProduct {
  product_id: number;
  original_item_count: number;
  product: {
    condition_option: {
      handle: string;
    };
    mycaItem: {
      id: number;
      cardname: string;
      cardnumber: string;
    };
  };
  description: string;
  images: Array<{
    image_url: string;
    description: string;
    order_number: number;
  }>;
  specialty: { handle: string } | null;
  originalProduct: ApiProduct;
}

// 統合結果のグループ型
interface CartUnifiedProductGroup {
  id: string;
  cardKey: string;
  conditionHandle: string;
  totalQuantity: number;
  products: ExtendedCartUnifiableProduct[];
}

// 統合情報が含まれた商品型
interface UnifiedProduct extends ApiProduct {
  is_unified: boolean;
  unified_quantity: number;
  unified_products: ApiProduct[];
  unified_id: string;
}

// 注文履歴のアイテム型定義
interface OrderHistoryItem {
  id: string | number;
  name: string;
  cardnumber: string;
  expansion: string | null;
  rarity: string | null;
  condition: string;
  specialty?: string | null;
  price: number;
  quantity: number;
  original_item_count: number;
  item_count: number;
  imageUrl: string | null;
  // 統合情報（オプショナル）
  is_unified?: boolean;
  unified_quantity?: number;
  unified_products?: ApiProduct[];
}
import { EC_ORDER_CART_STORE_STATUS_MAP } from '@/app/ec/(core)/constants/orderStatus';

import { ConditionTag } from '@/app/ec/(core)/components/tags/ConditionTag';
import { SpecialtyTag } from '@/app/ec/(core)/components/tags/SpecialtyTag';
import { ConditionOptionHandle, SpecialtyHandle } from '@prisma/client';

const getOrderDetailPath = (storeOrderCode: string) =>
  `/ec/order/history/${encodeURIComponent(storeOrderCode)}`;

// 注文履歴用の統合処理（画像・説明がある場合は統合しない）
const unifyOrderHistoryProducts = (
  cartProducts: ExtendedCartUnifiableProduct[],
): CartUnifiedProductGroup[] => {
  const unifiedMap = new Map<string, CartUnifiedProductGroup>();

  for (const product of cartProducts) {
    const hasDescription = !!(
      product.description && product.description.trim() !== ''
    );
    const hasImages = !!(product.images && product.images.length > 0);

    // 画像または説明がある場合は統合しない（個別グループとして作成）
    if (hasDescription || hasImages) {
      const singleKey = `single-${product.product_id}`;
      unifiedMap.set(singleKey, {
        id: singleKey,
        cardKey: `${product.product.mycaItem.cardname || ''}-${
          product.product.mycaItem.cardnumber || ''
        }`,
        conditionHandle: product.product.condition_option.handle,
        totalQuantity: product.original_item_count,
        products: [product],
      });
      continue;
    }

    // 統合キーを生成（同じカード・状態・特殊状態の商品を統合）
    const cardname = product.product.mycaItem.cardname;
    const cardnumber = product.product.mycaItem.cardnumber;
    const conditionHandle = product.product.condition_option.handle;
    const specialtyHandle = product.specialty?.handle || 'null';

    const key = `${cardname || ''}-${
      cardnumber || ''
    }-${conditionHandle}-${specialtyHandle}`;
    const cardKey = `${cardname || ''}-${cardnumber || ''}`;

    const existing = unifiedMap.get(key);
    if (existing) {
      // 既存グループに追加
      unifiedMap.set(key, {
        ...existing,
        totalQuantity: existing.totalQuantity + product.original_item_count,
        products: [...existing.products, product],
      });
    } else {
      // 新規グループ作成
      unifiedMap.set(key, {
        id: key,
        cardKey,
        conditionHandle,
        totalQuantity: product.original_item_count,
        products: [product],
      });
    }
  }

  return Array.from(unifiedMap.values());
};

// APIレスポンスから統合処理用のデータに変換
const convertApiProductToExtendedCartUnifiable = (
  product: ApiProduct,
): ExtendedCartUnifiableProduct => ({
  product_id: product.product_id,
  original_item_count: product.original_item_count,
  product: {
    condition_option: {
      handle: product.product.condition_option.handle,
    },
    mycaItem: {
      id: product.product.mycaItem.id,
      cardname: product.product.mycaItem.cardname,
      cardnumber: product.product.mycaItem.cardnumber,
    },
  },
  description: product.product.description || '',
  images: product.product.images || [],
  specialty: product.product.specialty,
  originalProduct: product,
});

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<TransformedEcOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getCartContents } = useEcOrder();
  const { getUserId } = useAppAuth();
  const { setAlertState } = useAlert();
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = await getUserId();
        if (!userId) {
          setAlertState({
            message: 'ログインが必要です',
            severity: 'error',
          });
          setIsLoading(false);
          return;
        }

        const orderData = await getCartContents();

        if (orderData && orderData.orders) {
          // 型安全なAPI レスポンス処理 - ordered_atをstring型に変換
          const apiOrders: ApiOrder[] = orderData.orders.map((order) => ({
            ...order,
            ordered_at: order.ordered_at ? order.ordered_at.toString() : '',
          }));

          // まず統合処理を元のAPIデータで実行してから、transformEcOrderを適用
          const processedOrderData = {
            ...orderData,
            orders: apiOrders.map((order) => {
              // 各店舗の商品に統合処理を適用
              const processedCartStores = order.cart_stores.map((store) => {
                // APIレスポンスから直接統合処理用に変換
                const cartUnifiableItems = store.products.map(
                  convertApiProductToExtendedCartUnifiable,
                );

                // 統合処理実行
                const unifiedGroups =
                  unifyOrderHistoryProducts(cartUnifiableItems);

                // 統合結果を元の商品データ形式に戻す
                const unifiedProducts = unifiedGroups.map((group) => {
                  const firstProductData = group
                    .products[0] as ExtendedCartUnifiableProduct;
                  const firstProduct = firstProductData.originalProduct;

                  return {
                    ...firstProduct,
                    // 統合情報を追加
                    is_unified: group.products.length > 1,
                    unified_quantity: group.totalQuantity,
                    unified_products: group.products.map(
                      (p) =>
                        (p as ExtendedCartUnifiableProduct).originalProduct,
                    ),
                    unified_id: group.id,
                  };
                });

                return {
                  ...store,
                  products: unifiedProducts,
                };
              });

              return {
                ...order,
                cart_stores: processedCartStores,
              };
            }),
          };

          // 統合処理済みデータをtransformEcOrderで変換
          const processedData = {
            ...processedOrderData,
            orders: processedOrderData.orders.map((order) => ({
              id: order.id,
              status: order.status,
              payment_method: order.payment_method,
              customer_name: order.customer_name,
              shipping_address: order.shipping_address,
              shipping_address_prefecture: order.shipping_address_prefecture,
              shipping_total_fee: order.shipping_total_fee,
              total_price: order.total_price,
              ordered_at: order.ordered_at,
              cart_stores: order.cart_stores.map((store) => ({
                store_id: store.store_id,
                store: store.store,
                total_price: store.total_price,
                shipping_method_id: store.shipping_method_id,
                shipping_fee: store.shipping_fee,
                shipping_method: store.shipping_method,
                status: store.status,
                code: store.code,
                products: store.products.map((product) => {
                  const unifiedProduct = product as UnifiedProduct;
                  return {
                    product_id: unifiedProduct.product_id,
                    total_unit_price: unifiedProduct.total_unit_price,
                    original_item_count: unifiedProduct.original_item_count,
                    item_count: unifiedProduct.item_count,
                    product: unifiedProduct.product,
                  };
                }),
              })),
            })),
          };
          const transformedOrders = transformEcOrder(processedData);

          // 下書き状態（DRAFT）の注文を除外
          const nonDraftOrders = transformedOrders.filter(
            (order) => order.storeStatus !== 'DRAFT',
          );

          // 日付の最新順に並び替え
          const sortedOrders = nonDraftOrders.sort((a, b) => {
            const dateA = new Date(a.orderDate || 0);
            const dateB = new Date(b.orderDate || 0);
            const dateDiff = dateB.getTime() - dateA.getTime();
            if (dateDiff !== 0) return dateDiff;

            const idDiff = Number(b.id) - Number(a.id);
            if (idDiff !== 0) return idDiff;

            return a.storeId - b.storeId;
          });

          setOrders(sortedOrders);
        }
      } catch (error) {
        setAlertState({
          message: '注文履歴の取得に失敗しました',
          severity: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: 4, display: 'flex', justifyContent: 'center' }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h2" gutterBottom align="center" sx={{ mb: 2 }}>
          注文履歴
        </Typography>
        <Typography variant="body1" align="center">
          注文履歴がありません
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Typography variant="h3" gutterBottom align="center" sx={{ mb: 2 }}>
        注文履歴
      </Typography>

      {orders.map((order) => (
        <Card key={order.id} sx={{ mb: 3 }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              sx={{ mb: 1 }}
            >
              <Stack spacing={0.5} sx={{ mb: 1 }}>
                <Typography variant="body2" component="div">
                  {order.shopName}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    variant="body2"
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <Box component="span" sx={{ mr: 0.5 }}>
                      注文日時
                    </Box>
                    {order.orderDate
                      ? new Date(order.orderDate)
                          .toLocaleString('ja-JP', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })
                          .replace(/\//g, '/')
                          .replace(',', '')
                      : '日時不明'}
                  </Typography>
                  {order.storeStatus && (
                    <Typography variant="body2" color="primary">
                      {EC_ORDER_CART_STORE_STATUS_MAP[order.storeStatus] ||
                        order.storeStatus}
                    </Typography>
                  )}
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Typography
                    variant="body2"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'grey',
                    }}
                  >
                    <Box component="span" sx={{ mr: 0.5 }}>
                      注文番号
                    </Box>
                    #{order.storeOrderCode}
                  </Typography>
                </Stack>
              </Stack>
              <Stack>
                <Link
                  href={getOrderDetailPath(order.storeOrderCode)}
                  passHref
                  legacyBehavior
                >
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ backgroundColor: '#808080', fontSize: '0.7rem' }}
                  >
                    詳細
                  </Button>
                </Link>
              </Stack>
            </Stack>

            {order.items.map((item: OrderHistoryItem) => (
              <Grid
                container
                spacing={2}
                key={item.id}
                sx={{ mb: 2, alignItems: 'center' }}
              >
                <Grid item xs={3} sm={2}>
                  <CardMedia
                    component="img"
                    image={item.imageUrl || ''}
                    alt={item.name}
                    sx={{ width: '100%', objectFit: 'contain' }}
                  />
                </Grid>
                <Grid item xs={9} sm={10}>
                  <Stack spacing={0.2}>
                    <Typography variant="body2" component="div">
                      {item.name}
                    </Typography>
                    <Typography variant="body2">{item.cardnumber}</Typography>
                    <Typography variant="body2">{item.rarity}</Typography>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                      sx={{ mt: 0.5 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Stack
                          sx={{
                            gap: '5px',
                          }}
                        >
                          {item.specialty && (
                            // 特殊状態
                            <SpecialtyTag
                              value={item.specialty as SpecialtyHandle}
                            />
                          )}
                          <ConditionTag
                            value={
                              (item.condition as ConditionOptionHandle) ?? null
                            }
                          />
                        </Stack>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 'bold', ml: 1 }}
                        >
                          {item.price.toLocaleString()}円
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        注文数:{' '}
                        {(() => {
                          // 型安全な統合商品チェック
                          if (item.is_unified && item.unified_products) {
                            // 統合商品の場合
                            const unifiedProducts = item.unified_products;
                            const totalOriginalCount = unifiedProducts.reduce(
                              (sum, product) =>
                                sum + product.original_item_count,
                              0,
                            );
                            const totalCurrentCount = unifiedProducts.reduce(
                              (sum, product) =>
                                sum +
                                (product.item_count ||
                                  product.original_item_count),
                              0,
                            );

                            if (
                              order.storeStatus !== 'DRAFT' &&
                              totalOriginalCount !== totalCurrentCount
                            ) {
                              return (
                                <span
                                  style={{ color: 'red', fontWeight: 'bold' }}
                                >
                                  {totalOriginalCount}→{totalCurrentCount}
                                </span>
                              );
                            }
                            return totalOriginalCount;
                          } else {
                            // 通常商品の場合
                            const originalCount =
                              item.original_item_count || item.quantity;
                            const currentCount =
                              item.item_count || item.quantity;

                            if (
                              order.storeStatus !== 'DRAFT' &&
                              originalCount !== currentCount
                            ) {
                              return (
                                <span
                                  style={{ color: 'red', fontWeight: 'bold' }}
                                >
                                  {originalCount}→{currentCount}
                                </span>
                              );
                            }
                            return originalCount;
                          }
                        })()}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            ))}
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}
