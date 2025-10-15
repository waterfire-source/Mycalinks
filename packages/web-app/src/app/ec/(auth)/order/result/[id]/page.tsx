'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useAppAuth } from '@/providers/useAppAuth';
import { StatusIcon } from '@/app/ec/(core)/components/icons/statusIcon';
import { useEcOrder } from '@/app/ec/(core)/hooks/useEcOrder';
import { CustomError } from '@/api/implement';
import {
  StoreCard,
  CartStore,
} from '@/app/ec/(core)/components/cards/StoreCard';
import { EcPaymentMethod } from '@prisma/client';
import { PaymentInfoCard } from '@/app/ec/(core)/components/cards/PaymentInfoCard';

interface DisplayAccountInfo {
  id: number;
  fullName: string;
  prefecture: string;
  city: string;
  address: string;
  address2: string;
  building: string;
  zipCode: string;
}

interface Order {
  id: number;
  status: string;
  total_price: number;
  shipping_total_fee: number;
  cart_stores: CartStore[];
  payment_method?: EcPaymentMethod | null;
  payment_info?: string | object;
}

export default function OrderResultPage() {
  const params = useParams();
  const orderId = params.id;

  const { getAccountInfo } = useAppAuth();
  const { getCartContents } = useEcOrder();

  const [order, setOrder] = useState<Order | null>(null);
  const [displayAccountInfo, setDisplayAccountInfo] =
    useState<DisplayAccountInfo>({
      id: 0,
      fullName: '',
      prefecture: '',
      city: '',
      address: '',
      address2: '',
      building: '',
      zipCode: '',
    });
  const [isLoading, setIsLoading] = useState(true);

  // 画面遷移時
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        // アカウント情報を取得
        const accountInfo = await getAccountInfo();
        if (accountInfo instanceof CustomError) {
          console.error('アカウント情報の取得に失敗しました');
          setIsLoading(false);
          return;
        }

        // アカウント情報を設定
        setDisplayAccountInfo({
          id: accountInfo.id,
          fullName: accountInfo.full_name ?? '',
          prefecture: accountInfo.prefecture ?? '',
          city: accountInfo.city ?? '',
          address: accountInfo.address ?? '',
          address2: accountInfo.address2 ?? '',
          building: accountInfo.building ?? '',
          zipCode: accountInfo.zip_code ?? '',
        });

        // 注文情報を取得
        const orderData = await getCartContents();

        if (orderData?.orders && orderData.orders.length > 0) {
          // PAID状態の注文を1件取得（最もIDが大きいものを選択）
          // 本来はAPI側で最新の注文を取得する機能があるとよいですが、
          // なければPAIDを探し、ないなら最新のDRAFTを表示
          const targetOrder = orderData.orders.find(
            (order) => order.id === Number(orderId),
          );
          if (targetOrder) {
            setOrder({
              id: targetOrder.id,
              status: targetOrder.status,
              total_price: targetOrder.total_price,
              shipping_total_fee: targetOrder.shipping_total_fee,
              cart_stores: targetOrder.cart_stores,
              payment_method: targetOrder.payment_method,
              payment_info: targetOrder.payment_info,
            });
          }
        }
      } catch (error) {
        console.error('データ取得中にエラーが発生しました', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', alignItems: 'center', p: 0, mb: 1 }}>
        <Box sx={{ mb: 2 }}>
          <StatusIcon current={3} total={3} />
        </Box>
        {!isLoading && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 0,
              mb: 1,
            }}
          >
            {order ? (
              <>
                <Typography
                  variant="h2"
                  color="primary"
                  sx={{ ml: 1, mr: 'auto' }}
                >
                  注文確定。ありがとうございました。
                </Typography>
                <Typography
                  variant="body2"
                  color="gray"
                  sx={{ ml: 1, mr: 'auto' }}
                >
                  確認メールが送信されます。
                </Typography>
              </>
            ) : (
              <Typography
                variant="h2"
                color="error"
                sx={{ ml: 1, mr: 'auto', mb: 1 }}
              >
                該当する注文が存在しません。
              </Typography>
            )}
          </Box>
        )}
      </Box>

      <Box>
        {/* 注文詳細 */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={36} />
          </Box>
        ) : !order ? (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1">
                指定されたIDの注文情報が見つかりませんでした。
              </Typography>
            </Box>
          </Paper>
        ) : (
          <>
            {/* お届け先 */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  お届け先
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {/* 郵便番号がハイフンがある場合はそのまま表示、ない場合はハイフンを追加 */}
                    {displayAccountInfo.zipCode?.includes('-')
                      ? displayAccountInfo.zipCode
                      : displayAccountInfo.zipCode?.slice(0, 3) +
                        '-' +
                        displayAccountInfo.zipCode?.slice(3)}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {displayAccountInfo.prefecture} {displayAccountInfo.city}{' '}
                    {displayAccountInfo.address2} {displayAccountInfo.building}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {displayAccountInfo.fullName}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* お支払い方法 */}
            {order?.payment_method && (
              <PaymentInfoCard
                paymentMethod={order.payment_method}
                paymentInfo={order.payment_info}
              />
            )}

            {/* ショップごとの商品情報 */}
            {!order?.cart_stores?.length ? (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body1">商品情報がありません</Typography>
                </Box>
              </Paper>
            ) : (
              order.cart_stores.map((store, storeIndex) => (
                <StoreCard
                  key={store.store_id}
                  store={store}
                  storeIndex={storeIndex}
                  totalStores={order.cart_stores.length}
                  onStockChange={() => {}}
                  onDelete={() => {}}
                  onShopChange={() => {}}
                  onShippingMethodChange={() => {}}
                  viewMode="order"
                  enableUnification={true}
                />
              ))
            )}
          </>
        )}
      </Box>
    </Container>
  );
}
