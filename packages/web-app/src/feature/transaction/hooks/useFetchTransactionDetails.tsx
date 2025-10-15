import { useState, useCallback, useMemo } from 'react';
import { useAlert } from '@/contexts/AlertContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { useStore } from '@/contexts/StoreContext';
import {
  Transaction,
  Payment,
  Product,
  Transaction_Cart,
  Account,
  Transaction_Customer_Cart,
} from '@prisma/client';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';

export interface TransactionWithProductDetailsType {
  id: Transaction['id'];
  reception_number?: Transaction['reception_number'];
  staff_account_id?: Transaction['staff_account_id'];
  staff_account_name?: Account['display_name']; //取引を完了したスタッフのアカウント名
  reception_staff_account_name?: Account['display_name']; //受付担当者のアカウント名（買取受付など）
  input_staff_account_name?: Account['display_name']; //入力担当者のアカウント名（買取査定入力、販売保留など）
  return_staff_account_name?: Account['display_name']; //返品担当者のアカウント名（返品を完了させていた場合）
  store_id: Transaction['store_id'];
  customer_id: Transaction['customer_id'];
  transaction_kind: Transaction['transaction_kind'];
  total_price: Transaction['total_price'];
  total_sale_price: Transaction['total_sale_price'];
  total_reservation_price: Transaction['total_reservation_price'];
  subtotal_price: Transaction['subtotal_price'];
  tax: Transaction['tax'];
  discount_price: Transaction['discount_price'];
  total_discount_price: Transaction['total_discount_price'];
  point_amount: Transaction['point_amount'];
  total_point_amount: Transaction['total_point_amount'];
  point_discount_price: Transaction['point_discount_price'];
  payment_method: Transaction['payment_method'];
  status: Transaction['status'];
  original_transaction_id: Transaction['original_transaction_id'];
  return_transaction_id: Transaction['id']; //返品取引のID
  created_at: Transaction['created_at'];
  updated_at: Transaction['updated_at'];
  description: Transaction['description'];
  payment: {
    id: Payment['id'];
    mode: Payment['mode'];
    service: Payment['service'];
    method: Payment['method'];
    source_id: Payment['source_id'];
    total_amount: Payment['total_amount'];
    card__card_brand: Payment['card__card_brand'];
    card__card_type: Payment['card__card_type'];
    card__exp_month: Payment['card__exp_month'];
    card__exp_year: Payment['card__exp_year'];
    card__last_4: Payment['card__last_4'];
    cash__recieved_price: Payment['cash__recieved_price'];
    cash__change_price: Payment['cash__change_price'];
    bank__checked?: Payment['bank__checked'];
  } | null;
  transaction_carts: Array<{
    product_id: Product['id'];
    product_name: Product['display_name'];
    item_count: Transaction_Cart['item_count'];
    unit_price: Transaction_Cart['unit_price'];
    discount_price: Transaction_Cart['discount_price'];
    product_genre_name: string; //ジャンル名（部門の名前）
    product_category_name: string; //商品種別名（親部門の名前）
    original_unit_price: Transaction_Cart['original_unit_price'];
    sale_discount_price: Transaction_Cart['sale_discount_price'];
    total_discount_price: Transaction_Cart['total_discount_price'];
    total_unit_price: Transaction_Cart['total_unit_price'];
    consignment_commission_unit_price: Transaction_Cart['consignment_commission_unit_price'];
    // product_details?: Product; //Productの詳細情報を取得
    product_details?: BackendProductAPI[0]['response']['200']['products'][0];
  }>;
  transaction_customer_carts: Array<{
    product_id: Product['id'];
    product_name: Product['display_name'];
    product__displayNameWithMeta: string;
    product_genre_name: string; //ジャンル名（部門の名前）
    product_category_name: string; //商品種別名（親部門の名前）
    item_count: Transaction_Customer_Cart['item_count'];
    unit_price: Transaction_Customer_Cart['unit_price'];
    discount_price: Transaction_Customer_Cart['discount_price'];
    original_item_count: Transaction_Customer_Cart['original_item_count'];
  }>;
}

//取引詳細の取得後に取引内容の詳細を取得
export const useFetchTransactionDetails = (transactionId: number) => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const { store } = useStore();
  const [transaction, setTransaction] =
    useState<TransactionWithProductDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //Productの詳細情報を取得
  //1201:変更したためコメントアウト 問題ない場合は消す
  // const fetchProductDetails = async (transactionCarts: any) => {
  //   const productDetailsArray = [];

  //   for (const cart of transactionCarts) {
  //     const response = await clientAPI.product.listProducts({
  //       storeID: store.id,
  //       id: cart.product_id,
  //     });
  //     if (response instanceof CustomError) {
  //       setAlertState({
  //         message: `${response.status}:${response.message}`,
  //         severity: 'error',
  //       });
  //       return [];
  //     }
  //     cart.product_details = response.products[0];
  //     productDetailsArray.push(cart);
  //   }
  //   console.log('productionの詳細のデータ', productDetailsArray);
  //   return productDetailsArray;
  // };
  const fetchProductDetails = async (transactionCarts: any) => {
    const productDetailsPromises = transactionCarts.map(async (cart: any) => {
      const response = await clientAPI.product.listProducts({
        storeID: store.id,
        id: cart.product_id,
      });

      if (response instanceof CustomError) {
        throw new Error(`${response.status}:${response.message}`);
      }

      // cartオブジェクトを直接変更
      cart.product_details = response.products[0];
      return cart;
    });

    const productDetailsArray = await Promise.all(productDetailsPromises);
    return productDetailsArray;
  };

  //取引情報の取得 productの詳細データも取得
  const fetchTransactionData = useCallback(async () => {
    setIsLoading(true); // データ取得開始
    const result = {
      data: null as TransactionWithProductDetailsType | null,
      status: 'error' as 'success' | 'error',
    };

    try {
      const response = await clientAPI.transaction.getTransactionDetails({
        store_id: store.id,
        transaction_id: transactionId,
      });

      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return result;
      }

      const transactionData = response.transactions[0];
      await fetchProductDetails(transactionData.transaction_carts);
      setTransaction(transactionData);

      result.data = transactionData;
      result.status = 'success';
    } catch (error) {
      setAlertState({
        message: 'データの取得中にエラーが発生しました。',
        severity: 'error',
      });
    } finally {
      setIsLoading(false); // データ取得完了
    }
    return result;
  }, [clientAPI, setAlertState, store.id, transactionId]);

  return { transaction, fetchTransactionData, isLoading };
};
