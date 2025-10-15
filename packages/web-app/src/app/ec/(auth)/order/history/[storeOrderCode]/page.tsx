'use client';

import { useAppAuth } from '@/providers/useAppAuth';
import { useEcOrder } from '@/app/ec/(core)/hooks/useEcOrder';
import {
  transformEcOrder,
  TransformedEcOrder,
} from '@/app/ec/(core)/utils/transformEcOrder';
import { useAlert } from '@/contexts/AlertContext';
import {
  Container,
  Typography,
  CardMedia,
  Button,
  Divider,
  TextField,
  Link as MuiLink,
  Stack,
  Paper,
  CircularProgress,
} from '@mui/material';
import { $Enums, ConditionOptionHandle, SpecialtyHandle } from '@prisma/client';
import { useParams, useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import { ReceiptIssueModal } from '@/app/ec/(core)/components/modals/ReceiptIssueModal';
import { PaymentInfoCard } from '@/app/ec/(core)/components/cards/PaymentInfoCard';
import { EC_ORDER_CART_STORE_STATUS_MAP } from '@/app/ec/(core)/constants/orderStatus';
import {
  cardCondition,
  boxCondition,
} from '@/app/ec/(core)/constants/condition';
import { PATH } from '@/app/ec/(core)/constants/paths';
import { redirectToUrl } from '@/app/ec/(core)/utils/browserUtils';
import { ecConstants } from 'common';
import { SpecialtyTag } from '@/app/ec/(core)/components/tags/SpecialtyTag';
import { ConditionTag } from '@/app/ec/(core)/components/tags/ConditionTag';

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

const formatDateTime = (date?: string | number | Date) =>
  date
    ? new Date(date)
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
    : '日時不明';

const formatPrice = (price?: number) =>
  price !== undefined ? `${price.toLocaleString()}円` : '-';

const getConditionLabel = (handle: string): string => {
  const card = cardCondition.find((c) => c.value === handle);
  if (card) return card.label;
  const box = boxCondition.find((c) => c.value === handle);
  if (box) return box.label;
  return handle;
};

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

export default function OrderDetailPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { getCartContents, issueReceipt } = useEcOrder();
  const router = useRouter();
  const { getUserId } = useAppAuth();
  const { setAlertState } = useAlert();
  const { storeOrderCode } = useParams() as { storeOrderCode: string };

  const [order, setOrder] = useState<TransformedEcOrder>();
  const [receiptName, setReceiptName] = useState('');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
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

          // 指定されたstoreOrderCodeに対応する注文を検索
          const transformedOrder = transformedOrders.find(
            (order) => order.storeOrderCode === storeOrderCode,
          );

          setOrder(transformedOrder);
          if (transformedOrder?.receiptCustomerName) {
            setReceiptName(transformedOrder.receiptCustomerName);
          }
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

    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) =>
    setReceiptName(e.target.value);

  const handleIssueReceipt = () => {
    const name = order?.receiptCustomerName || receiptName;
    if (!name) {
      setAlertState({
        message: '宛名を入力してください',
        severity: 'error',
      });
      return;
    }
    setIsReceiptModalOpen(true);
  };

  const handleConfirmIssue = async (name: string) => {
    if (!order) return;

    setIsIssuing(true);
    try {
      const isReissue = !!order.receiptCustomerName;
      const customerNameToUse = isReissue ? undefined : name;

      const url = await issueReceipt(
        order.id as number,
        order.storeId,
        customerNameToUse,
      );

      if (url) {
        setReceiptName(name);
        // orderオブジェクトを更新して、宛名が設定済みであることを反映
        if (!isReissue && order) {
          setOrder({
            ...order,
            receiptCustomerName: name,
          });
        }
        // 領収書URLにリダイレクト
        redirectToUrl(url);
      }
    } catch (error) {
      console.error('領収書発行エラー:', error);
      setAlertState({
        message: '領収書の発行に失敗しました',
        severity: 'error',
      });
    } finally {
      setIsIssuing(false);
      setIsReceiptModalOpen(false);
    }
  };

  if (isLoading)
    return (
      <Container
        maxWidth="md"
        sx={{ py: 4, display: 'flex', justifyContent: 'center' }}
      >
        <CircularProgress />
      </Container>
    );

  if (!order)
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography align="center">注文が見つかりません。</Typography>
      </Container>
    );

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Typography variant="h3" align="center" sx={{ mb: 2 }}>
        注文詳細
      </Typography>

      {/* 注文概要 */}
      <Paper elevation={1} sx={{ mb: 3, p: 2, borderRadius: 1 }}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Stack spacing={1} sx={{ flex: 1 }}>
            {/* 注文日時 */}
            <Typography
              variant="body2"
              component="div"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              注文日時
              <Typography
                component="span"
                variant="body2"
                sx={{ ml: 1 }} // 全角スペース相当の余白
              >
                {order.orderDate ? formatDateTime(order.orderDate) : '日時不明'}
              </Typography>
            </Typography>

            {/* 注文番号 */}
            <Typography
              variant="body2"
              component="div"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              注文番号
              <Typography
                component="span"
                variant="body2"
                sx={{ ml: 1 }} // 全角スペース相当の余白
              >
                #{order.storeOrderCode}
              </Typography>
            </Typography>

            {/* ショップ名 */}
            <Typography
              variant="body2"
              component="div"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              ショップ
              <Typography
                component="span"
                variant="body2"
                sx={{ ml: 1 }} // 全角スペース相当の余白
              >
                {order.shopName}
              </Typography>
            </Typography>
          </Stack>
          <Stack alignItems="flex-end" justifyContent="flex-end">
            <Typography variant="caption">支払い金額</Typography>
            <Typography variant="h3" fontWeight="bold">
              {formatPrice(
                order.totalPrice ??
                  (order.subtotal ?? 0) + (order.shippingFee ?? 0),
              )}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      {/* ショップ & 注文情報 */}
      <Paper elevation={2} sx={{ mb: 3, p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h4">{order.shopName}</Typography>

          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">
                注文日時:&nbsp;
                {order.orderDate ? formatDateTime(order.orderDate) : '日時不明'}
              </Typography>
              {order.storeStatus && (
                <Typography variant="body2" color="primary">
                  {EC_ORDER_CART_STORE_STATUS_MAP[order.storeStatus] ??
                    order.storeStatus}
                </Typography>
              )}
            </Stack>
            <Typography variant="body2" sx={{ color: 'grey.600' }}>
              注文番号:&nbsp;#{order.storeOrderCode}
            </Typography>
          </Stack>

          {/* 商品リスト */}
          <Stack spacing={2}>
            {order.items.map((item) => (
              <Stack
                key={item.id}
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <CardMedia
                  component="img"
                  image={item.imageUrl ?? 'sample.png'}
                  alt={item.name}
                  sx={{
                    width: { xs: '25%', sm: '15%' },
                    objectFit: 'contain',
                    borderRadius: 1,
                  }}
                />
                <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                  <Typography variant="body2">{item.name}</Typography>
                  <Typography variant="caption">{item.cardnumber}</Typography>
                  <Typography variant="caption">{item.rarity}</Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mt: 0.5 }}
                  >
                    <Stack sx={{ gap: 0.5 }}>
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
                    <Typography variant="body1" fontWeight="bold" ml={1}>
                      {formatPrice(item.price)}
                    </Typography>
                    <Typography variant="body2" style={{ marginLeft: 'auto' }}>
                      注文数:&nbsp;
                      {(() => {
                        // 型安全な統合商品チェック
                        if (item.is_unified && item.unified_products) {
                          // 統合商品の場合
                          const unifiedProducts = item.unified_products;
                          const totalOriginalCount = unifiedProducts.reduce(
                            (sum, product) => sum + product.original_item_count,
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
                          const currentCount = item.item_count || item.quantity;

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
              </Stack>
            ))}
          </Stack>

          <Divider />

          {/* 金額明細 */}
          <Stack spacing={1} alignItems="flex-end">
            {[
              { label: '商品の小計', value: order.subtotal },
              { label: '送料', value: order.shippingFee },
            ].map(({ label, value }) => (
              <Stack
                key={label}
                direction="row"
                spacing={2}
                justifyContent="space-between"
                sx={{ width: { xs: '100%', sm: '60%' } }}
              >
                <Typography variant="body2">{label}</Typography>
                <Typography variant="body1">
                  {formatPrice(value as number)}
                </Typography>
              </Stack>
            ))}

            <Stack
              direction="row"
              spacing={2}
              justifyContent="space-between"
              sx={{ width: { xs: '100%', sm: '60%' }, mt: 0.5 }}
            >
              <Typography variant="body1" fontWeight="bold">
                支払い金額
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {formatPrice(order.totalPrice ?? 0)}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {/* 領収書 */}
      {order.storeStatus === $Enums.EcOrderCartStoreStatus.COMPLETED && (
        <Paper elevation={2} sx={{ mb: 3, p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h4">領収書</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="宛名"
                variant="outlined"
                size="small"
                value={receiptName}
                onChange={handleNameChange}
                sx={{
                  flexGrow: 1,
                  '& .MuiInputBase-input::placeholder': {
                    color: 'text.secondary',
                    opacity: 0.7,
                  },
                }}
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    color: 'black',
                  },
                }}
                disabled={!!order.receiptCustomerName}
              />
              <Button variant="contained" onClick={handleIssueReceipt}>
                {order.receiptCustomerName ? '再発行' : '発行'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      <ReceiptIssueModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receiptName={receiptName}
        onIssue={handleConfirmIssue}
        isReissue={!!order.receiptCustomerName}
        isIssuing={isIssuing}
      />

      {/* 住所・配送・支払い情報を実装 */}
      <Paper elevation={2} sx={{ mb: 3, p: 3 }}>
        <Stack spacing={1.5}>
          <Typography variant="h4" component="div">
            お届け先
          </Typography>
          {/* <Typography variant="body1">
            {order.shippingAddress.postalCode}
          </Typography> */}
          <Typography variant="body1">{order.shippingAddress}</Typography>
          <Typography variant="body1">{order.customerName}</Typography>
        </Stack>
      </Paper>

      <Paper elevation={2} sx={{ mb: 3, p: 3 }}>
        <Stack spacing={1.5}>
          <Typography variant="h4" component="div">
            配送方法
          </Typography>
          <Typography variant="body1">{order.shippingMethod}</Typography>
          {(order.shippingCompany || order.shippingTrackingCode) && (
            <Stack direction="row" spacing={3} alignItems="center">
              {order.shippingCompany && (
                <Typography variant="body1">
                  運送会社:{' '}
                  {ecConstants.shippingCompanyDict[order.shippingCompany]}
                </Typography>
              )}
              {order.shippingTrackingCode && (
                <Typography variant="body1">
                  追跡番号: {order.shippingTrackingCode}
                </Typography>
              )}
            </Stack>
          )}
        </Stack>
      </Paper>

      <PaymentInfoCard
        paymentMethod={order.paymentMethod}
        paymentInfo={order.paymentInfo}
      />

      <Stack alignItems="flex-end" sx={{ mt: 1 }}>
        <MuiLink
          href="#"
          underline="always"
          color="primary"
          variant="h5"
          onClick={(e) => {
            e.preventDefault();
            router.push(PATH.ORDER.contact(order.storeOrderCode));
          }}
        >
          この注文について問い合わせる
        </MuiLink>
      </Stack>
    </Container>
  );
}
