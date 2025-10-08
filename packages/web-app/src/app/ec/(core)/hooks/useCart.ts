'use client';

import { useContext } from 'react';
import { CartContext } from '@/app/ec/(core)/contexts/CartContext';
import { useAlert } from '@/contexts/AlertContext';
import { CustomError } from '@/api/implement';

export const useCart = () => {
  const context = useContext(CartContext);
  const { setAlertState } = useAlert();

  if (!context) {
    throw new Error(
      'useCartはCartProviderの中で使用する必要があります。コンポーネントがCartProviderでラップされていることを確認してください。',
    );
  }

  // CartContextの元のメソッドをラップしてエラーハンドリングを強化
  const originalContext = { ...context };

  // ドラフトカート取得時のエラーハンドリングを強化
  const fetchDraftCart = async () => {
    try {
      return await originalContext.fetchDraftCart();
    } catch (error) {
      if (error instanceof CustomError) {
        setAlertState({
          message: 'カート情報の取得に失敗しました: ' + error.message,
          severity: 'error',
        });
      } else {
        setAlertState({
          message: 'カート情報の取得中にエラーが発生しました',
          severity: 'error',
        });
      }
      return null;
    }
  };

  // カート詳細情報取得時のエラーハンドリングを強化
  const fetchDraftCartDetails = async (prefecture?: string) => {
    try {
      return await originalContext.fetchDraftCartDetails(prefecture);
    } catch (error) {
      if (error instanceof CustomError) {
        setAlertState({
          message: 'カート詳細情報の取得に失敗しました: ' + error.message,
          severity: 'error',
        });
      } else {
        setAlertState({
          message: 'カート詳細情報の取得中にエラーが発生しました',
          severity: 'error',
        });
      }
      return null;
    }
  };

  // カート情報更新時のエラーハンドリングを強化
  const refreshCart = async () => {
    try {
      await originalContext.refreshCart();
    } catch (error) {
      if (error instanceof CustomError) {
        setAlertState({
          message: 'カート情報の更新に失敗しました: ' + error.message,
          severity: 'error',
        });
      } else {
        setAlertState({
          message: 'カート情報の更新中にエラーが発生しました',
          severity: 'error',
        });
      }
    }
  };

  return {
    ...originalContext,
    fetchDraftCart,
    fetchDraftCartDetails,
    refreshCart,
  };
};
