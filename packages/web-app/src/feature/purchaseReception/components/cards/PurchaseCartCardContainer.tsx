'use client';

import React, { useMemo, useState } from 'react';
import { UnappraisalDetailModal } from '@/feature/purchaseReception/components/modals/UnappraisalDetailModal';
import { AppraisalCompleteModal } from '@/feature/purchaseReception/components/modals/AppraisalCompleteModal';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { TransactionKind } from '@prisma/client';
import { useStore } from '@/contexts/StoreContext';
import { usePurchaseTransaction } from '@/feature/transaction/hooks/usePurchaseTransaction';
import { TransactionCart } from '@/feature/purchaseReception/hooks/useTransactionCart';
import { BackendCustomerAPI } from '@/app/api/store/[store_id]/customer/api';
import { MobileCartResultItem } from '@/components/cards/CartDisplayCard';
import { PurchaseReceptionCartDetail } from '@/feature/purchaseReception/components/cards/PurchaseReceptionCartDetail';
import { useSaveLocalStorage } from '@/feature/purchaseReception/hooks/useSaveLocalStorage';
import { Specialties } from '@/feature/specialty/hooks/useGetSpecialty';
import { useAlert } from '@/contexts/AlertContext';
import { useCreateProduct } from '@/feature/products/hooks/useCreateProduct';
import { useUpdateProduct } from '@/feature/products/hooks/useUpdateProduct';
interface PurchaseCartCardContainerProps {
  cartItems: TransactionCart | null;
  setCartItems: React.Dispatch<React.SetStateAction<TransactionCart | null>>;
  isLoading: boolean;
  customer:
    | BackendCustomerAPI[0]['response']['200'] // getCustomerのレスポンス
    | BackendCustomerAPI[1]['response']['200'][0] // getCustomerByCustomerIDのレスポンス
    | undefined;
  transactionId: number;
  specialties: Specialties;
}

export const PurchaseCartCardContainer: React.FC<
  PurchaseCartCardContainerProps
> = ({
  cartItems,
  setCartItems,
  isLoading,
  customer,
  transactionId,
  specialties,
}) => {
  const [isUnappraisalModalOpen, setUnappraisalModalOpen] = useState(false);
  const [isAppraisalCompleteModalOpen, setAppraisalCompleteModalOpen] =
    useState(false);
  const {
    createDraftAppraisedPurchaseTransaction,
    createDraftUnappreciatedPurchaseTransaction,
  } = usePurchaseTransaction();
  const { setAlertState } = useAlert();
  const router = useRouter();
  const { store } = useStore();
  const { removeLocalStorageItemById } = useSaveLocalStorage();
  const { createProduct } = useCreateProduct();
  const { updateProduct } = useUpdateProduct();

  // 査定完了モーダルのローディング
  const [isAppraisalLoading, setIsAppraisalLoading] = useState(false);

  // 変数を初期化
  const totalProductCount =
    cartItems?.transaction_cart_items.reduce(
      (sum, item) => sum + item.item_count,
      0,
    ) || 0;

  const totalItemCount = cartItems?.transaction_cart_items.length ?? 0;

  const totalAmount =
    cartItems?.transaction_cart_items.reduce(
      (sum, item) =>
        sum +
        (item.unit_price + (item.discount_price ? item.discount_price : 0)) *
          item.item_count,
      0,
    ) || 0;
  const subtotal_price = totalAmount;
  const tax = Math.round(subtotal_price * 0.1);
  const total_price = totalAmount;

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (cartItems) {
      // 該当アイテムのインデックスを検索
      const itemIndex = cartItems.transaction_cart_items.findIndex(
        (item) => item.cart_item_id === id,
      );

      // 該当アイテムが存在する場合のみ更新
      if (itemIndex !== -1) {
        const updatedItems = [...cartItems.transaction_cart_items];
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          item_count: newQuantity, // 数量を更新
        };

        // 更新した配列を状態に反映
        setCartItems({
          ...cartItems,
          transaction_cart_items: updatedItems,
        });
      }
    }
  };

  const handlePriceChange = (id: string, newPrice: number) => {
    if (cartItems) {
      // 該当アイテムのインデックスを検索
      const itemIndex = cartItems.transaction_cart_items.findIndex(
        (item) => item.cart_item_id === id,
      );

      // 該当アイテムが存在する場合のみ更新
      if (itemIndex !== -1) {
        const updatedItems = [...cartItems.transaction_cart_items];
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          unit_price: newPrice, // 価格を更新
        };

        // 更新した配列を状態に反映
        setCartItems({
          ...cartItems,
          transaction_cart_items: updatedItems,
        });
      }
    }
  };

  const handleRemoveItem = (id: string) => {
    if (cartItems) {
      // カート内から特定のアイテムを削除
      const updatedItems = cartItems.transaction_cart_items.filter(
        (item) => item.cart_item_id !== id,
      );

      // 更新した配列を状態に反映
      setCartItems({
        ...cartItems,
        transaction_cart_items: updatedItems,
      });
    }
  };

  // 特殊状態の変更
  const handleSpecialtyChange = (id: string, newSpecialtyId: number) => {
    if (cartItems) {
      // 該当アイテムのインデックスを検索
      const itemIndex = cartItems.transaction_cart_items.findIndex(
        (item) => item.cart_item_id === id,
      );

      if (itemIndex !== -1) {
        const updatedItems = [...cartItems.transaction_cart_items];
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          specialId: newSpecialtyId,
        };
        setCartItems({ ...cartItems, transaction_cart_items: updatedItems });
      }
    }
  };

  // 管理番号の変更
  const handleManagementNumberChange = (
    id: string,
    newManagementNumber: string,
  ) => {
    if (cartItems) {
      // 該当アイテムのインデックスを検索
      const itemIndex = cartItems.transaction_cart_items.findIndex(
        (item) => item.cart_item_id === id,
      );

      if (itemIndex !== -1) {
        const updatedItems = [...cartItems.transaction_cart_items];
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          managementNumber: newManagementNumber,
        };
        setCartItems({ ...cartItems, transaction_cart_items: updatedItems });
      }
    }
  };

  // アイテムの並び替え
  const handleItemsReorder = (reorderedItems: MobileCartResultItem[]) => {
    if (!cartItems) return;

    // MobileCartResultItemからtransaction_cart_itemsの順序を再構築
    const reorderedTransactionItems = reorderedItems.map((reorderedItem) => {
      const originalItem = cartItems.transaction_cart_items.find(
        (item) => item.cart_item_id === reorderedItem.id,
      );
      return originalItem!; // reorderedItemは元のアイテムから来ているので必ず存在する
    });

    setCartItems({
      ...cartItems,
      transaction_cart_items: reorderedTransactionItems,
    });
  };

  // 査定確定がクリックされた後に走る関数
  const handleConfirmAppraisal = () => {
    setUnappraisalModalOpen(true);
  };

  const handleCreateDraft = async () => {
    if (!cartItems) return; // 再確認

    // カートの中に管理番号を入れている商品がある場合はそのプロダクトを作成する
    await Promise.all(
      cartItems.transaction_cart_items.map(async (item) => {
        if (item.hasManagementNumber) {
          //管理番号付きでまだ作成されてない場合は作成
          if (item.product_details.id === -1) {
            //数字のみの場合、文字列に変換しないとエラー出ます
            const managementNumber = item.managementNumber
              ? `${item.managementNumber}`
              : '';

            const res = await createProduct({
              storeId: store.id,
              itemId: item.product_details.item_id,
              requestBody: {
                condition_option_id: item.product_details.condition_option_id,
                specialty_id: item.specialId,
                management_number: managementNumber,
              },
            });

            if (!res) return;

            // 作成したプロダクトのidをカートの中の商品のidに更新
            item.product_details.id = res.id;
          }
          //作成されている場合は更新
          else {
            const res = await updateProduct(store.id, item.product_details.id, {
              managementNumber: item.managementNumber,
            });

            if (!res.success) return;
          }
        }
      }),
    );

    try {
      const res = await createDraftUnappreciatedPurchaseTransaction({
        id: cartItems.id,
        store_id: store.id,
        staff_account_id: cartItems.staff_account_id ?? undefined,
        customer_id: cartItems.customer_id ?? 0,
        total_price: total_price,
        subtotal_price: subtotal_price,
        tax: tax,
        discount_price: cartItems.discount_price,
        carts: cartItems.transaction_cart_items.map((item) => ({
          product_id: item.product_details.id,
          item_count: item.item_count,
          unit_price: item.unit_price,
          original_unit_price:
            item.product_details?.specific_buy_price ??
            item.product_details?.buy_price ??
            0,
          discount_price: item.discount_price,
        })),
        transaction_kind: TransactionKind.buy,
        payment_method: null,
        recieved_price: null,
        change_price: null,
      });

      if (res) {
        router.push(PATH.PURCHASE_RECEPTION.root);
        // 該当の取引のidを持つlocalStorageの中身を削除
        removeLocalStorageItemById(transactionId);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // UnappraisalDetailModal が閉じられた時の処理
  const handleUnappraisalClose = async () => {
    if (!cartItems) return; // 再確認

    setUnappraisalModalOpen(false);
    setAppraisalCompleteModalOpen(true);
  };

  // AppraisalCompleteModal が閉じられた時の処理
  const handleAppraisalCompleteClose = async () => {
    if (!cartItems) return; // 再確認
    try {
      setIsAppraisalLoading(true);

      // カートの中に管理番号を入れている商品がある場合はそのプロダクトを作成する
      await Promise.all(
        cartItems.transaction_cart_items.map(async (item) => {
          if (item.hasManagementNumber) {
            //管理番号付きでまだ作成されてない場合は作成
            if (item.product_details.id === -1) {
              //数字のみの場合、文字列に変換しないとエラー出ます
              const managementNumber = item.managementNumber
                ? `${item.managementNumber}`
                : '';

              const res = await createProduct({
                storeId: store.id,
                itemId: item.product_details.item_id,
                requestBody: {
                  condition_option_id: item.product_details.condition_option_id,
                  specialty_id: item.specialId,
                  management_number: managementNumber,
                },
              });

              if (!res) return;

              // 作成したプロダクトのidをカートの中の商品のidに更新
              item.product_details.id = res.id;
            }
            //作成されている場合は更新
            else {
              const res = await updateProduct(
                store.id,
                item.product_details.id,
                {
                  managementNumber: item.managementNumber,
                },
              );

              if (!res.success) return;
            }
          }
        }),
      );

      const res = await createDraftAppraisedPurchaseTransaction({
        id: cartItems.id,
        store_id: store.id,
        staff_account_id: cartItems.staff_account_id ?? undefined,
        customer_id: cartItems.customer_id ?? 0,
        total_price: total_price,
        subtotal_price: subtotal_price,
        tax: tax,
        discount_price: cartItems.discount_price,
        carts: cartItems.transaction_cart_items.map((item) => ({
          product_id: item.product_details.id,
          item_count: item.item_count,
          unit_price: item.unit_price,
          original_unit_price:
            item.product_details?.specific_buy_price ??
            item.product_details?.buy_price ??
            0,
          discount_price: item.discount_price,
        })),
        transaction_kind: TransactionKind.buy,
        payment_method: null,
        recieved_price: null,
        change_price: null,
      });

      if (res) {
        router.push(PATH.PURCHASE_RECEPTION.root);
        // 該当の取引のidを持つlocalStorageの中身を削除
        removeLocalStorageItemById(transactionId);
      }
    } catch (error) {
      setAlertState({
        message: '商品の作成に失敗しました。',
        severity: 'error',
      });
      console.error(error);
    } finally {
      setIsAppraisalLoading(false);
    }
  };

  const transactionCartItems: MobileCartResultItem[] = useMemo(() => {
    return (
      cartItems?.transaction_cart_items.map((item) => {
        return {
          id: item.cart_item_id,
          productId: item.product_details.id,
          imageUrl: item.product_details.image_url ?? '',
          displayName: item.product_details.displayNameWithMeta,
          conditionName: item.product_details.conditionDisplayName,
          discountPrice: item.discount_price,
          unitPrice: item.unit_price,
          itemCount: item.item_count,
          hasManagementNumber: item.hasManagementNumber,
          managementNumber: item.managementNumber,
          specialId: item.specialId,
        };
      }) || []
    );
  }, [cartItems]);

  return (
    <>
      {/* 査定内容確認モーダル */}
      <UnappraisalDetailModal
        open={isUnappraisalModalOpen}
        onClose={() => setUnappraisalModalOpen(false)}
        onConfirmedClick={handleUnappraisalClose}
        transaction={cartItems}
        isLoading={isLoading}
        specialties={specialties}
      />
      {/* 査定完了モーダル */}
      <AppraisalCompleteModal
        open={isAppraisalCompleteModalOpen}
        onClose={() => setAppraisalCompleteModalOpen(false)}
        onConfirmClick={handleAppraisalCompleteClose}
        purchaseNumber={cartItems?.reception_number || null}
        isLoading={isAppraisalLoading}
        hasCustomer={!!customer}
      />
      {/* 査定内容 */}
      <PurchaseReceptionCartDetail
        totalProductCount={totalProductCount}
        totalItemCount={totalItemCount}
        totalAmount={totalAmount}
        items={transactionCartItems || null}
        onConfirmAppraisal={handleConfirmAppraisal}
        onCreateDraft={handleCreateDraft}
        onQuantityChange={handleQuantityChange}
        isLoading={isLoading}
        customer={customer}
        onPriceChange={handlePriceChange}
        onRemoveItem={handleRemoveItem}
        specialties={specialties}
        onSpecialtyChange={handleSpecialtyChange}
        onManagementNumberChange={handleManagementNumberChange}
        onItemsReorder={handleItemsReorder}
      />
    </>
  );
};
