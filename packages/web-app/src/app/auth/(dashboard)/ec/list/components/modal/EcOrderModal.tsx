import { Box, Checkbox, Typography } from '@mui/material';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import {
  ORDER_STATUS_MAP,
  OrderInfo,
  OrderStatus,
} from '@/app/auth/(dashboard)/ec/list/types/OrderInfo';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { CustomTable, ColumnDef } from '@/components/tables/CustomTable';
import { EcPaymentMethod } from '@prisma/client';
import { EC_PAYMENT_METHOD_MAP } from '@/constants/shipping';
import { ItemText } from '@/feature/item/components/ItemText';
import { HelpIcon } from '@/components/common/HelpIcon';

interface ECOrderModalProps {
  open: boolean;
  onClose: () => void;
  onCancel: () => void;
  onPrepare: () => void;
  onComplete: () => void;
  orderInfo: OrderInfo;
  onShortageClick: () => void;
}

export const ECOrderModal = ({
  open,
  onClose,
  onCancel,
  onPrepare,
  onComplete,
  orderInfo,
  onShortageClick,
}: ECOrderModalProps) => {
  if (!orderInfo) return null;

  // 発送先情報テーブルのカラム定義
  const shippingInfoColumns: ColumnDef<OrderInfo>[] = [
    {
      header: '',
      render: () => '',
      key: 'spacer1',
    },
    {
      header: '発送先',
      render: (order) => order.customerInfo.address,
      key: 'address',
    },
    {
      header: 'お客様氏名',
      render: (order) => order.customerInfo.name,
      key: 'name',
    },
    {
      header: '電話番号',
      render: (order) => order.customerInfo.phoneNumber,
      key: 'phoneNumber',
    },
    {
      header: 'メールアドレス',
      render: (order) => order.customerInfo.email,
      key: 'email',
    },
    {
      header: '受注日時',
      render: (order) =>
        order.orderDate.toLocaleString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      key: 'orderDate',
    },
    {
      header: '支払方法',
      render: (order) =>
        EC_PAYMENT_METHOD_MAP[order.paymentMethod as EcPaymentMethod] ||
        order.paymentMethod,
      key: 'paymentMethod',
    },
    {
      header: '配送方法',
      render: (order) => order.deliveryMethod.displayName,
      key: 'deliveryMethod',
    },
    {
      header: '',
      render: () => '',
      key: 'spacer2',
    },
  ];

  // 発送先情報テーブルのカラム定義（発送完了）
  const completedShippingInfoColumns: ColumnDef<OrderInfo>[] = [
    {
      header: '',
      render: () => '',
      key: 'spacer1',
    },
    {
      header: '発送先',
      render: (order) => order.customerInfo.address,
      key: 'address',
    },
    {
      header: 'お客様氏名',
      render: (order) => order.customerInfo.name,
      key: 'name',
    },
    {
      header: '電話番号',
      render: (order) => order.customerInfo.phoneNumber,
      key: 'phoneNumber',
    },
    {
      header: 'メールアドレス',
      render: (order) => order.customerInfo.email,
      key: 'email',
    },
    {
      header: '受注日時',
      render: (order) =>
        order.orderDate.toLocaleString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      key: 'orderDate',
    },
    {
      header: '支払方法',
      render: (order) =>
        EC_PAYMENT_METHOD_MAP[order.paymentMethod as EcPaymentMethod] ||
        order.paymentMethod,
      key: 'paymentMethod',
    },
    {
      header: '配送方法',
      render: (order) => order.deliveryMethod.displayName,
      key: 'deliveryMethod',
    },
    {
      header: '追跡番号',
      render: (order) => order.shippingTrackingNumber,
      key: 'shippingTrackingNumber',
    },
    {
      header: '',
      render: () => '',
      key: 'spacer2',
    },
  ];

  // 注文商品テーブルのカラム定義
  const orderItemsColumns: ColumnDef<OrderInfo['items'][0]>[] = [
    {
      header: '商品画像',
      render: (item) => <ItemImage imageUrl={item.imageUrl} height={72} />,
      key: 'image',
      sx: { textAlign: 'center' },
    },
    {
      header: '商品',
      render: (item) => <ItemText text={item.name} />,
      key: 'name',
    },
    {
      header: '状態',
      render: (item) => item.condition,
      key: 'condition',
    },
    {
      header: '販売額',
      render: (item) => `${item.price.toLocaleString()}円`,
      key: 'price',
    },
    {
      header: '注文数',
      render: (item) => {
        if (
          orderInfo.status !== 'PREPARE_FOR_SHIPPING' &&
          item.original_item_count !== item.item_count
        ) {
          return (
            <span style={{ color: 'red', fontWeight: 'bold' }}>
              {item.original_item_count}→{item.item_count}
            </span>
          );
        }
        return item.original_item_count;
      },
      key: 'original_item_count',
    },
    ...(orderInfo.status === 'PREPARE_FOR_SHIPPING'
      ? [
          {
            header: '欠品',
            render: (item: OrderInfo['items'][0]) => {
              const shortage = item.original_item_count - item.item_count;
              return (
                <span style={{ color: shortage !== 0 ? 'red' : 'inherit' }}>
                  {shortage !== 0 ? shortage : 'なし'}
                </span>
              );
            },
            key: 'shortage',
          },
          {
            header: 'チェック',
            render: () => (
              <Checkbox sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }} />
            ),
            key: 'checkbox',
            sx: { textAlign: 'center' },
          },
        ]
      : []),
    {
      header: '',
      render: () => '',
      key: 'spacer',
    },
  ];

  // OrderStatusに応じてモーダルを返す
  switch (orderInfo.status) {
    case OrderStatus.UNPAID:
      return (
        <CustomModalWithIcon
          open={open}
          onClose={onClose}
          title={`注文番号：${orderInfo.orderId} ${
            ORDER_STATUS_MAP[orderInfo.status]
          }`}
          width="90%"
          height="90%"
          cancelButtonText="閉じる"
          onCancelClick={onClose}
          secondActionButtonText="注文をキャンセル"
          onSecondActionButtonClick={onCancel}
          secondActionButtonHelpArchivesNumber={2726}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              height: '100%',
            }}
          >
            {/* 発送先情報 */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: '0 0 4px 4px',
                borderTop: '7px solid rgba(184,42,42,1)',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                flex: '0 0 auto',
              }}
            >
              <CustomTable
                columns={shippingInfoColumns}
                rows={[orderInfo]}
                rowKey={() => 'shipping-info'}
                sx={{ maxHeight: '150px' }}
              />
            </Box>

            {/* 注文商品 */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: '0 0 4px 4px',
                borderTop: '7px solid rgba(184,42,42,1)',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                flex: '1 1 auto',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h1" sx={{ p: 2, mb: 2, px: 5 }}>
                注文商品
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  borderTop: '1px solid rgba(224, 224, 224, 1)',
                }}
              >
                <CustomTable
                  columns={orderItemsColumns}
                  rows={orderInfo.items}
                  rowKey={(item) => item.productId}
                  sx={{ maxHeight: 'calc(100% - 60px)' }}
                />
              </Box>
            </Box>
          </Box>
        </CustomModalWithIcon>
      );

    case OrderStatus.PREPARE_FOR_SHIPPING:
      return (
        <CustomModalWithIcon
          open={open}
          onClose={onClose}
          title={`注文番号：${orderInfo.orderId} ${
            ORDER_STATUS_MAP[orderInfo.status]
          }`}
          width="90%"
          height="90%"
          actionButtonText="発送準備完了"
          actionButtonHelpArchivesNumber={2490}
          onActionButtonClick={onPrepare}
          cancelButtonText="閉じる"
          onCancelClick={onClose}
          secondActionButtonText="注文をキャンセル"
          onSecondActionButtonClick={onCancel}
          secondActionButtonHelpArchivesNumber={2726}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              height: '100%',
            }}
          >
            {/* 発送先情報 */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: '0 0 4px 4px',
                borderTop: '7px solid rgba(184,42,42,1)',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                flex: '0 0 auto',
              }}
            >
              <CustomTable
                columns={shippingInfoColumns}
                rows={[orderInfo]}
                rowKey={() => 'shipping-info'}
                sx={{ maxHeight: '150px' }}
              />
            </Box>

            {/* 注文商品 */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: '0 0 4px 4px',
                borderTop: '7px solid rgba(184,42,42,1)',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                flex: '1 1 auto',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h1" sx={{ p: 2, mb: 2, px: 5 }}>
                注文商品
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  borderTop: '1px solid rgba(224, 224, 224, 1)',
                }}
              >
                <CustomTable
                  columns={orderItemsColumns}
                  rows={orderInfo.items}
                  rowKey={(item) => item.productId}
                  sx={{ maxHeight: 'calc(100% - 60px)' }}
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  borderTop: '1px solid rgba(224, 224, 224, 1)',
                  p: 2,
                }}
              >
                <HelpIcon helpArchivesNumber={2824} />
                <SecondaryButton onClick={onShortageClick}>
                  欠品報告
                </SecondaryButton>
              </Box>
            </Box>
          </Box>
        </CustomModalWithIcon>
      );

    case OrderStatus.PROCESSING_MISSING_ITEM:
      return (
        <CustomModalWithIcon
          open={open}
          onClose={onClose}
          title={`注文番号：${orderInfo.orderId} ${
            ORDER_STATUS_MAP[orderInfo.status]
          }`}
          width="90%"
          height="90%"
          cancelButtonText="閉じる"
          onCancelClick={onClose}
          secondActionButtonText="注文をキャンセル"
          onSecondActionButtonClick={onCancel}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              height: '100%',
            }}
          >
            {/* 発送先情報 */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: '0 0 4px 4px',
                borderTop: '7px solid rgba(184,42,42,1)',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                flex: '0 0 auto',
              }}
            >
              <CustomTable
                columns={shippingInfoColumns}
                rows={[orderInfo]}
                rowKey={() => 'shipping-info'}
                sx={{ maxHeight: '150px' }}
              />
            </Box>

            {/* 注文商品 */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: '0 0 4px 4px',
                borderTop: '7px solid rgba(184,42,42,1)',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                flex: '1 1 auto',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h1" sx={{ p: 2, mb: 2, px: 5 }}>
                注文商品
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  borderTop: '1px solid rgba(224, 224, 224, 1)',
                }}
              >
                <CustomTable
                  columns={orderItemsColumns}
                  rows={orderInfo.items}
                  rowKey={(item) => item.productId}
                  sx={{ maxHeight: 'calc(100% - 60px)' }}
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  borderTop: '1px solid rgba(224, 224, 224, 1)',
                  p: 2,
                }}
              >
                <SecondaryButton onClick={onShortageClick}>
                  欠品報告
                </SecondaryButton>
              </Box>
            </Box>
          </Box>
        </CustomModalWithIcon>
      );

    case OrderStatus.WAIT_FOR_SHIPPING:
      return (
        <CustomModalWithIcon
          open={open}
          onClose={onClose}
          title={`注文番号：${orderInfo.orderId} ${
            ORDER_STATUS_MAP[orderInfo.status]
          }`}
          width="90%"
          height="90%"
          actionButtonText="発送完了"
          actionButtonHelpArchivesNumber={2490}
          onActionButtonClick={onComplete}
          cancelButtonText="閉じる"
          onCancelClick={onClose}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              height: '100%',
            }}
          >
            {/* 発送先情報 */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: '0 0 4px 4px',
                borderTop: '7px solid rgba(184,42,42,1)',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                flex: '0 0 auto',
              }}
            >
              <CustomTable
                columns={shippingInfoColumns}
                rows={[orderInfo]}
                rowKey={() => 'shipping-info'}
                sx={{ maxHeight: '150px' }}
              />
            </Box>

            {/* 注文商品 */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: '0 0 4px 4px',
                borderTop: '7px solid rgba(184,42,42,1)',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                flex: '1 1 auto',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h1" sx={{ p: 2, mb: 2, px: 5 }}>
                注文商品
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  borderTop: '1px solid rgba(224, 224, 224, 1)',
                }}
              >
                <CustomTable
                  columns={orderItemsColumns}
                  rows={orderInfo.items}
                  rowKey={(item) => item.productId}
                  sx={{ maxHeight: 'calc(100% - 60px)' }}
                />
              </Box>
            </Box>
          </Box>
        </CustomModalWithIcon>
      );

    case OrderStatus.COMPLETED:
      return (
        <CustomModalWithIcon
          open={open}
          onClose={onClose}
          title={`注文番号：${orderInfo.orderId} ${
            ORDER_STATUS_MAP[orderInfo.status]
          }`}
          width="90%"
          height="90%"
          cancelButtonText="閉じる"
          onCancelClick={onClose}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              height: '100%',
            }}
          >
            {/* 発送先情報 */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: '0 0 4px 4px',
                borderTop: '7px solid rgba(184,42,42,1)',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                flex: '0 0 auto',
              }}
            >
              <CustomTable
                columns={completedShippingInfoColumns}
                rows={[orderInfo]}
                rowKey={() => 'shipping-info'}
                sx={{ maxHeight: '150px' }}
              />
            </Box>

            {/* 注文商品 */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: '0 0 4px 4px',
                borderTop: '7px solid rgba(184,42,42,1)',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                flex: '1 1 auto',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h1" sx={{ p: 2, mb: 2, px: 5 }}>
                注文商品
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  borderTop: '1px solid rgba(224, 224, 224, 1)',
                }}
              >
                <CustomTable
                  columns={orderItemsColumns}
                  rows={orderInfo.items}
                  rowKey={(item) => item.productId}
                  sx={{ maxHeight: 'calc(100% - 60px)' }}
                />
              </Box>
            </Box>
          </Box>
        </CustomModalWithIcon>
      );
    case OrderStatus.CANCELED:
      return (
        <CustomModalWithIcon
          open={open}
          onClose={onClose}
          title={`注文番号：${orderInfo.orderId} ${
            ORDER_STATUS_MAP[orderInfo.status]
          }`}
          width="90%"
          height="90%"
          cancelButtonText="閉じる"
          onCancelClick={onClose}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              height: '100%',
            }}
          >
            {/* 発送先情報 */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: '0 0 4px 4px',
                borderTop: '7px solid rgba(184,42,42,1)',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                flex: '0 0 auto',
              }}
            >
              <CustomTable
                columns={shippingInfoColumns}
                rows={[orderInfo]}
                rowKey={() => 'shipping-info'}
                sx={{ maxHeight: '150px' }}
              />
            </Box>

            {/* 注文商品 */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: '0 0 4px 4px',
                borderTop: '7px solid rgba(184,42,42,1)',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                flex: '1 1 auto',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h1" sx={{ p: 2, mb: 2, px: 5 }}>
                注文商品
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  borderTop: '1px solid rgba(224, 224, 224, 1)',
                }}
              >
                <CustomTable
                  columns={orderItemsColumns}
                  rows={orderInfo.items}
                  rowKey={(item) => item.productId}
                  sx={{ maxHeight: 'calc(100% - 60px)' }}
                />
              </Box>
            </Box>
          </Box>
        </CustomModalWithIcon>
      );

    default:
      return null;
  }
};
