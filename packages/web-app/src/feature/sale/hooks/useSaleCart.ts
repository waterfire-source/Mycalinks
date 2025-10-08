import { BackendCustomerAPI } from '@/app/api/store/[store_id]/customer/api';
import { useAlert } from '@/contexts/AlertContext';
import { useEposDevice } from '@/contexts/EposDeviceContext';
import { useStore } from '@/contexts/StoreContext';
import { useProducts } from '@/feature/products/hooks/useProducts';
import {
  UseSetDealParams,
  useSetDeals,
} from '@/feature/stock/set/hooks/useSetDeals';
import { TransactionKind, TransactionPaymentMethod } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface AvailableSetDeal {
  setDealID: number;
  applyCount: number;
  totalDiscountPrice: number;
  displayName: string;
  targetProducts: Array<{
    productID: number;
    unitPrice: number;
    itemCount: number;
  }>;
}

export interface SaleCartItem {
  productId: number;
  imageUrl: string;
  displayName: string;
  conditionName: string;
  stockNumber: number;
  dontAdjustStockNumber?: boolean;
  originalSalePrice: number | null;
  originalSpecificSalePrice: number | null;
  infinite_stock?: boolean;
  consignmentClientId?: number | null;
  managementNumber?: string;
  consignmentClientFullName?: string;
  consignmentClientDisplayName?: string;
  variants: Array<{
    variantId: string;
    itemCount: number;
    unitPrice: number;
    reservationPrice?: number;
    reservationReceptionProductIdForDeposit?: number | null;
    reservationReceptionProductIdForReceive?: number | null;
    sale?: {
      id: number;
      displayName: string;
      discountAmount: string | null;
      allowedItemCount: number;
    };
    individualDiscount?: {
      discountAmount: string | null;
    };
  }>;
}

export type SaleTransactionState = {
  carts: SaleCartItem[];
  id: number | null;
  paymentMethod: TransactionPaymentMethod | null;
  receivedPrice: number | null;
  changePrice: number | null;
  totalPrice: number;
  subtotalPrice: number;
  tax: number;
  globalDiscount?: {
    discountMode: string;
    discountValue: number;
  };
  availableSetDeals?: AvailableSetDeal[];
  discountPrice: number;
  point?: number;
  setDealDiscountPrice?: number;
  customer?:
    | BackendCustomerAPI[0]['response']['200']
    | BackendCustomerAPI[1]['response']['200'][0]
    | undefined;
};

export const calculateDiscountPrice = ({
  discountAmount,
  reservationPrice,
  unitPrice,
}: {
  discountAmount?: string;
  reservationPrice?: number;
  unitPrice: number;
}): number => {
  if (typeof reservationPrice === 'number') {
    return reservationPrice;
  }
  if (!discountAmount || typeof discountAmount !== 'string') {
    return 0;
  }
  if (typeof unitPrice !== 'number' || unitPrice < 0) {
    return 0;
  }
  if (discountAmount.includes('%')) {
    const percentage = parseFloat(discountAmount.replace('%', ''));
    if (Number.isNaN(percentage) || percentage < 0 || percentage > 100)
      return 0;
    const discountRate = 100 - percentage;
    return -Math.floor((unitPrice * discountRate) / 100);
  } else {
    const value = Math.floor(
      parseFloat(discountAmount.replace('円', '').trim()),
    );
    if (Number.isNaN(value)) return 0;
    if (value > unitPrice) return -unitPrice;
    return -Math.abs(value);
  }
};

export const calculateTotalDiscount = ({
  individualDiscount,
  saleDiscount,
  reservationPrice,
  unitPrice,
}: {
  individualDiscount?: string;
  saleDiscount?: string;
  reservationPrice?: number;
  unitPrice: number;
}): number => {
  return (
    Math.abs(
      calculateDiscountPrice({
        discountAmount: individualDiscount,
        unitPrice,
      }),
    ) +
    Math.abs(
      calculateDiscountPrice({
        discountAmount: saleDiscount,
        unitPrice,
      }),
    ) +
    Math.abs(
      calculateDiscountPrice({
        reservationPrice: reservationPrice,
        unitPrice,
      }),
    )
  );
};

const calculateSubtotal = (carts: SaleCartItem[]): number => {
  return carts.reduce((sum, item) => {
    const itemTotal = item.variants.reduce((variantSum, variant) => {
      const individualDiscount = variant.individualDiscount
        ? Math.floor(
            calculateDiscountPrice({
              discountAmount: variant.individualDiscount.discountAmount ?? '0',
              unitPrice: variant.unitPrice,
            }),
          )
        : 0;

      const saleDiscount = variant.sale
        ? Math.floor(
            calculateDiscountPrice({
              discountAmount: variant.sale.discountAmount ?? '0',
              unitPrice: variant.unitPrice,
            }),
          )
        : 0;

      const reservationDiscount = variant.reservationPrice
        ? Math.floor(
            calculateDiscountPrice({
              reservationPrice: variant.reservationPrice,
              unitPrice: variant.unitPrice,
            }),
          )
        : 0;

      return (
        variantSum +
        Math.floor(
          (variant.unitPrice +
            individualDiscount +
            saleDiscount +
            reservationDiscount) *
            variant.itemCount,
        )
      );
    }, 0);
    return sum + itemTotal;
  }, 0);
};

const calculateTotal = (subtotal: number, discountPrice: number): number => {
  return Math.floor(subtotal + discountPrice);
};

const getTotalItemCountByProductId = (
  carts: SaleCartItem[],
  productId: number,
): number => {
  // state.carts の中で指定 productId の合計数量を返す
  const targetCarts = carts.filter((cart) => cart.productId === productId);
  return targetCarts.reduce(
    (total, cart) =>
      total +
      cart.variants.reduce((sum, variant) => sum + variant.itemCount, 0),
    0,
  );
};

export const getTotalItemCount = (carts: SaleCartItem[]): number => {
  return carts.reduce(
    (total, cart) =>
      total +
      cart.variants.reduce((sum, variant) => sum + variant.itemCount, 0),
    0,
  );
};

const calculateTaxAmount = (
  taxIncludedPrice: number,
  taxRate: number = 10,
): number => {
  if (typeof taxIncludedPrice !== 'number' || taxIncludedPrice < 0) {
    return 0;
  }
  if (typeof taxRate !== 'number' || taxRate <= 0 || taxRate >= 100) {
    return 0;
  }
  return Math.round((taxIncludedPrice * taxRate) / (100 + taxRate));
};

export const useSaleCart = (initial?: Partial<SaleTransactionState>) => {
  const defaultState: SaleTransactionState = {
    id: null,
    carts: [],
    paymentMethod: TransactionPaymentMethod.cash,
    receivedPrice: null,
    changePrice: null,
    tax: 0,
    totalPrice: 0,
    subtotalPrice: 0,
    discountPrice: 0,
    availableSetDeals: [],
  };

  const [state, setState] = useState<SaleTransactionState>({
    ...defaultState,
    ...initial,
    carts: initial?.carts ?? defaultState.carts,
    availableSetDeals:
      initial?.availableSetDeals ?? defaultState.availableSetDeals,
  });

  const { store } = useStore();
  const { setAlertState } = useAlert();

  const { getSales } = useProducts();
  const { checkSetDealDiscount } = useSetDeals();
  const { ePosDev } = useEposDevice();
  // デバッグ用なので削除しない
  console.info('useSaleCartのePosDev ', ePosDev);

  const displayProductOnCustomerDisplay = useCallback(
    async (productName: string, unitPrice: number) => {
      console.info('displayProductOnCustomer関数でif文の外: ', ePosDev);
      if (ePosDev && ePosDev.devices.display) {
        console.info('displayProductOnCustomerでifの中: ', ePosDev);
        try {
          await ePosDev.displayProduct({ productName, unitPrice });
        } catch (error) {
          console.error(
            'ディスプレイに表示する際にエラーが発生しました',
            error,
          );
        }
      }
    },
    [ePosDev],
  );

  const addProducts = useCallback(
    async ({
      newProduct,
      itemCount,
      unitPrice,
      discountPrice,
      isUnique = false,
      reservationPrice,
      reservationReceptionProductIdForDeposit,
      reservationReceptionProductIdForReceive,
    }: {
      newProduct: Omit<SaleCartItem, 'variants'>;
      itemCount: number;
      unitPrice: number;
      discountPrice?: number;
      isUnique?: boolean;
      reservationPrice?: number;
      reservationReceptionProductIdForDeposit?: number | null;
      reservationReceptionProductIdForReceive?: number | null;
    }) => {
      // セール情報を取得（なければ空配列）
      const saleInfos =
        (await getSales(
          store.id,
          newProduct.productId,
          TransactionKind.sell,
        )) ?? [];

      //newProduct.infinite_stockがtrueの場合は追加するようにする
      setState((prevState) => {
        let remainingQuantity = itemCount;
        // 不変性を保つため、既存の carts をディープコピー（variants も含む）
        const carts = prevState.carts.map((cart) => ({
          ...cart,
          variants: [...cart.variants],
        }));
        const newCartItems: SaleCartItem[] = [];

        // ① セール情報のある場合の処理(予約残金支払い,委託商品の場合を除く)
        if (
          !reservationReceptionProductIdForReceive &&
          !newProduct.consignmentClientId
        ) {
          for (const saleInfo of saleInfos) {
            if (remainingQuantity <= 0) break;

            // カート内のすでに追加済みの対象セールの itemCount 合計を計算
            const totalExistingQuantityForSale = carts
              .flatMap((cart) => cart.variants)
              .filter((variant) => variant.sale?.id === saleInfo.sale.id)
              .reduce((sum, variant) => sum + variant.itemCount, 0);

            const allowedItemCount =
              saleInfo.allowedItemCount === -1
                ? remainingQuantity
                : Math.min(
                    saleInfo.allowedItemCount - totalExistingQuantityForSale,
                    remainingQuantity,
                  );

            if (allowedItemCount <= 0) continue;

            // 作成する新しい variant オブジェクト（セール情報付き）
            const newVariant: SaleCartItem['variants'][0] = {
              variantId: uuidv4(),
              itemCount: allowedItemCount,
              unitPrice: unitPrice,
              individualDiscount: {
                discountAmount: `${discountPrice}円`,
              },
              reservationPrice: reservationPrice,
              reservationReceptionProductIdForDeposit:
                reservationReceptionProductIdForDeposit,
              reservationReceptionProductIdForReceive:
                reservationReceptionProductIdForReceive,
              sale: {
                id: saleInfo.sale.id,
                displayName: saleInfo.sale.display_name,
                discountAmount: saleInfo.sale.discount_amount,
                allowedItemCount: saleInfo.allowedItemCount,
              },
            };

            // 同じ productId のカートがあるか調べる
            const cartIndex = carts.findIndex(
              (cart) => cart.productId === newProduct.productId,
            );

            if (cartIndex >= 0) {
              // 既存カートがある場合
              if (!isUnique) {
                // マージする場合：同一 (unitPrice と sale.id) の variant が既にあるなら itemCount を加算
                const existingVariantIndex = carts[
                  cartIndex
                ].variants.findIndex(
                  (variant) =>
                    variant.unitPrice === unitPrice &&
                    variant.sale?.id === saleInfo.sale.id,
                );
                if (existingVariantIndex >= 0) {
                  const existingVariant =
                    carts[cartIndex].variants[existingVariantIndex];
                  const mergedVariant = {
                    ...existingVariant,
                    itemCount: existingVariant.itemCount + allowedItemCount,
                  };
                  carts[cartIndex] = {
                    ...carts[cartIndex],
                    variants: [
                      ...carts[cartIndex].variants.slice(
                        0,
                        existingVariantIndex,
                      ),
                      mergedVariant,
                      ...carts[cartIndex].variants.slice(
                        existingVariantIndex + 1,
                      ),
                    ],
                  };
                } else {
                  // 同一条件の variant が無ければ、新規 variant を追加
                  carts[cartIndex] = {
                    ...carts[cartIndex],
                    variants: [...carts[cartIndex].variants, newVariant],
                  };
                }
              } else {
                // isUnique が true の場合は、既存カートがあっても必ず新規 variant として追加
                carts[cartIndex] = {
                  ...carts[cartIndex],
                  variants: [...carts[cartIndex].variants, newVariant],
                };
              }
            } else {
              // カートに同じ productId のアイテムが無い場合は、新しいカートアイテムを生成
              newCartItems.push({
                ...newProduct,
                variants: [newVariant],
              });
            }
            remainingQuantity -= allowedItemCount;
          }
        }

        // ② 残り（セールに該当しない、またはセール情報なし）の処理
        if (remainingQuantity > 0) {
          const newVariant: SaleCartItem['variants'][0] = {
            variantId: uuidv4(),
            itemCount: remainingQuantity,
            unitPrice: unitPrice,
            individualDiscount: {
              discountAmount: `${discountPrice}円`,
            },
            reservationPrice: reservationPrice,
            reservationReceptionProductIdForDeposit:
              reservationReceptionProductIdForDeposit,
            reservationReceptionProductIdForReceive:
              reservationReceptionProductIdForReceive,
          };
          const cartIndex = carts.findIndex(
            (cart) => cart.productId === newProduct.productId,
          );
          if (cartIndex >= 0) {
            if (!isUnique) {
              // 同一条件（unitPrice と sale が無い）の variant があればマージ
              const existingVariantIndex = carts[cartIndex].variants.findIndex(
                (variant) => variant.unitPrice === unitPrice && !variant.sale,
              );
              if (existingVariantIndex >= 0) {
                const existingVariant =
                  carts[cartIndex].variants[existingVariantIndex];
                const mergedVariant = {
                  ...existingVariant,
                  itemCount: existingVariant.itemCount + remainingQuantity,
                };
                carts[cartIndex] = {
                  ...carts[cartIndex],
                  variants: [
                    ...carts[cartIndex].variants.slice(0, existingVariantIndex),
                    mergedVariant,
                    ...carts[cartIndex].variants.slice(
                      existingVariantIndex + 1,
                    ),
                  ],
                };
              } else {
                carts[cartIndex] = {
                  ...carts[cartIndex],
                  variants: [...carts[cartIndex].variants, newVariant],
                };
              }
            } else {
              // isUnique が true の場合は新規 variant として追加
              carts[cartIndex] = {
                ...carts[cartIndex],
                variants: [...carts[cartIndex].variants, newVariant],
              };
            }
          } else {
            newCartItems.push({
              ...newProduct,
              variants: [newVariant],
            });
          }
        }

        displayProductOnCustomerDisplay(newProduct.displayName, unitPrice);

        const finalCarts = [...carts, ...newCartItems];

        return {
          ...prevState,
          carts: finalCarts,
        };
      });
    },
    [store.id],
  );

  const updateItemCount = useCallback(
    async (variantId: string, newItemCount: number) => {
      setState((prevState) => {
        const updatedCarts = prevState.carts.map((cart) => {
          // 該当variantIdをもつvariantがないカートはそのまま返す
          if (!cart.variants.some((v) => v.variantId === variantId)) {
            return cart;
          }

          return {
            ...cart,
            variants: cart.variants.map((variant) => {
              if (variant.variantId !== variantId) {
                return variant;
              }

              if (newItemCount <= 0) {
                return variant;
              }

              const totalInCart = cart.variants.reduce(
                (sum, v) => sum + v.itemCount,
                0,
              );
              const newTotal = totalInCart - variant.itemCount + newItemCount;

              // 無限在庫 (infinite_stock === true) の場合は在庫制限を無視
              if (!cart.infinite_stock && newTotal > cart.stockNumber) {
                setAlertState({
                  message: `在庫数 (${cart.stockNumber}) を超えています。`,
                  severity: 'error',
                });
                return variant;
              }

              if (variant.sale) {
                const totalExistingForSale = cart.variants
                  .filter((v) => v.sale?.id === variant.sale?.id)
                  .reduce((sum, v) => sum + v.itemCount, 0);

                if (
                  variant.sale.allowedItemCount !== -1 &&
                  totalExistingForSale + (newItemCount - variant.itemCount) >
                    variant.sale.allowedItemCount
                ) {
                  setAlertState({
                    message: `セールの許容数 (${variant.sale.allowedItemCount}) を超えています。`,
                    severity: 'error',
                  });
                  return variant;
                }
              }

              return { ...variant, itemCount: newItemCount };
            }),
          };
        });

        return { ...prevState, carts: updatedCarts };
      });
    },
    [setAlertState],
  );

  const updateUnitPrice = useCallback(
    (variantId: string, newUnitPrice: number) => {
      setState((prevState) => {
        const updatedCarts = prevState.carts.map((cart) => {
          if (!cart.variants.some((v) => v.variantId === variantId)) {
            return cart;
          }
          return {
            ...cart,
            variants: cart.variants.map((variant) =>
              variant.variantId === variantId
                ? { ...variant, unitPrice: newUnitPrice }
                : variant,
            ),
          };
        });
        return { ...prevState, carts: updatedCarts };
      });
    },
    [],
  );

  const deleteCartItem = useCallback((variantId: string) => {
    setState((prevState) => {
      const updatedCarts = prevState.carts
        .map((cart) => {
          if (!cart.variants.some((v) => v.variantId === variantId)) {
            return cart;
          }
          const filteredVariants = cart.variants.filter(
            (variantItem) => variantItem.variantId !== variantId,
          );
          return filteredVariants.length > 0
            ? { ...cart, variants: filteredVariants }
            : null;
        })
        .filter((cart) => cart !== null) as SaleCartItem[];
      return { ...prevState, carts: updatedCarts };
    });
  }, []);

  const applyIndividualDiscount = useCallback(
    (
      productId: number,
      variantId: string,
      discountValue: number,
      discountMode: '%' | '円',
    ) => {
      setState((prevState) => {
        const discountAmount =
          discountMode === '%' ? `${100 - discountValue}%` : `${discountValue}`;

        const updatedCarts = prevState.carts.map((cart) => {
          if (cart.productId !== productId) return cart;

          return {
            ...cart,
            variants: cart.variants.map((variant) => {
              if (variant.variantId === variantId) {
                return {
                  ...variant,
                  individualDiscount: {
                    discountAmount,
                  },
                };
              }
              return variant;
            }),
          };
        });

        return {
          ...prevState,
          carts: updatedCarts,
        };
      });
    },
    [],
  );

  const applyGlobalDiscount = useCallback(
    (discountValue: number, discountMode: '%' | '円') => {
      setState((prevState) => ({
        ...prevState,
        globalDiscount: { discountValue, discountMode },
      }));
    },
    [],
  );

  const changePaymentMethod = useCallback((value: TransactionPaymentMethod) => {
    setState((prevState) => ({
      ...prevState,
      paymentMethod: value,
    }));
  }, []);

  const changeCashReceived = useCallback((value: number) => {
    setState((prevState) => {
      return {
        ...prevState,
        receivedPrice: Math.max(value, 0),
      };
    });
  }, []);

  const setCustomer = useCallback(
    (
      customer?:
        | BackendCustomerAPI[0]['response']['200']
        | BackendCustomerAPI[1]['response']['200'][0],
    ) => {
      setState((prevState) => ({
        ...prevState,
        customer: customer,
      }));
    },
    [],
  );

  const setTransactionID = useCallback((id: number) => {
    setState((prevState) => ({
      ...prevState,
      id: id,
    }));
  }, []);

  const getCartTotalItemCount = useCallback(() => {
    const totalItemCount = state.carts.reduce(
      (total, cart) =>
        total +
        cart.variants.reduce(
          (variantSum, variant) => variantSum + variant.itemCount,
          0,
        ),
      0,
    );

    return {
      totalItemCount,
    };
  }, [state.carts]);

  const resetCart = useCallback(() => {
    setState(() => ({
      id: null,
      carts: [],
      paymentMethod: TransactionPaymentMethod.cash,
      receivedPrice: null,
      changePrice: 0,
      tax: 0,
      totalPrice: 0,
      subtotalPrice: 0,
      discountPrice: 0,
      availableSetDeals: [],
      customer: undefined,
    }));
  }, []);

  // ポイント付与
  const applyPoint = useCallback((point: number) => {
    setState((prevState) => ({
      ...prevState,
      point: point,
    }));
  }, []);

  useEffect(() => {
    const fetchSetDealDiscount = async () => {
      const params: UseSetDealParams['checkSetDealDiscount'] = {
        storeID: store.id,
        carts: state.carts.flatMap((cartItem) =>
          cartItem.variants.map((variant) => {
            const individualDiscountPrice = -Math.abs(
              calculateDiscountPrice({
                discountAmount:
                  variant.individualDiscount?.discountAmount ?? '0',
                unitPrice: variant.unitPrice ?? 0,
              }),
            );

            const saleDiscountPrice = -Math.abs(
              calculateDiscountPrice({
                discountAmount: variant.sale?.discountAmount ?? '0',
                unitPrice: variant.unitPrice ?? 0,
              }),
            );

            return {
              productID: cartItem.productId,
              unitPrice:
                variant.unitPrice + individualDiscountPrice + saleDiscountPrice,
              itemCount: variant.itemCount,
            };
          }),
        ),
      };

      // セット割引のチェック
      const res = await checkSetDealDiscount(params);

      const availableSetDeals: AvailableSetDeal[] =
        res?.availableSetDeals.map((deal) => ({
          setDealID: deal.setDealID ?? 0,
          applyCount: deal.applyCount ?? 0,
          totalDiscountPrice: -Math.abs(deal.totalDiscountPrice),
          displayName: deal.displayName ?? '',
          targetProducts: deal.targetProducts,
        })) ?? [];

      return { availableSetDeals };
    };

    const updateState = async () => {
      const { availableSetDeals } = await fetchSetDealDiscount();

      setState((prevState) => {
        const subtotal = calculateSubtotal(prevState.carts);

        const setGlobalDiscountPrice = availableSetDeals.reduce(
          (sum, deal) => sum + deal.totalDiscountPrice,
          0,
        );

        const totalGlobalDiscountPrice = prevState.globalDiscount
          ? prevState.globalDiscount.discountMode === '%'
            ? -Math.abs(
                Math.floor(
                  ((subtotal + setGlobalDiscountPrice) *
                    prevState.globalDiscount.discountValue) /
                    100,
                ),
              )
            : -Math.abs(Math.floor(prevState.globalDiscount.discountValue))
          : 0;

        const total = calculateTotal(
          subtotal,
          totalGlobalDiscountPrice +
            setGlobalDiscountPrice -
            Math.abs(Math.floor(prevState.point ?? 0)),
        );

        const changePrice =
          prevState.receivedPrice && prevState.receivedPrice > 0
            ? prevState.receivedPrice - total
            : 0;

        const taxIncludedPrice = calculateTaxAmount(total);

        return {
          ...prevState,
          subtotalPrice: subtotal,
          discountPrice: totalGlobalDiscountPrice,
          totalPrice: total,
          changePrice: changePrice,
          availableSetDeals,
          setDealDiscountPrice: setGlobalDiscountPrice,
          tax: taxIncludedPrice,
        };
      });
    };

    updateState();
  }, [state.carts, state.receivedPrice, state.globalDiscount, state.point]);

  return {
    state,
    setTransactionID,
    addProducts,
    updateItemCount,
    updateUnitPrice,
    deleteCartItem,
    applyIndividualDiscount,
    applyGlobalDiscount,
    changePaymentMethod,
    changeCashReceived,
    setCustomer,
    getCartTotalItemCount,
    resetCart,
    applyPoint,
  };
};
