import { $Enums } from '@prisma/client';

// ECオーダーのステータス
export const ecOrderStatus = [
  {
    label: '下書き',
    value: $Enums.EcOrderStatus.DRAFT,
  },
  {
    label: '未入金',
    value: $Enums.EcOrderStatus.UNPAID,
  },
  {
    label: '入金済み',
    value: $Enums.EcOrderStatus.PAID,
  },
  {
    label: '発送完了',
    value: $Enums.EcOrderStatus.COMPLETED,
  },
];

// ECオーダーステータスのマッピング
export const EC_ORDER_STATUS_MAP: Record<$Enums.EcOrderStatus, string> = {
  DRAFT: '下書き',
  UNPAID: '未入金',
  PAID: '入金済み',
  COMPLETED: '発送完了',
};

// ECオーダーカートストアのステータス
export const ecOrderCartStoreStatus = [
  {
    label: '下書き',
    value: $Enums.EcOrderCartStoreStatus.DRAFT,
  },
  {
    label: '未入金',
    value: $Enums.EcOrderCartStoreStatus.UNPAID,
  },
  {
    label: '発送準備待ち',
    value: $Enums.EcOrderCartStoreStatus.PREPARE_FOR_SHIPPING,
  },
  {
    label: '発送待機中',
    value: $Enums.EcOrderCartStoreStatus.WAIT_FOR_SHIPPING,
  },
  {
    label: '発送完了',
    value: $Enums.EcOrderCartStoreStatus.COMPLETED,
  },
  {
    label: 'キャンセル済み',
    value: $Enums.EcOrderCartStoreStatus.CANCELED,
  },
];

// ECオーダーカートストアステータスのマッピング
export const EC_ORDER_CART_STORE_STATUS_MAP: Record<
  $Enums.EcOrderCartStoreStatus,
  string
> = {
  DRAFT: '下書き',
  UNPAID: '未入金',
  PREPARE_FOR_SHIPPING: '発送準備待ち',
  WAIT_FOR_SHIPPING: '発送待機中',
  COMPLETED: '発送完了',
  CANCELED: 'キャンセル済み',
};
