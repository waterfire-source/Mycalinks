import { SaleItem } from '@/app/auth/(dashboard)/stock/sale/register/page';
import { getTransactionKindName } from '@/feature/transaction/utlis';

/**
 * セール情報を取引種別（販売/買取）でフィルタリングする
 *
 * @param sales - フィルタリング対象のセール情報配列
 * @param condition - フィルタリング条件（'販売' | '買取' | null）
 * @returns フィルタリングされたセール情報配列
 */
export const filterSalesByTransactionKind = (
  sales: SaleItem[],
  condition: '販売' | '買取' | null,
): SaleItem[] => {
  if (!condition) return sales;
  return sales.filter((sale) => {
    const type = getTransactionKindName(sale.transactionKind);
    return type === condition;
  });
};
