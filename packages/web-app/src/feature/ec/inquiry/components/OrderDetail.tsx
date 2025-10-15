import { Box, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DetailCard } from '@/components/cards/DetailCard';
import { Inquiry } from '@/feature/ec/inquiry/hooks/useInquiry';
import { createClientAPI, CustomError } from '@/api/implement';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { EcOrderCartStoreStatus, EcPaymentMethod } from '@prisma/client';
import { EcProductsDetailList } from '@/feature/ec/inquiry/components/EcProductsDetailList';
import { MycaCustomerDetail } from '@/feature/ec/inquiry/components/MycaCustomerDetail';

interface Props {
  inquiry: Inquiry['orderContacts'][0];
}

export interface EcOrderByStoreProps {
  storeOrders: Array<{
    order: {
      id: number;
      paymentMethod: EcPaymentMethod | null;
      mycaUserId: number | null;
      customerName: string | null;
      customerEmail: string | null;
      shippingAddress: string | null;
      orderedAt: Date | null;
    };
    shippingMethod: {
      id: number;
      displayName: string;
    };
    shippingTrackingCode: string | null;
    shippingCompany: string | null;
    shippingFee: number;
    totalPrice: number;
    status: EcOrderCartStoreStatus;
    read: boolean;
    code: string;
    products: Array<{
      id: number;
      product: {
        id: number;
        displayNameWithMeta?: string;
      };
      totalUnitPrice: number;
      originalItemCount: number;
      itemCount: number;
    }>;
  }>;
}

export const OrderDetail = ({ inquiry }: Props) => {
  const clientAPI = createClientAPI();
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const [order, setOrder] = useState<EcOrderByStoreProps>();

  const fetchOrder = useCallback(async () => {
    if (inquiry.orderId) {
      const response = await clientAPI.ec.getEcOrderByStore({
        store_id: store.id,
        id: inquiry.orderId,
      });
      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return response;
      }
      setOrder({
        storeOrders: response.storeOrders.map((storeOrder) => ({
          order: {
            id: storeOrder.order.id,
            paymentMethod: storeOrder.order.payment_method,
            mycaUserId: storeOrder.order.myca_user_id,
            customerName: storeOrder.order.customer_name,
            customerPhone: storeOrder.order.customer_phone,
            customerEmail: storeOrder.order.customer_email,
            shippingAddress: storeOrder.order.shipping_address,
            orderedAt: storeOrder.order.ordered_at,
          },
          shippingMethod: {
            id: storeOrder.shipping_method.id,
            displayName: storeOrder.shipping_method.display_name,
          },
          shippingTrackingCode: storeOrder.shipping_tracking_code,
          shippingCompany: storeOrder.shipping_company,
          shippingFee: storeOrder.shipping_fee,
          totalPrice: storeOrder.total_price,
          status: storeOrder.status,
          read: storeOrder.read,
          code: storeOrder.code,
          products: storeOrder.products.map((product) => ({
            id: product.id,
            product: {
              id: product.product.id,
              displayNameWithMeta: product.product.displayNameWithMeta,
            },
            totalUnitPrice: product.total_unit_price,
            originalItemCount: product.original_item_count,
            itemCount: product.item_count,
          })),
        })),
      });
      return response;
    }
  }, [inquiry.orderId, store.id, clientAPI, setAlertState]);

  //IDからproductの情報を持たせたデータを取得
  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiry]);

  const content = useMemo(() => {
    return (
      <>
        {inquiry.orderId ? (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {order?.storeOrders[0] ? (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '2px solid',
                    borderBottomColor: 'grey.300',
                    padding: 2,
                  }}
                >
                  <Typography variant="body1">
                    合計
                    <Typography component="span">
                      {order.storeOrders[0].products.reduce(
                        (total, cart) => total + (cart.itemCount || 0),
                        0,
                      )}
                      点{' '}
                    </Typography>
                    <Typography component="span">
                      ({order.storeOrders[0].products.length}商品)
                    </Typography>
                  </Typography>
                  <Typography variant="body1">
                    合計金額{' '}
                    <Typography component="span">
                      {order.storeOrders[0].totalPrice.toLocaleString()}円
                    </Typography>
                  </Typography>
                </Box>

                {/* スクロール可能な領域 */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                  <EcProductsDetailList
                    products={order.storeOrders[0].products}
                  />
                </Box>
                <MycaCustomerDetail order={order.storeOrders[0]} />
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexGrow: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h1" sx={{ ml: 1 }}>
                  詳細情報を取得中...
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              mt: 2,
              p: 2,
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h1" sx={{ ml: 1 }}>
                保留リストを選択して詳細を表示
              </Typography>
            </Box>
          </Box>
        )}
      </>
    );
  }, [inquiry, order]);

  const title = '注文内容';

  return (
    <DetailCard
      title={title}
      content={content}
      titleSx={{ p: 2 }}
      containerSx={{ width: '100%', flexGrow: 1, minHeight: 0 }}
      contentSx={{
        width: '100%',
        height: '100%',
        padding: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    />
  );
};
