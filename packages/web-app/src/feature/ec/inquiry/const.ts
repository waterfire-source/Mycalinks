import theme from '@/theme';
import { EcOrderContactStatus } from '@prisma/client';

interface InquiryStatusType {
  key: EcOrderContactStatus;
  label: string;
  color: string;
}
export const InquiryStatus: Record<string, InquiryStatusType> = {
  UNREAD: {
    key: EcOrderContactStatus.UNREAD,
    label: '未読',
    color: theme.palette.primary.main,
  },
  ADDRESSING: {
    key: EcOrderContactStatus.ADDRESSING,
    label: '対応中',
    color: theme.palette.secondary.main,
  },
  SOLVED: {
    key: EcOrderContactStatus.SOLVED,
    label: '完了',
    color: theme.palette.grey[500],
  },
} as const;
export type InquiryStatus = keyof typeof InquiryStatus;

export const OrderKind = {
  ORDER_CONTENT: '注文内容',
  PAYMENT_RELATED: '支払い関連',
  DELIVERY_RELATED: '配送関連',
  RETURN_EXCHANGE: '返品・交換',
  OTHER: 'その他',
} as const;
export type OrderKind = keyof typeof OrderKind;

// 2025/07/09 Kokai ECデプロイ直前の条件検索できない問題の解決のために追加
// できればOrderKindのキーをORDER_CONTENT→order等にしたい方がよいはずだが影響範囲が不明であり、命名も変なのでこれで対応
export const OrderKindSortOptions = {
  ORDER_CONTENT: 'order',
  PAYMENT_RELATED: 'payment',
  DELIVERY_RELATED: 'delivery',
  RETURN_EXCHANGE: 'return',
  OTHER: 'other',
} as const;
export type OrderKindSortOptions =
  (typeof OrderKindSortOptions)[keyof typeof OrderKindSortOptions];

export type OrderBy = 'last_sent_at' | 'order_id';

/**
 * OrderKindSortOptionsのvalueに基づいて、OrderKindのラベルを取得する
 * @param value SortOptionのvalue
 * @returns OrderKindのラベル or '不明な種別'
 */
export const getLabelFromSortValue = (value: OrderKindSortOptions): string => {
  const entry = Object.entries(OrderKindSortOptions).find(
    ([_, v]) => v === value,
  );
  const key = entry?.[0] as keyof typeof OrderKind | undefined;
  return key ? OrderKind[key] : '不明な種別';
};
