import React, { useState, useEffect, useCallback } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { CustomTab } from '@/components/tabs/CustomTab';
import { ORDER_STATUS_MAP } from '@/app/auth/(dashboard)/ec/list/types/OrderInfo';
import { useOrderInfo } from '@/app/auth/(dashboard)/ec/list/hooks/useOrderInfo';
import { useStore } from '@/contexts/StoreContext';
import {
  EcOrderCartStoreStatus,
  EcPaymentMethod,
  Shipping_Method,
} from '@prisma/client';
import { OrderTableContainer } from '@/app/auth/(dashboard)/ec/list/components/table/EcOrderTableContainer';
import { OrderSearchForm } from '@/app/auth/(dashboard)/ec/list/components/OrderSearchForm';
import { useGetShippingMethod } from '@/app/auth/(dashboard)/ec/list/hooks/useGetShippingMethod';
import { useDeliveryNote } from '@/app/auth/(dashboard)/ec/list/hooks/useDeliveryNote';
import { useAlert } from '@/contexts/AlertContext';
import { useKuronekoShippingLabel } from '@/app/auth/(dashboard)/ec/list/hooks/useKuronekoShippingLabel';

// 支払い方法の表示用マッピング
export const PAYMENT_METHOD_MAP: Record<EcPaymentMethod, string> = {
  [EcPaymentMethod.CARD]: 'クレジットカード',
  [EcPaymentMethod.PAYPAY]: 'PayPay',
  [EcPaymentMethod.CASH_ON_DELIVERY]: '代引き',
  [EcPaymentMethod.CONVENIENCE_STORE]: 'コンビニ決済',
  [EcPaymentMethod.BANK]: '銀行振込',
};

// タブの定義
const ORDER_STATUS_TABS = [
  { key: 'all', value: 'すべて' },
  { key: 'UNPAID', value: ORDER_STATUS_MAP.UNPAID },
  { key: 'PREPARE_FOR_SHIPPING', value: ORDER_STATUS_MAP.PREPARE_FOR_SHIPPING },
  { key: 'WAIT_FOR_SHIPPING', value: ORDER_STATUS_MAP.WAIT_FOR_SHIPPING },
  { key: 'COMPLETED', value: ORDER_STATUS_MAP.COMPLETED },
  { key: 'CANCELED', value: ORDER_STATUS_MAP.CANCELED },
];

export const ECOrderTable: React.FC = () => {
  const { store } = useStore();
  const { fetchOrderInfo, orderInfos, isLoading } = useOrderInfo({
    storeId: store?.id ?? 0,
  });
  const { getShippingMethods } = useGetShippingMethod({
    storeId: store?.id ?? 0,
  });
  const { generateDeliveryNotes, isLoading: isDeliveryNoteLoading } =
    useDeliveryNote({
      storeId: store?.id ?? 0,
    });
  const {
    generateKuronekoShippingLabel,
    isLoading: isKuronekoShippingLabelGenerating,
  } = useKuronekoShippingLabel({
    storeId: store?.id ?? 0,
  });
  const { setAlertState } = useAlert();
  const [currentTab, setCurrentTab] = useState<EcOrderCartStoreStatus | 'all'>(
    'all',
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [shippingMethods, setShippingMethods] = useState<Shipping_Method[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<
    string | null
  >(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [orderId, setOrderId] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [orderedAtGte, setOrderedAtGte] = useState<Date | null>(null);
  const [orderedAtLt, setOrderedAtLt] = useState<Date | null>(null);

  const handleSearch = useCallback(() => {
    if (store?.id) {
      fetchOrderInfo({
        status: currentTab === 'all' ? undefined : currentTab,
        shippingMethodId: selectedShippingMethod
          ? parseInt(selectedShippingMethod)
          : undefined,
        orderPaymentMethod: selectedPaymentMethod as
          | EcPaymentMethod
          | undefined,
        id: orderId ? parseInt(orderId) : undefined,
        orderBy: sortOrder === 'asc' ? 'ordered_at' : '-ordered_at',
        orderedAtGte,
        orderedAtLt,
      });
    }
  }, [
    store?.id,
    fetchOrderInfo,
    currentTab,
    selectedShippingMethod,
    selectedPaymentMethod,
    orderId,
    sortOrder,
    orderedAtGte,
    orderedAtLt,
  ]);

  useEffect(() => {
    if (store?.id) {
      // 配送方法を取得
      const fetchShippingMethods = async () => {
        try {
          const response = await getShippingMethods();
          setShippingMethods(response?.shippingMethods ?? []);
        } catch (error) {
          setAlertState({
            message: `配送方法の取得に失敗しました: ${error}`,
            severity: 'error',
          });
        }
      };
      fetchShippingMethods();
    }
  }, [store?.id, getShippingMethods]);

  // 初期データ取得用のuseEffect
  useEffect(() => {
    if (store?.id) {
      handleSearch();
    }
  }, [store?.id, handleSearch]);

  // 検索条件変更時のuseEffect（注文番号以外）
  useEffect(() => {
    if (store?.id) {
      handleSearch();
    }
  }, [
    currentTab,
    selectedShippingMethod,
    sortOrder,
    orderedAtGte,
    orderedAtLt,
    handleSearch,
    store?.id,
  ]);

  // 納品書発行処理
  const handleDeliveryNoteGeneration = async () => {
    try {
      const success = await generateDeliveryNotes(selectedOrderIds);
      if (success) {
        setSelectedOrderIds([]);
      }
    } catch (error) {
      setAlertState({
        message: `納品書発行に失敗しました: ${error}`,
        severity: 'error',
      });
    }
  };

  const handleKuronekoShippingLabelGeneration = async () => {
    try {
      const success = await generateKuronekoShippingLabel(selectedOrderIds);
      if (success) {
        setSelectedOrderIds([]);
      }
    } catch (error) {
      setAlertState({
        message: `送り状発行に失敗しました: ${error}`,
        severity: 'error',
      });
    }
  };

  // タブソートがフロントの処理である以上、全件取得のみ対応
  const handleTabChange = (value: string) => {
    setCurrentTab(value as EcOrderCartStoreStatus);
    // タブ変更時に即座にAPIを呼び出す
    if (store?.id) {
      fetchOrderInfo({
        status: value === 'all' ? undefined : (value as EcOrderCartStoreStatus),
        shippingMethodId: selectedShippingMethod
          ? parseInt(selectedShippingMethod)
          : undefined,
        orderPaymentMethod: selectedPaymentMethod as
          | EcPaymentMethod
          | undefined,
        id: orderId ? parseInt(orderId) : undefined,
        orderBy: sortOrder === 'asc' ? 'ordered_at' : '-ordered_at',
        orderedAtGte,
        orderedAtLt,
      });
    }
  };

  const handleTableReset = () => {
    handleSearch();
  };

  return (
    <CustomTab
      tabs={ORDER_STATUS_TABS}
      header={
        <OrderSearchForm
          selectedShippingMethod={selectedShippingMethod}
          selectedPaymentMethod={selectedPaymentMethod}
          sortOrder={sortOrder}
          orderId={orderId}
          shippingMethods={shippingMethods}
          onShippingMethodChange={setSelectedShippingMethod}
          onPaymentMethodChange={setSelectedPaymentMethod}
          onSortOrderChange={setSortOrder}
          onOrderIdChange={setOrderId}
          onSearch={handleSearch}
          selectedOrderIds={selectedOrderIds}
          isDeliveryNoteLoading={isDeliveryNoteLoading}
          onDeliveryNoteGeneration={handleDeliveryNoteGeneration}
          isKuronekoShippingLabelGenerating={isKuronekoShippingLabelGenerating}
          onKuronekoShippingLabelGeneration={
            handleKuronekoShippingLabelGeneration
          }
          orderedAtGte={orderedAtGte}
          orderedAtLt={orderedAtLt}
          onOrderedAtGteChange={setOrderedAtGte}
          onOrderedAtLtChange={setOrderedAtLt}
        />
      }
      content={
        isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <OrderTableContainer
            orders={orderInfos}
            selectedOrderIds={selectedOrderIds}
            onSelectedOrderIdsChange={setSelectedOrderIds}
            handleTableReset={handleTableReset}
          />
        )
      }
      onTabChange={handleTabChange}
    />
  );
};
