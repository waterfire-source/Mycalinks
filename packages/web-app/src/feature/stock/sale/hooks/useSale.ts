import { useCallback } from 'react';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { SaleAPI } from '@/api/frontend/sale/api';
import { SaleStatus, TransactionKind, SaleRule } from '@prisma/client';

/**
 * セールのタブ種別を定義
 */
export enum SaleTab {
  ACTIVE = 'ACTIVE', // 実施中
  SCHEDULED = 'SCHEDULED', // 実施前
  FINISHED = 'FINISHED', // 完了
  STOPPED = 'STOPPED', // 中止中
  PAUSED = 'PAUSED', // 中止
  ALL = 'ALL', // すべて
}

/**
 * セール情報の型定義
 */
export interface SaleItem {
  id: number;
  storeId: number;
  status: SaleStatus;
  onPause: boolean;
  displayName: string;
  transactionKind: TransactionKind;
  startDatetime: Date;
  discountAmount: string | null;
  endDatetime: Date | null;
  endTotalItemCount: number | null;
  endUnitItemCount: number | null;
  repeatCronRule: string | null;
  saleEndDatetime: Date | null;
  createdAt: Date;
  updatedAt: Date;
  products: Array<{
    rule: SaleRule;
    productId: number;
    productName: string;
    productDisplayNameWithMeta: string;
  }>;
  departments: Array<{
    rule: SaleRule;
    itemGenreId: number;
    itemGenreDisplayName: string;
    itemCategoryId: number;
    itemCategoryDisplayName: string;
  }>;
}

/**
 * セール関連の操作を管理するカスタムフック
 */
export const useSale = () => {
  const clientAPI = createClientAPI();
  const { setAlertState } = useAlert();

  // セール情報の取得
  const fetchSales = useCallback(
    async (
      storeId: number,
      query: {
        status?: SaleTab;
        id?: number;
      },
    ): Promise<SaleItem[] | CustomError> => {
      let status: SaleStatus | undefined;
      let onPause: boolean | undefined;

      // タブの種別に応じてステータスと一時停止フラグを設定
      if (query.status) {
        switch (query.status) {
          case SaleTab.ACTIVE:
            status = SaleStatus.ON_HELD;
            onPause = false;
            break;
          case SaleTab.SCHEDULED:
            status = SaleStatus.NOT_HELD;
            onPause = false;
            break;
          case SaleTab.FINISHED:
            status = SaleStatus.FINISHED;
            onPause = false;
            break;
          case SaleTab.STOPPED:
            status = SaleStatus.ON_HELD;
            onPause = true;
            break;
          case SaleTab.PAUSED:
            status = SaleStatus.FINISHED;
            onPause = true;
            break;
          case SaleTab.ALL:
            status = undefined;
            onPause = undefined;
            break;
          default:
            status = undefined;
            onPause = undefined;
        }
      }

      const response = await clientAPI.sale.getSales({
        storeID: storeId,
        query: {
          status,
          onPause,
          id: query.id,
        },
      });

      if (response instanceof CustomError) {
        console.error('Failed to fetch sales:', response);
        setAlertState({
          message: `セールの取得に失敗しました。${response.status}:${response.message}`,
          severity: 'error',
        });
        return response;
      }

      if ('sales' in response) {
        return response.sales;
      }

      return [];
    },
    [clientAPI.sale, setAlertState],
  );

  // セールの作成
  const createSale = useCallback(
    async (
      request: SaleAPI['createSale']['request'],
    ): Promise<SaleAPI['createSale']['response']> => {
      const response = await clientAPI.sale.createSale(request);
      if (response instanceof CustomError) {
        console.error('Failed to create sale:', response);
        setAlertState({
          message: `セールの作成に失敗しました。${response.status}:${response.message}`,
          severity: 'error',
        });
        return response;
      }
      setAlertState({
        message: 'セールを作成しました',
        severity: 'success',
      });
      return response;
    },
    [clientAPI.sale, setAlertState],
  );

  // セールの更新
  const updateSale = useCallback(
    async (
      request: SaleAPI['updateSale']['request'],
      message?: string,
    ): Promise<SaleAPI['updateSale']['response']> => {
      const response = await clientAPI.sale.updateSale(request);
      if (response instanceof CustomError) {
        console.error('Failed to update sale:', response);
        setAlertState({
          message: `セールの更新に失敗しました。${response.status}:${response.message}`,
          severity: 'error',
        });
        return response;
      }
      setAlertState({
        message: message ?? 'セールを更新しました',
        severity: 'success',
      });
      return response;
    },
    [clientAPI.sale, setAlertState],
  );

  // セールの削除
  const deleteSale = useCallback(
    async (
      request: SaleAPI['deleteSale']['request'],
    ): Promise<SaleAPI['deleteSale']['response']> => {
      const response = await clientAPI.sale.deleteSale(request);
      if (response instanceof CustomError) {
        console.error('Failed to delete sale:', response);
        setAlertState({
          message: `セールの削除に失敗しました。${response.status}:${response.message}`,
          severity: 'error',
        });
        return response;
      }
      return response;
    },
    [clientAPI.sale, setAlertState],
  );

  return { fetchSales, createSale, updateSale, deleteSale };
};
