import type { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';

export type ProductSearchResult =
  BackendProductAPI[0]['response']['200']['products'][0];

/**
 * 統一対象商品をフィルタリング
 */
export const filterUnifyTargetProducts = (
  allProducts: ProductSearchResult[],
  baseProducts: ProductSearchResult[],
): ProductSearchResult[] => {
  return allProducts.filter((product) => {
    // 基準商品のいずれかと一致する条件を持つか
    const matchesAnyBase = baseProducts.some((baseProduct) => {
      // 同じmyca_item_id
      const sameMycaItemId =
        product.item_myca_item_id === baseProduct.item_myca_item_id;

      // 同じレアリティ
      const sameRarity = product.item_rarity === baseProduct.item_rarity;

      // 同じspecialty_id（nullは同じnull）
      const sameSpecialty = product.specialty_id === baseProduct.specialty_id;

      // 同じcondition_option_id
      const sameCondition =
        product.condition_option_id === baseProduct.condition_option_id;

      return sameMycaItemId && sameRarity && sameSpecialty && sameCondition;
    });

    if (!matchesAnyBase) return false;

    // EC出品可能（出品中または未出品）
    const isEcAvailable =
      product.mycalinks_ec_enabled === true ||
      product.mycalinks_ec_enabled === false;

    // メモがない
    const hasNoMemo = !product.description || product.description.trim() === '';

    // 画像がない
    const hasNoImages = !product.images || product.images.length === 0;

    // 自分自身を除外（baseProductsに含まれるIDは除外）
    // const isNotBaseProduct = !baseProducts.some((bp) => bp.id === product.id);

    return isEcAvailable && hasNoMemo && hasNoImages;
  });
};

/**
 * 基準商品からカード名を取得
 */
export const getCardDisplayName = (product: ProductSearchResult): string => {
  const cardName =
    product.item_myca_item_id || product.displayNameWithMeta || '商品';
  const rarity = product.item_rarity || '';
  return `${cardName} ${rarity}`.trim();
};

/**
 * 複数商品のカード名を取得（重複排除）
 */
export const getUniqueCardNames = (products: ProductSearchResult[]): string => {
  const uniqueNames = [...new Set(products.map(getCardDisplayName))];
  return uniqueNames.join(', ');
};

/**
 * 価格統一が必要な商品があるかどうかを判定
 * PriceUnificationConfirmModalのcardGroupsロジックと同じ
 */
export const hasPriceUnificationNeeded = (
  baseProducts: ProductSearchResult[],
  unifyTargetProducts: ProductSearchResult[],
): boolean => {
  if (baseProducts.length === 0 || unifyTargetProducts.length === 0) {
    return false;
  }

  const groups: { [cardId: string]: number } = {};

  baseProducts.forEach((product) => {
    const cardId = String(product.item_myca_item_id || '不明');

    if (!groups[cardId]) {
      // 統一対象商品数を計算（同じcardIdの統一対象商品をカウント）
      const targetCountForCard = unifyTargetProducts.filter((targetProduct) => {
        const targetCardId = String(targetProduct.item_myca_item_id || '不明');
        return targetCardId === cardId;
      }).length;

      groups[cardId] = targetCountForCard;
    }
  });

  // 統一対象商品が2個以上のグループがあるかチェック
  return Object.values(groups).some((count) => count > 1);
};
