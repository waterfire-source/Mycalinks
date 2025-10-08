'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MYCALINKS_PATH } from '@/app/mycalinks/(core)/constants/paths';
import { mycalinksTransactionImplement } from '@/api/frontend/mycalinks/transaction/implement';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useGlobalNotify } from '@/app/mycalinks/(auth)/assessment/hooks/useGlobalNotify';
import {
  transactionInfoType,
  ModifiedTransactionCart,
} from '@/app/mycalinks/(auth)/assessment/types/assessment';

export const useAssessmentLogic = (selectedStoreId?: number) => {
  const router = useRouter();
  const { setAlertState } = useAlert();
  const { notifyInfo } = useGlobalNotify(selectedStoreId);
  const clientAPI = useMemo(() => createClientAPI(), []);

  // 状態管理
  const [transactionInfo, setTransactionInfo] =
    useState<transactionInfoType | null>(null);
  const [selectedItem, setSelectedItem] =
    useState<ModifiedTransactionCart | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  // ハンドラー
  const openModal = useCallback((item: ModifiedTransactionCart) => {
    setSelectedItem({ ...item });
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedItem(null);
  }, []);

  // 署名完了
  const handleConfirmSignature = useCallback(() => {
    localStorage.removeItem('purchaseConfirmation');
    router.push(MYCALINKS_PATH.ASSESSMENT.thanks);
    setSignatureModalVisible(false);
  }, [router]);

  // 買取確定
  const handleConfirmAssessment = useCallback(async () => {
    if (!transactionInfo?.transaction_carts) return;
    try {
      const res =
        await clientAPI.mycalinksTransaction.putPosTransactionCustomerCart({
          transactionId: transactionInfo?.id || 0,
          carts: transactionInfo?.transaction_carts.map((cart) => ({
            product_id: cart.product__id,
            item_count: cart.item_count,
            unit_price: cart.unit_price,
            discount_price: cart.discount_price,
          })),
        });
      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      localStorage.setItem(
        'purchaseConfirmation',
        JSON.stringify({
          id: notifyInfo?.purchaseReception.id || 0,
          isAccepted: true,
        }),
      );
      setAlertModalVisible(false);
      setSignatureModalVisible(true);
    } catch (error) {
      console.error(error);
      setAlertState({
        message: '数量の更新に失敗しました',
        severity: 'error',
      });
    }
  }, [transactionInfo, notifyInfo, setAlertState]);

  // 数量変更
  const handleConfirmQuantityChange = useCallback(
    async (newQuantity: number) => {
      if (selectedItem) {
        setTransactionInfo((prev) => {
          if (!prev) return null;
          const updatedItems = prev.transaction_carts.map((item) =>
            item.product__id == selectedItem.product__id &&
            item.unit_price == selectedItem.unit_price
              ? { ...item, item_count: newQuantity }
              : item,
          );

          const newTotalPrice = updatedItems.reduce((curSum, e) => {
            const unitPrice =
              (e.unit_price || 0) +
              (e.discount_price || 0) +
              (e.sale_discount_price || 0);
            return curSum + unitPrice * e.item_count;
          }, 0);

          return {
            ...prev,
            total_price: newTotalPrice,
            transaction_carts: updatedItems,
          };
        });
      }
    },
    [selectedItem],
  );

  // Effects
  // 取引詳細情報取得
  //スクリーンが呼び出されるごとに取引の詳細を取得する
  useEffect(() => {
    const fetch = async () => {
      if (
        notifyInfo?.purchaseReception.id &&
        notifyInfo?.purchaseReception.assessed
      ) {
        const detailInfo =
          await mycalinksTransactionImplement().getPosTransactionDetail({
            transactionId: notifyInfo?.purchaseReception?.id,
          });

        if (detailInfo instanceof CustomError) {
          setAlertState({
            message: ' 取引情報の取得に失敗しました',
            severity: 'error',
          });
          return;
        }
        // stateに更新済みの情報を保存
        const updatedDetailInfo = {
          ...detailInfo,
          transaction_carts: detailInfo?.transaction_carts?.map((cart) => ({
            ...cart,
            max_item_count: cart.item_count,
          })),
        };

        setTransactionInfo(updatedDetailInfo);
      }
    };
    fetch();
  }, [
    notifyInfo?.purchaseReception.id,
    notifyInfo?.purchaseReception.receptionNumber,
    notifyInfo?.purchaseReception.assessed,
    setAlertState,
  ]);

  // 署名モーダル表示制御
  useEffect(() => {
    const purchaseConfirmation = localStorage.getItem('purchaseConfirmation');
    if (!purchaseConfirmation) return;
    const purchaseConfirmationJson = JSON.parse(purchaseConfirmation);
    if (
      purchaseConfirmationJson.isAccepted &&
      purchaseConfirmationJson.id === notifyInfo?.purchaseReception.id
    ) {
      setSignatureModalVisible(true);
    }
  }, [notifyInfo?.purchaseReception.id]);

  return {
    // 状態
    transactionInfo,
    selectedItem,
    modalVisible,
    signatureModalVisible,
    alertModalVisible,
    notifyInfo,
    // ハンドラー
    openModal,
    closeModal,
    handleConfirmSignature,
    handleConfirmAssessment,
    handleConfirmQuantityChange,
    // モーダル制御
    setAlertModalVisible,
  };
};
