'use client';

import { useMemo } from 'react';
import { ConsignmentProductSearchType } from '@/feature/consign/components/register/searchModal/type';
import { ConsignmentClient } from '@/feature/consign/hooks/useConsignment';
import { ConsignorSummarySectionContent } from '@/app/auth/(dashboard)/stock/consign/register/components/ConsignorSummarySectionContent';

interface ConsignorSummarySectionProps {
  products: ConsignmentProductSearchType[];
  selectedConsignmentClient: ConsignmentClient | null;
  consignmentClients: ConsignmentClient[] | undefined;
  isSubmitting: boolean;
  onConfirmOrder: () => Promise<void>;
  onConsignmentClientChange: (client: ConsignmentClient | null) => void;
}

export function ConsignorSummarySection({
  products,
  selectedConsignmentClient,
  consignmentClients,
  isSubmitting,
  onConfirmOrder,
  onConsignmentClientChange,
}: ConsignorSummarySectionProps) {
  // 合計金額と点数を計算
  const totalPrice = useMemo(
    () =>
      products.reduce(
        (sum, product) =>
          sum + product.consignmentPrice * product.consignmentCount,
        0,
      ),
    [products],
  );

  const displayItem = useMemo(
    () => [
      {
        title: '販売額合計',
        value: `${totalPrice.toLocaleString()}円`,
      },
      {
        title: '商品点数',
        value: `${products
          .reduce((sum, product) => sum + product.consignmentCount, 0)
          .toLocaleString()}点`,
      },
      {
        title: '見込み手数料(現金)',
        value: `${Math.round(
          totalPrice *
            ((selectedConsignmentClient?.commission_cash_price ?? 0) * 0.01),
        ).toLocaleString()}円`,
      },
      {
        title: '見込み手数料(カード)',
        value: `${Math.round(
          totalPrice *
            ((selectedConsignmentClient?.commission_card_price ?? 0) * 0.01),
        ).toLocaleString()}円`,
      },
    ],
    [products, selectedConsignmentClient, totalPrice],
  );

  return (
    <ConsignorSummarySectionContent
      selectedConsignmentClient={selectedConsignmentClient}
      consignmentClients={consignmentClients}
      displayItem={displayItem}
      isSubmitting={isSubmitting}
      onConfirmOrder={onConfirmOrder}
      onConsignmentClientChange={onConsignmentClientChange}
    />
  );
}
