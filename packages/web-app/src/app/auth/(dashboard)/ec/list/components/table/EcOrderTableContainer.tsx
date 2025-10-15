import React, { useState, useEffect } from 'react';
import { Box, Typography, styled, Checkbox } from '@mui/material';
import {
  ORDER_STATUS_MAP,
  OrderInfo,
  OrderStatus,
} from '@/app/auth/(dashboard)/ec/list/types/OrderInfo';
import { useStore } from '@/contexts/StoreContext';
import { useOrderRead } from '@/app/auth/(dashboard)/ec/list/hooks/useOrderRead';
import { useOrderInfo } from '@/app/auth/(dashboard)/ec/list/hooks/useOrderInfo';
import { OrderModals } from '@/app/auth/(dashboard)/ec/list/components/OrderModals';

import { CustomTable, ColumnDef } from '@/components/tables/CustomTable';
import { EcPaymentMethod } from '@prisma/client';
import { EC_PAYMENT_METHOD_MAP } from '@/constants/shipping';
import { UpdateOrderInfo } from '@/app/auth/(dashboard)/ec/list/components/modal/EcOrderShortageModal';

interface OrderTableContainerProps {
  orders: OrderInfo[];
  selectedOrderIds: number[];
  onSelectedOrderIdsChange: (orderIds: number[]) => void;
  handleTableReset: () => void;
}

// カスタムTableCell
const StyledTableCell = styled('div')<{ isRead: number }>(({ isRead }) => ({
  width: '100%',
  height: '85px',
  minHeight: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: isRead ? 'transparent' : 'rgb(255, 217, 217)',
}));

export const OrderTableContainer: React.FC<OrderTableContainerProps> = ({
  orders,
  selectedOrderIds,
  onSelectedOrderIdsChange,
  handleTableReset,
}) => {
  const { store } = useStore();
  const [localOrders, setLocalOrders] = useState<OrderInfo[]>(orders);

  const updateReadState = (orderId: number) => {
    setLocalOrders((prev) =>
      prev.map((order) =>
        order.orderId === orderId
          ? { ...order, addInfo: { ...order.addInfo, read: true } }
          : order,
      ),
    );
  };
  const { markAsRead } = useOrderRead({
    storeId: store?.id ?? 0,
    onSuccess: updateReadState,
  });
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [shortageModalOpen, setShortageModalOpen] = useState(false);
  const [shortageReportModalOpen, setShortageReportModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [prepareModalOpen, setPrepareModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderInfo | null>(null);
  const [updateOrderInfo, setUpdateOrderInfo] =
    useState<UpdateOrderInfo | null>(null);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const { fetchOrderInfo, orderInfos } = useOrderInfo({
    storeId: store?.id,
  });

  const handleRowClick = async (order: OrderInfo) => {
    if (
      !order.addInfo.read &&
      order.status !== OrderStatus.CANCELED &&
      order.status !== OrderStatus.COMPLETED
    ) {
      await markAsRead(order.orderId);
    }
    setSelectedOrder(order);
    setOrderModalOpen(true);
  };

  const closeAllModals = () => {
    setOrderModalOpen(false);
    setShortageModalOpen(false);
    setShortageReportModalOpen(false);
    setCancelModalOpen(false);
    setPrepareModalOpen(false);
    setCompleteModalOpen(false);
    setSelectedOrder(null);
  };

  const refetchOrderInfo = async () => {
    if (!selectedOrder?.orderId) return;
    setIsRefetching(true);
    try {
      // 注文情報の更新を待つ（3秒）
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await fetchOrderInfo({ id: selectedOrder.orderId });
      // 更新の完了を待つ（200ms）
      await new Promise((resolve) => setTimeout(resolve, 200));
      // orderInfosから最新の注文情報を取得
      const updatedOrder = orderInfos.find(
        (order) => order.orderId === selectedOrder.orderId,
      );
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
      await handleTableReset();
    } catch (error) {
      console.error('注文情報の更新に失敗しました:', error);
    }
    setIsRefetching(false);
  };

  // チェックボックスの選択処理
  const handleCheckboxChange = (orderId: number, checked: boolean) => {
    const newSelectedOrderIds = checked
      ? [...selectedOrderIds, orderId]
      : selectedOrderIds.filter((id) => id !== orderId);
    onSelectedOrderIdsChange(newSelectedOrderIds);
  };

  // 納品書発行可能かチェック
  const isDeliveryNoteAvailable = (order: OrderInfo) => {
    return (
      order.status !== OrderStatus.UNPAID &&
      order.status !== OrderStatus.CANCELED
    );
  };

  // 全選択/全解除
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelectedOrderIds = localOrders
        .filter(isDeliveryNoteAvailable)
        .map((order) => order.orderId);
      onSelectedOrderIdsChange(newSelectedOrderIds);
    } else {
      onSelectedOrderIdsChange([]);
    }
  };

  // orderInfosの変更を監視
  useEffect(() => {
    if (selectedOrder && orderInfos.length > 0) {
      const updatedOrder = orderInfos.find(
        (order) => order.orderId === selectedOrder.orderId,
      );
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    }
  }, [orderInfos, selectedOrder]);
  // ordersの変更を監視
  useEffect(() => {
    setLocalOrders(orders);
    // 注文一覧が変更されたらチェックボックスの選択状態をリセット
    onSelectedOrderIdsChange([]);
  }, [orders, onSelectedOrderIdsChange]);

  // カラム定義
  const columns: ColumnDef<OrderInfo>[] = [
    {
      header: (
        <Checkbox
          checked={
            localOrders.filter(isDeliveryNoteAvailable).length > 0 &&
            selectedOrderIds.length ===
              localOrders.filter(isDeliveryNoteAvailable).length
          }
          indeterminate={
            selectedOrderIds.length > 0 &&
            selectedOrderIds.length <
              localOrders.filter(isDeliveryNoteAvailable).length
          }
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      render: (order) => (
        <StyledTableCell isRead={order.addInfo.read ? 1 : 0}>
          {isDeliveryNoteAvailable(order) ? (
            <Checkbox
              checked={selectedOrderIds.includes(order.orderId)}
              onChange={(e) => {
                e.stopPropagation();
                handleCheckboxChange(order.orderId, e.target.checked);
              }}
            />
          ) : null}
        </StyledTableCell>
      ),
      sx: { width: '60px', p: 0 },
    },
    {
      header: '注文番号',
      render: (order) => (
        <StyledTableCell isRead={order.addInfo.read ? 1 : 0}>
          {order.orderId}
        </StyledTableCell>
      ),
      sx: { width: '150px', p: 0 },
    },
    {
      header: 'ステータス',
      render: (order) => (
        <StyledTableCell isRead={order.addInfo.read ? 1 : 0}>
          {ORDER_STATUS_MAP[order.status as OrderStatus]}
        </StyledTableCell>
      ),
      sx: { width: '200px', p: 0 },
    },
    {
      header: '受注日時',
      render: (order) => (
        <StyledTableCell isRead={order.addInfo.read ? 1 : 0}>
          {order.orderDate
            .toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
            .replace(/\//g, '/')}
        </StyledTableCell>
      ),
      sx: { width: '200px', p: 0 },
    },
    {
      header: '支払方法',
      render: (order) => (
        <StyledTableCell isRead={order.addInfo.read ? 1 : 0}>
          {EC_PAYMENT_METHOD_MAP[order.paymentMethod as EcPaymentMethod] ||
            order.paymentMethod}
        </StyledTableCell>
      ),
      sx: { width: '200px', p: 0 },
    },
    {
      header: '配送方法',
      render: (order) => (
        <StyledTableCell isRead={order.addInfo.read ? 1 : 0}>
          {order.deliveryMethod.displayName}
        </StyledTableCell>
      ),
      sx: { width: '300px', p: 0 },
    },
    {
      header: '商品',
      render: (order) => (
        <StyledTableCell isRead={order.addInfo.read ? 1 : 0}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {order.items[0].name}
            {order.items.length > 1 && (
              <Box
                sx={{
                  backgroundColor: '#f0f0f0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '60px',
                  height: '20px',
                  borderRadius: '4px',
                  padding: '0 4px',
                }}
              >
                <Typography variant="caption">
                  他 {order.items.length - 1}
                  商品
                </Typography>
              </Box>
            )}
          </Box>
        </StyledTableCell>
      ),
      sx: { width: '400px', p: 0 },
    },
    {
      header: '合計金額',
      render: (order) => (
        <StyledTableCell isRead={order.addInfo.read ? 1 : 0}>
          {order.totalAmount.toLocaleString()}円
        </StyledTableCell>
      ),
      sx: { width: '200px', p: 0 },
    },
  ];
  if (!localOrders || localOrders.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6">一つもありません</Typography>
      </Box>
    );
  }

  return (
    <>
      <CustomTable
        columns={columns}
        rows={localOrders}
        rowKey={(order) => order.orderId}
        onRowClick={handleRowClick}
        selectedRow={selectedOrder}
        isLoading={isRefetching}
      />

      <OrderModals
        orderModalOpen={orderModalOpen}
        shortageModalOpen={shortageModalOpen}
        shortageReportModalOpen={shortageReportModalOpen}
        cancelModalOpen={cancelModalOpen}
        prepareModalOpen={prepareModalOpen}
        completeModalOpen={completeModalOpen}
        selectedOrder={selectedOrder}
        updateOrderInfo={updateOrderInfo}
        storeId={store?.id ?? 0}
        onCloseOrderModal={() => setOrderModalOpen(false)}
        onCloseShortageModal={() => setShortageModalOpen(false)}
        onCloseShortageReportModal={() => setShortageReportModalOpen(false)}
        onCloseCancelModal={() => setCancelModalOpen(false)}
        onClosePrepareModal={() => setPrepareModalOpen(false)}
        onCloseCompleteModal={() => setCompleteModalOpen(false)}
        onOpenCancelModal={() => setCancelModalOpen(true)}
        onOpenPrepareModal={() => setPrepareModalOpen(true)}
        onOpenCompleteModal={() => setCompleteModalOpen(true)}
        onOpenShortageReportModal={() => setShortageReportModalOpen(true)}
        onOpenShortageModal={() => setShortageModalOpen(true)}
        setUpdateOrderInfo={setUpdateOrderInfo}
        closeAllModals={closeAllModals}
        refetchOrderInfo={refetchOrderInfo}
        handleTableReset={handleTableReset}
      />
    </>
  );
};
