import { useState, useEffect } from 'react';
import {
  Transaction,
  Transaction_Cart,
  Item,
  Product,
  Item_Category_Condition_Option,
  Transaction_Customer_Cart,
} from '@prisma/client';
import { useFetchTransactionDetails } from '@/feature/transaction/hooks/useFetchTransactionDetails';
import { useAlert } from '@/contexts/AlertContext';
import { v4 as uuidv4 } from 'uuid';
import { useSaveLocalStorage } from '@/feature/purchaseReception/hooks/useSaveLocalStorage';

export interface TransactionCart {
  id: Transaction['id'];
  reception_number: Transaction['reception_number'];
  customer_id: Transaction['customer_id'];
  staff_account_id: Transaction['staff_account_id'];
  register_account_id: Transaction['register_account_id'];
  discount_price: Transaction['discount_price'];
  transaction_cart_items: Array<TransactionCartItem>;
}

export interface TransactionCustomerCart {
  product_id: Product['id'];
  product_name: Product['display_name'];
  product__displayNameWithMeta: string;
  product_genre_name: string; //ジャンル名（部門の名前）
  product_category_name: string; //商品種別名（親部門の名前）
  item_count: Transaction_Customer_Cart['item_count'];
  unit_price: Transaction_Customer_Cart['unit_price'];
  discount_price: Transaction_Customer_Cart['discount_price'];
  original_item_count: Transaction_Customer_Cart['original_item_count'];
}

export interface TransactionCartItem {
  cart_item_id: string;
  item_count: Transaction_Cart['item_count'];
  unit_price: Transaction_Cart['unit_price'];
  discount_price: Transaction_Cart['discount_price'];
  rarity: Item['rarity'];
  expansion: Item['expansion'];
  cardnumber: Item['cardnumber'];
  productGenreName: string;
  productCategoryName: string;
  hasManagementNumber?: boolean;
  managementNumber?: string; // 管理番号
  specialId?: number; // 特殊状態
  product_details: {
    id: Product['id'];
    item_id: Item['id']; // 商品マスタのid
    display_name: Product['display_name'];
    displayNameWithMeta: string;
    image_url: Product['image_url'];
    specific_buy_price: Product['specific_buy_price'];
    buy_price: Product['buy_price'];
    product_code: number;
    conditionDisplayName: string;
    condition_option_id: Item_Category_Condition_Option['id'];
    actual_sell_price: Product['actual_sell_price'];
    average_wholesale_price: Product['average_wholesale_price'];
  };
}

export const useTransactionCart = (transactionId: number) => {
  // 取引のidなども保持している
  const [cartItems, setCartItems] = useState<TransactionCart | null>(null);
  const [customerCartItems, setCustomerCartItems] = useState<
    TransactionCustomerCart[] | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { fetchTransactionData } = useFetchTransactionDetails(transactionId);
  const { setAlertState } = useAlert();
  const { saveLocalStorageItem, getLocalStorageItem } = useSaveLocalStorage();

  useEffect(() => {
    const fetchAndSetTransactionData = async () => {
      setIsLoading(true);
      const result = await fetchTransactionData();
      if (result.status === 'success' && result.data) {
        try {
          const mappedCartItems = result.data.transaction_carts.map((cart) => {
            const conditionDisplayName =
              cart.product_details?.condition_option_display_name;

            return {
              cart_item_id: uuidv4(),
              item_count: cart.item_count,
              unit_price: cart.unit_price,
              discount_price: cart.discount_price ?? 0,
              productGenreName: cart.product_genre_name,
              productCategoryName: cart.product_category_name,
              rarity: cart.product_details?.item_rarity ?? null,
              expansion: cart.product_details?.item_expansion ?? null,
              cardnumber: cart.product_details?.item_cardnumber ?? null,
              specialId: cart.product_details?.specialty_id ?? undefined,
              managementNumber:
                cart.product_details?.management_number ?? undefined,
              hasManagementNumber:
                cart.product_details?.management_number !== undefined &&
                cart.product_details?.management_number !== null,

              product_details: {
                id: cart.product_id,
                item_id: cart.product_details?.item_id ?? 0,
                display_name: cart.product_name,
                displayNameWithMeta:
                  cart.product_details?.displayNameWithMeta || '',
                image_url: cart.product_details?.image_url ?? '',
                specific_buy_price: cart.unit_price,
                discount_price: cart.discount_price,
                buy_price: cart.unit_price,
                product_code: cart.product_details?.product_code ?? 0,
                conditionDisplayName: conditionDisplayName,
                condition_option_id:
                  cart.product_details?.condition_option_id ?? 0,
                actual_sell_price: cart.product_details?.actual_sell_price ?? 0,
                average_wholesale_price:
                  cart.product_details?.average_wholesale_price ?? 0,
              },
            };
          });

          // localStorageにデータがあればcartItemsに反映（重複は除く）
          const localCartItems = getLocalStorageItem(transactionId);

          const combinedCartItems = [
            ...mappedCartItems,
            ...localCartItems
              .filter((localItem: TransactionCartItem) => {
                const isDuplicate = mappedCartItems.some(
                  (mappedItem) =>
                    mappedItem.product_details?.id ===
                      localItem.product_details?.id &&
                    mappedItem.discount_price === localItem.discount_price &&
                    mappedItem.unit_price === localItem.unit_price,
                );
                return !isDuplicate;
              })
              .map((item) => ({
                ...item,
                cart_item_id: uuidv4(),
              })),
          ];

          setCartItems({
            id: transactionId,
            reception_number: result.data.reception_number ?? 0,
            discount_price: result.data.discount_price,
            customer_id: result.data.customer_id ?? 0,
            staff_account_id: result.data.staff_account_id ?? 0,
            register_account_id: result.data.register_account_id ?? 0,
            transaction_cart_items: combinedCartItems,
          });
          setCustomerCartItems(result.data.transaction_customer_carts);
        } catch (error) {
          setAlertState({
            message: '取引データのマッピングに失敗しました。',
            severity: 'error',
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        setAlertState({
          message: '取引データの取得に失敗しました。',
          severity: 'error',
        });
      }
    };

    fetchAndSetTransactionData();
  }, [transactionId, fetchTransactionData, setAlertState]);

  // カートに追加する処理
  const addToCart = (
    newItem: Omit<TransactionCart['transaction_cart_items'][0], 'cart_item_id'>,
  ) => {
    if (!cartItems) return;
    setIsLoading(true);
    setCartItems((prevItems) => {
      if (!prevItems) return null;

      // カートに追加する商品がすでに存在するか確認(同一の商品としてみなす条件は以下の通り)
      // productのid, 査定額(unit_price), 購入価格(unit_price), 特殊状態のid, 管理番号
      const existingCartItemIndex = prevItems.transaction_cart_items.findIndex(
        (cartItem) => {
          if (newItem.hasManagementNumber) return false;
          return (
            cartItem.product_details?.id === newItem.product_details?.id &&
            cartItem.discount_price === newItem.discount_price &&
            cartItem.unit_price === newItem.unit_price &&
            cartItem.specialId === newItem.specialId &&
            cartItem.managementNumber === newItem.managementNumber
          );
        },
      );

      let updatedTransactionCarts;

      // すでに追加されているcartItemだったらそのcartItemの個数を追加する
      if (existingCartItemIndex !== -1) {
        updatedTransactionCarts = [...prevItems.transaction_cart_items];
        updatedTransactionCarts[existingCartItemIndex] = {
          ...updatedTransactionCarts[existingCartItemIndex],
          item_count:
            updatedTransactionCarts[existingCartItemIndex].item_count +
            newItem.item_count,
        };
      } else {
        updatedTransactionCarts = [
          ...prevItems.transaction_cart_items,
          {
            ...newItem,
            cart_item_id: uuidv4(),
          },
        ];
      }

      setIsLoading(false);
      return {
        ...prevItems,
        transaction_cart_items: updatedTransactionCarts,
      };
    });
  };

  //cartItemsが変動したらlocalStorageに内容を保存
  useEffect(() => {
    if (
      cartItems?.transaction_cart_items &&
      cartItems?.transaction_cart_items.length > 0
    ) {
      saveLocalStorageItem(transactionId, cartItems?.transaction_cart_items);
    }
  }, [cartItems?.transaction_cart_items, transactionId]);

  return {
    cartItems,
    setCartItems,
    customerCartItems,
    setCustomerCartItems,
    addToCart,
    isLoading,
  };
};
