import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { PackType } from '@/feature/stock/register/pack/components/PackTable';
import { PackItemType } from '@/feature/stock/register/pack/components/PackRegisterTab';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { useCreateItems } from '@/feature/item/hooks/useCreateItems';
import { usePackItems } from '@/feature/item/hooks/useIPackItems';
import { useItems } from '@/feature/item/hooks/useItems';
import { useSession } from 'next-auth/react';
import { useAlert } from '@/contexts/AlertContext';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { ItemCategoryHandle } from '@prisma/client';
import { WholesalePriceHistoryResourceType } from '@prisma/client';
import { DetailCard } from '@/components/cards/DetailCard';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import CircularProgressWithLabel from '@/components/common/CircularWithValueLabelLoader';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { MycaPosApiClient } from 'api-generator/client';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { useConfirmationModal } from '@/contexts/ConfirmationModalContext';
import { usePackRollback } from '@/feature/stock/register/pack/hooks/usePackRollback';
import { useErrorAlert } from '@/hooks/useErrorAlert';

interface Option {
  id: number;
  displayName: string;
}

interface PackItemRegisterSettingProps {
  storeID: number;
  selectedPack: PackType;
  itemsToRegister: PackItemType[];
  setItemsToRegister: React.Dispatch<React.SetStateAction<PackItemType[]>>;
  selectedStorageProduct: number | string;
  setSelectedStorageProduct: (
    newSelectedStorageProduct: number | string,
  ) => void;
  storageProducts:
    | BackendProductAPI[0]['response']['200']['products']
    | undefined;
  openNumber: number;
  setOpenNumber: (newOpenNumber: number) => void;
  onBackProgress: () => void;
  includeRandomPack: boolean;
  isDisabledEditOpenNumber: boolean;
  onResetProgress: () => void;
  randomCardsPerPack: number;
  setRandomCardsPerPack: (newRandomCardsPerPack: number) => void;
  wholesalePrice: BackendProductAPI[9]['response']['200'] | undefined;
  fetchWholesalePrice: (
    product_id: number,
    itemCount?: number,
    isReturn?: boolean,
    reverse?: true,
    resourceType?: WholesalePriceHistoryResourceType,
    resourceID?: number,
  ) => Promise<BackendProductAPI[9]['response']['200'] | void>;
  restoredConditionOptionId?: number | null;
  fixId?: number | null; // 履歴ID
  totalUnregisteredCardsQuantity: number;
  totalCards: number;
  totalRegisteredCards: number;
  remainingAmount: number;
  unitWholesalePrice: string;
  amount: number;
}

export const PackItemRegisterSetting: React.FC<
  PackItemRegisterSettingProps
> = ({
  storeID,
  selectedPack,
  itemsToRegister,
  setItemsToRegister,
  selectedStorageProduct,
  setSelectedStorageProduct,
  storageProducts,
  openNumber, // 最終開封数
  setOpenNumber,
  onBackProgress: handleBackProgress,
  includeRandomPack,
  isDisabledEditOpenNumber,
  onResetProgress: handleResetProgress,
  randomCardsPerPack, // ランダムカード封入枚数
  setRandomCardsPerPack,
  wholesalePrice, // 開封商品の仕入れ値
  fetchWholesalePrice,
  restoredConditionOptionId,
  fixId = null,
  totalUnregisteredCardsQuantity, // 未登録カード数
  totalCards, // カード合計枚数
  totalRegisteredCards, // 登録枚数合計
  remainingAmount, // 残り金額
  unitWholesalePrice, // カード1枚あたりの仕入れ値
  amount, // パック合計の仕入れ値[最終開封数とパック仕入れ単価]
}) => {
  const { data: session } = useSession();
  const staffAccountId = session?.user?.id;
  const [isRegisterParamsDisabled, setIsRegisterParamsDisabled] =
    useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setAllOptions] = useState<Option[]>([]); // 全てに共通するオプション
  const { fetchCategoryList, category } = useCategory(); //カテゴリ情報取得
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenNumberInputChange = (value: number | undefined) => {
    setOpenNumber(value || 0);
  };
  const handleRandomPackItemsCountInputChange = (value: number | undefined) => {
    setRandomCardsPerPack(value || 0);
  };

  const handleConditionOptionChange = (event: SelectChangeEvent<number>) => {
    const selectedConditionOption = options.find(
      (option) => option.id == Number(event.target.value),
    );
    if (!selectedConditionOption) return;
    setSelectedOption({ ...selectedConditionOption });
  };
  const handleSelectStorageProduct = (
    event: SelectChangeEvent<number | string>,
  ) => {
    setSelectedStorageProduct(event.target.value);
  };

  // 保存処理
  const [progress, setProgress] = useState(0); //進捗具合
  const [noPosIdItems, setNoPosIdItems] = useState<PackItemType[]>([]); //pos_item_idが存在しない商品
  const { createItem } = useCreateItems(); //商品登録
  const { fetchPackItems } = usePackItems();
  const { getItems } = useItems();
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();
  // 画面遷移確認モーダル表示の制御
  const { setModalVisible } = useConfirmationModal();

  // パック開封ロールバック機能
  const { rollbackPackOpening, isLoadingRollback } = usePackRollback();

  const handleSave = async () => {
    if (isLoading) return;

    setModalVisible(false);
    setIsLoading(true); // ローダーを表示
    setProgress(0); // 進捗をリセット

    // 残り金額があったらランダムに分割する（空欄に自動分配と全く同じロジック）
    let updatedItemsToRegister = itemsToRegister;
    let updatedRemainingAmount = remainingAmount;
    if (remainingAmount > 0) {
      // 仕入れ単価が未設定で数量が1以上の商品
      const unsetItems = itemsToRegister.filter((item) => {
        const hasQuantity = (item.quantity ?? 0) > 0;
        const hasNoWholesalePrice =
          item.wholesale_price == null || item.wholesale_price === undefined;
        return hasQuantity && hasNoWholesalePrice;
      });

      const totalUnsetQuantity = unsetItems.reduce((sum, item) => {
        return sum + (item.quantity ?? 0);
      }, 0);

      const baseUnitPrice =
        totalUnsetQuantity === 0
          ? 0
          : Math.floor(remainingAmount / totalUnsetQuantity);

      // 自動分配された結果を取得
      updatedItemsToRegister = itemsToRegister.map((item) => {
        if (
          (item.wholesale_price == null ||
            item.wholesale_price === undefined) &&
          (item.quantity ?? 0) > 0
        ) {
          return { ...item, wholesale_price: baseUnitPrice };
        }
        return item;
      });

      // 更新後の残り金額を計算
      const updatedTotalUnitWholesalePrice = updatedItemsToRegister.reduce(
        (sum, item) => {
          return sum + (item.wholesale_price ?? 0) * (item.quantity ?? 0);
        },
        0,
      );

      updatedRemainingAmount = amount - updatedTotalUnitWholesalePrice;

      // 状態も更新
      setItemsToRegister(updatedItemsToRegister);
    }

    try {
      // 履歴復元時は既存の開封結果をロールバック
      if (fixId) {
        setProgress(10);
        const rollbackResult = await rollbackPackOpening(fixId);
        if (!rollbackResult) {
          setAlertState({
            message: `既存の開封結果のロールバック処理に失敗しました。`,
            severity: 'error',
          });
          setIsLoading(false);
          return;
        }
      }

      //posに登録されていない商品を登録する
      if (noPosIdItems.length) {
        setProgress(fixId ? 30 : 20);
        // 登録の途中にエラーが起きた場合はボタンを活性化させない
        if (cardCategory?.id && boxCategory?.id && storeID) {
          //posに登録されていない商品を登録する処理
          await Promise.all(
            noPosIdItems
              .filter((item) => item.myca_item_id !== -1) // 未登録カードのmyca_item_idは-1としているので除外
              .map((item) =>
                createItem(
                  {
                    storeID,
                    myca_item_id: item.myca_item_id,
                    order_number: 0,
                  },
                  item.display_name ?? undefined,
                ),
              ),
          );
        }
      }

      //商品情報を取得する
      setProgress(fixId ? 50 : 40);
      const packItems = await fetchPackItems(
        storeID,
        Number(selectedPack.itemId),
        true,
      );

      if (!packItems) {
        setAlertState({
          message: `商品情報の取得に失敗しました。`,
          severity: 'error',
        });
        return;
      }

      //packItemsからitems.myca_item_idが一致するものを抽出する
      setProgress(fixId ? 70 : 60);

      const matchedItems = packItems.filter(
        (packItem) =>
          updatedItemsToRegister?.some(
            (item) => item.myca_item_id === packItem.myca_item_id,
          ),
      );

      if (matchedItems && matchedItems.length > 0) {
        setProgress(fixId ? 85 : 80);
        // pos_item_idを抽出して配列にする
        const posItemIds = matchedItems
          .map((item) => item.pos_item_id)
          .filter(Boolean) as number[];

        const searchItems = await getItems(storeID, posItemIds, true);

        try {
          if (!searchItems || searchItems.length === 0) {
            setAlertState({
              message: `登録する商品がありません。`,
              severity: 'error',
            });
            return;
          }

          // 登録データをAPIに送信
          const toProductsData = searchItems.reduce(
            (acc, item) => {
              // itemのproducts配列から条件に合致するものを見つける
              const matchingProduct = item.products.find(
                (product) => product.condition_option_id === selectedOption?.id, // selectedOptionと一致するものを探す
              );

              if (matchingProduct) {
                // itemsからmyca_item_idが一致するものを探す ※状態が一つしか選択できないから成り立つ
                const matchingRegisteredItem = updatedItemsToRegister.find(
                  (i) => i.myca_item_id === item.myca_item_id,
                );
                // 一致するものがあれば、registeredItemのquantityを設定する
                const itemCount = matchingRegisteredItem
                  ? matchingRegisteredItem.quantity
                  : 0;

                // 一致するものがあれば、registeredItemのwholesale_priceを設定する
                const itemWholesalePrice = matchingRegisteredItem
                  ? matchingRegisteredItem.wholesale_price
                  : 0;

                // matchingProductが存在する場合のみtoProductsに追加
                acc.matched.push({
                  product_id: matchingProduct.id, // product_idを設定
                  item_count: itemCount, // registeredItemsのquantityを設定
                  wholesale_price: itemWholesalePrice ?? 0,
                  staff_account_id: Number(staffAccountId), // 担当者ID
                });
              } else {
                // 一致しなかったカード（product）をunmatchedに追加
                acc.unmatched.push(item);
              }

              return acc; // accは結果のオブジェクト
            },
            {
              matched: [] as {
                product_id: number;
                item_count: number;
                wholesale_price: number;
                staff_account_id: number;
              }[],
              unmatched: [] as typeof searchItems,
            },
          );

          const { matched: toProducts, unmatched: unmatchedItems } =
            toProductsData;

          // 一致しなかったカードをコンソールに表示
          // 一致しなかったカードがある場合、アラートで表示
          if (unmatchedItems.length > 0) {
            const unmatchedItemsInfo = unmatchedItems
              .map(
                (item) =>
                  `ID: ${item.id}, Name: ${item.display_name || '名前なし'}`,
              ) // 各カードのIDと名前を表示
              .join('\n'); // 改行で区切る

            setAlertState({
              message: `以下のカードが条件に一致しませんでした:\n${unmatchedItemsInfo}`,
              severity: 'error',
            });
            setIsLoading(false);
            return;
          }

          // toProductsが空なら処理を終了
          if (toProducts.length === 0) {
            setAlertState({
              message: `条件に一致する商品がありません。`,
              severity: 'error',
            });
            setIsLoading(false);
            return;
          }
          // `selectedStorageProduct` の値が `string` の場合に数値に変換、空文字なら null にする
          const unregisterProductId =
            selectedStorageProduct === 'loss'
              ? null
              : Number(selectedStorageProduct);

          // APIに送信する
          setProgress(fixId ? 95 : 90);
          const client = new MycaPosApiClient();
          await client.product.openPack({
            storeId: storeID,
            productId: selectedPack.productId,
            requestBody: {
              item_count: openNumber, // 開封パック数
              item_count_per_pack: totalCards / openNumber, // 1パックあたりの枚数
              staff_account_id: Number(staffAccountId), // 担当者ID
              to_products: toProducts, // 計算されたproductsを設定
              unregister_product_id:
                unregisterProductId === 0 ? null : unregisterProductId, // 未登録カードの扱い方（例：ロス登録）
              unregister_item_count: totalUnregisteredCardsQuantity, // 未登録カードの枚数
              unregister_product_wholesale_price:
                updatedItemsToRegister.find((item) => item.myca_item_id === -1)
                  ?.wholesale_price ?? undefined, // 未登録カードの仕入れ値（直接）
              margin_wholesale_price: updatedRemainingAmount, // 余った仕入れ値
            },
          });

          // 成功時の処理
          const successMessage = fixId
            ? `履歴から復元した開封結果の再登録が完了しました。`
            : `登録が完了しました。`;

          setAlertState({
            message: successMessage,
            severity: 'success',
          });

          // 2秒後にパック選択画面に遷移
          setTimeout(() => {
            handleResetProgress();
            setIsLoading(false);
          }, 2000);
          setItemsToRegister([]);
        } catch (error) {
          // エラーハンドリング
          handleError(error);
          setIsLoading(false);
        }
      } else {
        setAlertState({
          message: `一致する商品がposに登録されていません。`,
          severity: 'error',
        });
        setIsLoading(false);
        return;
      }
    } catch (error) {
      setAlertState({
        message: `登録処理中にエラーが発生しました。`,
        severity: 'error',
      });
      setIsLoading(false);
    }
  };

  // フォームのバリデーション
  useEffect(() => {
    if (
      openNumber &&
      selectedPack !== undefined &&
      selectedPack.stockNumber - openNumber >= 0 &&
      totalUnregisteredCardsQuantity >= 0 &&
      selectedOption !== null
    ) {
      setIsRegisterParamsDisabled(false);
    } else {
      setIsRegisterParamsDisabled(true);
    }
  }, [
    selectedPack,
    openNumber,
    totalUnregisteredCardsQuantity,
    selectedOption,
  ]);

  //itemを登録するためのcardCondition情報を取得
  useEffect(() => {
    if (storeID) {
      fetchCategoryList();
    }
  }, [storeID]);

  const cardCategory = useMemo(
    () =>
      category?.itemCategories.find((e) => e.handle == ItemCategoryHandle.CARD),
    [category],
  );
  const boxCategory = useMemo(
    () =>
      category?.itemCategories.find((e) => e.handle == ItemCategoryHandle.BOX),
    [category],
  );

  useEffect(() => {
    //カテゴリの中からカードコンディションを抽出
    if (!cardCategory || !boxCategory) return;

    if (!cardCategory.condition_options.length) {
      setAlertState({
        message: `カードコンディションが設定されていないため、登録できません。`,
        severity: 'error',
      });
    } else {
      setAllOptions(
        [cardCategory, boxCategory].flatMap((c) => {
          if (c.handle === ItemCategoryHandle.BOX) {
            return c.condition_options.map((e) => ({
              id: e.id,
              displayName: `${e.display_name}（ボックス、パック）`,
            }));
          } else {
            return c.condition_options.map((e) => ({
              id: e.id,
              displayName: e.display_name,
            }));
          }
        }),
      );
    }
  }, [cardCategory, boxCategory, setAlertState]);

  //pos_item_idが存在しないものだけを取得
  useEffect(() => {
    setNoPosIdItems(
      itemsToRegister.filter(
        (item): item is typeof item & { pos_item_id: undefined } =>
          !item.pos_item_id,
      ),
    ); // pos_item_idが存在しないものをフィルタリング
  }, [itemsToRegister]);

  //パック数が変わった際に仕入れ値を計算
  useEffect(() => {
    const fetchWholesalePriceHook = async () => {
      if (selectedPack && openNumber) {
        await fetchWholesalePrice(selectedPack.productId, openNumber);
      }
    };
    fetchWholesalePriceHook();
  }, [selectedPack, openNumber]);

  // 履歴復元時のコンディションオプション設定
  useEffect(() => {
    if (restoredConditionOptionId && options.length > 0) {
      const restoredOption = options.find(
        (option) => option.id === restoredConditionOptionId,
      );
      if (restoredOption) {
        setSelectedOption(restoredOption);
      }
    }
  }, [restoredConditionOptionId, options]);

  const handleConfirm = () => {
    // // 残り金額がマイナスの場合はエラーアラートを表示
    if (remainingAmount < 0) {
      setAlertState({
        message:
          '仕入れ値の配分が合計金額を超過しています。仕入れ単価を見直してください。',
        severity: 'error',
      });
      return;
    }

    if (remainingAmount > 0) return setIsOpen(true);
    if (remainingAmount === 0) return handleSave();
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <DetailCard
        title="開封設定"
        content={
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              pt: 2,
              px: 2,
              pb: 1,
              overflow: 'auto',
              width: '100%',
              gap: 1,
            }}
          >
            {isLoading && (
              <Box>
                <Typography>処理中...</Typography>
                <CircularProgressWithLabel value={progress} />
              </Box>
            )}

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                gap: 3,
              }}
            >
              {/* 選択されたパック */}
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Typography variant="body1">開封商品</Typography>
                <Box sx={{ width: '100%' }}>
                  {selectedPack ? (
                    <Box
                      sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          width: '150px',
                          height: '110px',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ItemImage
                          imageUrl={selectedPack.imageUrl}
                          height={110}
                        />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <ItemText text={selectedPack?.displayName} />
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            mt: 1,
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'grey.300',
                              color: 'black',
                              borderRadius: '2px',
                              p: '2px',
                            }}
                          >
                            {selectedPack?.genreName}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {'>'}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'grey.300',
                              color: 'black',
                              borderRadius: '2px',
                              p: '2px',
                            }}
                          >
                            {selectedPack?.categoryName}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ height: '110px' }}></Box>
                  )}
                </Box>
              </Box>

              {/* 最終開封数 */}
              <Box sx={{ width: '100%' }}>
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                    <Typography variant="body1">最終開封数</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'grey.300',
                        color: 'black',
                        borderRadius: '2px',
                        px: '4px',
                        py: '2px',
                      }}
                    >
                      必須
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ width: '50%' }}>
                        <Box sx={{ mx: 2 }}>
                          <NumericTextField
                            value={openNumber}
                            onChange={handleOpenNumberInputChange}
                            size="small"
                            isReadOnly={isDisabledEditOpenNumber}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ width: '50%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'start' }}>
                          <Typography variant="caption">
                            （在庫変動：{selectedPack?.stockNumber} →{' '}
                            {selectedPack.stockNumber - openNumber}）
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* ランダムカード封入数 */}
              {includeRandomPack && (
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                    <Typography variant="body1">
                      ランダムカード封入枚数
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'grey.300',
                        color: 'black',
                        borderRadius: '2px',
                        px: '4px',
                        py: '2px',
                      }}
                    >
                      必須
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      mx: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'flex',
                        alignItems: 'start',
                        justifyContent: 'start',
                        backgroundColor: 'grey.300',
                        color: 'black',
                        borderRadius: '2px',
                        my: '4px',
                        p: '2px',
                      }}
                    >
                      1商品あたりのランダムカードの封入枚数のみをお書きください
                    </Typography>
                    <NumericTextField
                      fullWidth
                      value={randomCardsPerPack}
                      onChange={handleRandomPackItemsCountInputChange}
                      size="small"
                    />
                  </Box>
                </Box>
              )}

              {/* カード合計枚数 */}
              <Box sx={{ width: '100%' }}>
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Typography variant="body1">カード合計枚数</Typography>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body1" sx={{ mx: 2 }}>
                      {totalCards}枚
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* 登録枚数合計 */}
              <Box sx={{ width: '100%' }}>
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Typography variant="body1">登録枚数合計</Typography>
                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 1,
                      mx: 2,
                    }}
                  >
                    <Typography variant="body1">
                      {totalRegisteredCards}枚
                    </Typography>
                    <Typography variant="caption">
                      (未登録カード枚数：{totalUnregisteredCardsQuantity}枚)
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* 登録するカードの状態 */}
              <Box sx={{ width: '100%' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                    <Typography variant="body1">
                      登録するカードの状態
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'grey.300',
                        color: 'black',
                        borderRadius: '2px',
                        px: '4px',
                        py: '2px',
                      }}
                    >
                      必須
                    </Typography>
                  </Box>
                  <Box sx={{ mx: 2 }}>
                    {options && (
                      <Select
                        value={selectedOption?.id || ''}
                        onChange={handleConditionOptionChange}
                        size="small"
                        fullWidth
                      >
                        {options.map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.displayName}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* 1商品あたりの仕入れ値 */}
              <Box sx={{ width: '100%' }}>
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Typography variant="body1">1商品あたりの仕入れ値</Typography>
                  <Box sx={{ mx: 2 }}>
                    <Typography variant="body1">
                      ￥
                      {wholesalePrice && openNumber
                        ? Math.round(
                            wholesalePrice.totalWholesalePrice /
                              wholesalePrice.totalItemCount,
                          ).toLocaleString()
                        : ''}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* カード1枚あたりの仕入れ値 */}
              <Box sx={{ width: '100%' }}>
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Typography variant="body1">
                    カード1枚あたりの仕入れ値
                  </Typography>
                  <Box sx={{ mx: 2 }}>
                    <Typography variant="body1">
                      ￥{unitWholesalePrice}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* 未登録カードの扱い */}
              <Box sx={{ width: '100%', mb: 2 }}>
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                    <Typography variant="body1">
                      登録しないカードの処理
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'grey.300',
                        color: 'black',
                        borderRadius: '2px',
                        px: '4px',
                        py: '2px',
                      }}
                    >
                      必須
                    </Typography>
                  </Box>
                  <Box sx={{ mx: 2 }}>
                    {storageProducts && (
                      <Select
                        value={selectedStorageProduct || ''}
                        onChange={handleSelectStorageProduct}
                        size="small"
                        fullWidth
                      >
                        <MenuItem value="loss">ロス</MenuItem>
                        {storageProducts.map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.display_name} :{' '}
                            {option.condition_option_display_name || '未設定'}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        }
        bottomContent={
          <>
            <PrimaryButton
              fullWidth
              onClick={handleBackProgress}
              variant="text"
            >
              開封商品の選択へ戻る
            </PrimaryButton>
            <PrimaryButton
              fullWidth
              onClick={handleConfirm}
              disabled={isRegisterParamsDisabled}
              loading={isLoading || isLoadingRollback}
            >
              {fixId !== null ? '開封結果の修正を開始' : '開封結果の登録を開始'}
            </PrimaryButton>
            <ConfirmationDialog
              open={isOpen}
              onClose={handleClose}
              isLoading={isLoading}
              onConfirm={handleSave}
              title="残り金額の分配"
              message={`残っている仕入れ金額 ${remainingAmount}円 を、登録されているカードに自動分配します。`}
              confirmButtonText="分配して登録を開始"
            />
          </>
        }
      />
    </>
  );
};
