import { useCallback, useRef, useState } from 'react';
import { createClientAPI } from '@/api/implement';
import {
  OrderInfo,
  OrderStatus,
} from '@/app/auth/(dashboard)/ec/list/types/OrderInfo';
import { EcOrderCartStoreStatus, EcPaymentMethod } from '@prisma/client';
import { MycaPosApiClient } from 'api-generator/client';
import { useErrorAlert } from '@/hooks/useErrorAlert';
interface UseOrderInfoProps {
  storeId: number;
}

interface FetchOrderInfoParams {
  status?: EcOrderCartStoreStatus;
  shippingMethodId?: number;
  orderPaymentMethod?: EcPaymentMethod;
  orderBy?: string;
  take?: number;
  skip?: number;
  id?: number;
  orderedAtGte?: Date;
  orderedAtLt?: Date;
}

export const useOrderInfo = ({ storeId }: UseOrderInfoProps) => {
  const { handleError } = useErrorAlert();
  const api = useRef(createClientAPI());
  const apiClient = useRef(
    new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    }),
  );
  const [orderInfos, setOrderInfos] = useState<OrderInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrderInfo = useCallback(
    async (params?: FetchOrderInfoParams) => {
      setIsLoading(true);
      // 初期化
      setOrderInfos([]);
      try {
        const response = await apiClient.current.ec.getEcOrderByStore({
          storeId,
          status: params?.status,
          shippingMethodId: params?.shippingMethodId,
          orderPaymentMethod: params?.orderPaymentMethod,
          orderBy: params?.orderBy,
          id: params?.id,
          orderedAtGte: params?.orderedAtGte?.toISOString(),
          orderedAtLt: params?.orderedAtLt
            ? new Date(
                params.orderedAtLt.setHours(23, 59, 59, 999),
              ).toISOString()
            : undefined,
          platform: 'MYCALINKS',
        });

        // 取得した商品がなければ処理をスキップ
        if (response.storeOrders.length === 0) {
          setOrderInfos([]);
          setIsLoading(false);
          return;
        }
        // 全オーダー分の productId を一括抽出してユニーク化
        const allProductIds = Array.from(
          new Set(
            response.storeOrders.flatMap((o) =>
              o.products.map((p: any) => p.product.id),
            ),
          ),
        );
        // 一度だけ一括フェッチ
        const batchProductsResponse = await api.current.product.listProducts({
          storeID: storeId,
          id: allProductIds,
          includesSummary: true,
        });
        // 全オーダー分のproduct情報を id→product 情報に変換
        const productsMap = new Map(
          batchProductsResponse.products.map((p) => [p.id, p]),
        );
        // 直列処理に変更
        const convertedOrders: OrderInfo[] = [];
        for (const storeOrder of response.storeOrders) {
          try {
            const convertedOrder: OrderInfo = {
              orderId: storeOrder.order.id,
              status: storeOrder.status as OrderStatus,
              orderDate: storeOrder.order.ordered_at
                ? new Date(storeOrder.order.ordered_at)
                : new Date(),
              paymentMethod: storeOrder.order.payment_method ?? '',
              deliveryMethod: {
                id: storeOrder.shipping_method?.id ?? 0,
                displayName: storeOrder.shipping_method?.display_name ?? '',
              },
              items: storeOrder.products.map((product: any) => {
                const productInfo = productsMap.get(product.product.id);
                if (!productInfo) {
                  console.warn(
                    `商品情報が見つかりません: ${product.product.id}`,
                  );
                }
                return {
                  itemId: productInfo?.item_id,
                  productId: productInfo?.id ?? 0,
                  imageUrl: productInfo?.image_url ?? '',
                  name: product.displayNameWithMeta ?? '',
                  condition: productInfo?.condition_option_display_name ?? '',
                  price: product.total_unit_price,
                  quantity: product.item_count,
                  original_item_count: product.original_item_count,
                  item_count: product.item_count,
                  shortage: product.original_item_count - product.item_count,
                  addInfo: {
                    isCustomerChange:
                      product.original_item_count !== product.item_count,
                    customerChangeQuantity:
                      product.original_item_count !== product.item_count
                        ? product.item_count
                        : null,
                  },
                };
              }),
              totalAmount: storeOrder.total_price,
              customerInfo: {
                name: storeOrder.order.customer_name ?? '',
                address: storeOrder.order.shipping_address ?? '',
                phoneNumber: storeOrder.order.customer_phone ?? '',
                email: storeOrder.order.customer_email ?? '',
              },
              addInfo: {
                isCustomerChange: storeOrder.products.some(
                  (product: any) =>
                    product.original_item_count !== product.item_count,
                ),
                read: storeOrder.read,
              },
              shippingTrackingNumber: storeOrder.shipping_tracking_code ?? '',
            };
            convertedOrders.push(convertedOrder);
          } catch (error) {
            console.error('注文情報の変換中にエラーが発生しました:', error);
            // エラーが発生しても処理は継続
            continue;
          }
        }

        setOrderInfos(convertedOrders);
      } catch (error) {
        handleError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [storeId, handleError],
  );

  return {
    fetchOrderInfo,
    orderInfos,
    isLoading,
  };
};
