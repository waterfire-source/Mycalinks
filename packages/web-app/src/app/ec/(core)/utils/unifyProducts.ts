import { SpecialtyHandle } from '@prisma/client';
import { DraftCart } from '@/app/ec/(core)/contexts/CartContext';

/**
 * 統合可能な商品の基本インターフェース
 */
export interface UnifiableProduct {
  readonly id: string | number;
  readonly storeId: number;
  readonly specialty: SpecialtyHandle | string | null;
  readonly price: number;
  readonly quantity: number;
  readonly description: string | null;
  readonly images: Array<{ image_url: string | null }> | null;
  readonly hasCustomization: boolean;
}

/**
 * 統合された商品グループ
 */
export interface UnifiedProductGroup<T extends UnifiableProduct> {
  readonly id: string;
  readonly storeId: number;
  readonly specialty: SpecialtyHandle | string | null;
  readonly price: number;
  readonly totalQuantity: number;
  readonly products: T[];
  readonly hasCustomization: boolean;
}

/**
 * 統合キー生成関数
 */
const createUnificationKey = (
  storeId: number,
  specialty: SpecialtyHandle | string | null,
  price: number,
  description: string | null,
  images: Array<{ image_url: string | null }> | null,
): string => {
  const normalize = (val: string | null | undefined) =>
    val === null || val === '' ? 'null' : val;
  const normalizeImages = (imgs: Array<{ image_url: string | null }> | null) =>
    imgs === null || imgs.length === 0 ? 'null' : String(imgs);

  return `${storeId}-${normalize(
    specialty as string | null,
  )}-${price}-${normalize(description)}-${normalizeImages(images)}`;
};
/**
 * 商品のカスタマイズ判定（画面に応じてオーバーライド可能）
 */
export const hasCustomizationDefault = <T extends UnifiableProduct>(
  product: T,
): boolean => {
  return product.hasCustomization;
};

/**
 * 汎用的な商品統合処理
 * @param products - 統合対象の商品配列
 * @param hasCustomizationFn - カスタマイズ判定関数（デフォルトはhasCustomizationDefault）
 * @returns 統合された商品グループ配列
 */
export function unifyProducts<T extends UnifiableProduct>(
  products: T[],
  hasCustomizationFn: (product: T) => boolean = hasCustomizationDefault,
): UnifiedProductGroup<T>[] {
  const unifiedMap = new Map<string, UnifiedProductGroup<T>>();

  for (const product of products) {
    // カスタマイズがある商品は統合しない
    if (hasCustomizationFn(product)) {
      const singleKey = `single-${product.id}`;
      unifiedMap.set(singleKey, {
        id: singleKey,
        storeId: product.storeId,
        specialty: product.specialty,
        price: product.price,
        totalQuantity: product.quantity,
        products: [product],
        hasCustomization: true,
      });
      continue;
    }

    // 統合キーを生成
    const key = createUnificationKey(
      product.storeId,
      product.specialty,
      product.price,
      product.description,
      product.images,
    );

    const existing = unifiedMap.get(key);
    if (existing) {
      // 既存グループに追加
      unifiedMap.set(key, {
        ...existing,
        totalQuantity: existing.totalQuantity + product.quantity,
        products: [...existing.products, product],
      });
    } else {
      // 新規グループ作成
      unifiedMap.set(key, {
        id: key,
        storeId: product.storeId,
        specialty: product.specialty,
        price: product.price,
        totalQuantity: product.quantity,
        products: [product],
        hasCustomization: false,
      });
    }
  }

  return Array.from(unifiedMap.values());
}

/**
 * ソート関数オプション
 */
export interface SortOption {
  field: 'price' | 'quantity' | 'storeId';
  order: 'asc' | 'desc';
}

/**
 * 統合された商品グループのソート
 */
export function sortUnifiedProducts<T extends UnifiableProduct>(
  unifiedGroups: UnifiedProductGroup<T>[],
  sortOption: SortOption,
): UnifiedProductGroup<T>[] {
  return [...unifiedGroups].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (sortOption.field) {
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'quantity':
        aValue = a.totalQuantity;
        bValue = b.totalQuantity;
        break;
      case 'storeId':
        aValue = a.storeId;
        bValue = b.storeId;
        break;
      default:
        aValue = a.price;
        bValue = b.price;
    }

    if (sortOption.order === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });
}

/**
 * URLパラメータから統合設定を取得
 */
export interface UnificationSettings {
  enabled: boolean;
  sortOption: SortOption;
}

export function getUnificationSettingsFromQuery(
  searchParams: URLSearchParams,
): UnificationSettings {
  const unifyParam = searchParams.get('unify');
  const sortField =
    (searchParams.get('sortField') as SortOption['field']) || 'price';
  const sortOrder =
    (searchParams.get('sortOrder') as SortOption['order']) || 'asc';

  return {
    enabled: unifyParam === 'true',
    sortOption: {
      field: ['price', 'quantity', 'storeId'].includes(sortField)
        ? sortField
        : 'price',
      order: ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'asc',
    },
  };
}

/**
 * セッションストレージによる統合設定保存
 */
const UNIFICATION_STORAGE_KEY = 'ec-product-unification-settings';

export function saveUnificationSettings(settings: UnificationSettings): void {
  try {
    sessionStorage.setItem(UNIFICATION_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save unification settings:', error);
  }
}

export function loadUnificationSettings(): UnificationSettings | null {
  try {
    const saved = sessionStorage.getItem(UNIFICATION_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as UnificationSettings;
    }
  } catch (error) {
    console.warn('Failed to load unification settings:', error);
  }
  return null;
}

/**
 * カート商品の統合可能インターフェース
 * 実際のDraftCartの構造に合わせて定義
 */
export interface CartUnifiableProduct {
  readonly product_id: number;
  readonly original_item_count: number;
  readonly product: {
    readonly condition_option: {
      handle: string;
    };
    readonly mycaItem: {
      readonly id: number;
      readonly cardname: string | null;
      readonly cardnumber: string | null;
    };
  };
  // 統合判定用の追加フィールド
  readonly description?: string | null;
  readonly images?: Array<{ image_url: string | null }> | null;
}

/**
 * カート商品の統合グループ
 */
export interface CartUnifiedProductGroup {
  readonly id: string;
  readonly cardKey: string; // cardname + cardnumber の組み合わせ
  readonly conditionHandle: string;
  readonly totalQuantity: number;
  readonly products: CartUnifiableProduct[];
}

/**
 * カード統合キー生成（カート用）
 * 同じカード（cardname + cardnumber）の同じ状態（condition_handle）のものをグループ化
 */
const createCartUnificationKey = (
  cardname: string | null,
  cardnumber: string | null,
  conditionHandle: string,
): string => {
  const cardKey = `${cardname || ''}-${cardnumber || ''}`;
  return `${cardKey}-${conditionHandle}`;
};

/**
 * カート商品が統合可能かどうかを判定
 * descriptionが空 AND imagesがない場合のみ統合可能
 * （どちらか一つでもあれば統合しない）
 */
const isCartProductUnifiable = (product: CartUnifiableProduct): boolean => {
  const hasNoDescription =
    !product.description || product.description.trim() === '';
  const hasNoImages = !product.images || product.images.length === 0;
  return hasNoDescription && hasNoImages;
};

/**
 * カート商品の統合処理
 * 同じカード（cardname + cardnumber）の同じ状態（condition_handle）の商品をグループ化
 * ただし、descriptionがある または imagesがある商品は統合しない
 * （両方とも空/なしの場合のみ統合対象）
 * @param cartProducts - カート内の商品配列
 * @returns 統合された商品グループ配列
 */
export function unifyCartProducts(
  cartProducts: CartUnifiableProduct[],
): CartUnifiedProductGroup[] {
  const unifiedMap = new Map<string, CartUnifiedProductGroup>();

  for (const product of cartProducts) {
    // 統合可能かチェック
    if (!isCartProductUnifiable(product)) {
      // 統合不可能な商品は個別グループとして作成
      const singleKey = `single-${product.product_id}`;
      unifiedMap.set(singleKey, {
        id: singleKey,
        cardKey: `${product.product.mycaItem.cardname || ''}-${
          product.product.mycaItem.cardnumber || ''
        }`,
        conditionHandle: product.product.condition_option.handle,
        totalQuantity: product.original_item_count,
        products: [product],
      });
      continue;
    }

    const cardname = product.product.mycaItem.cardname;
    const cardnumber = product.product.mycaItem.cardnumber;
    const conditionHandle = product.product.condition_option.handle;

    // 統合キーを生成
    const key = createCartUnificationKey(cardname, cardnumber, conditionHandle);
    const cardKey = `${cardname || ''}-${cardnumber || ''}`;

    const existing = unifiedMap.get(key);
    if (existing) {
      // 既存グループに追加
      unifiedMap.set(key, {
        ...existing,
        totalQuantity: existing.totalQuantity + product.original_item_count,
        products: [...existing.products, product],
      });
    } else {
      // 新規グループ作成
      unifiedMap.set(key, {
        id: key,
        cardKey,
        conditionHandle,
        totalQuantity: product.original_item_count,
        products: [product],
      });
    }
  }

  return Array.from(unifiedMap.values());
}

/**
 * ドラフトカート全体から店舗別に統合された商品グループを取得
 * @param draftCart - ドラフトカート
 * @param targetStoreId - 対象店舗ID（指定すればその店舗のみ）
 * @returns 店舗別の統合商品グループ配列
 */
export function getUnifiedCartProductsByStore(
  draftCart: DraftCart | null,
  targetStoreId?: number,
): Record<number, CartUnifiedProductGroup[]> {
  if (!draftCart?.cart_stores) {
    return {};
  }

  const result: Record<number, CartUnifiedProductGroup[]> = {};

  for (const store of draftCart.cart_stores) {
    // 特定の店舗のみを対象とする場合
    if (targetStoreId && store.store_id !== targetStoreId) {
      continue;
    }

    // その店舗の商品を統合
    const unifiedGroups = unifyCartProducts(store.products);
    result[store.store_id] = unifiedGroups;
  }

  return result;
}

/**
 * 特定のカードの統合グループを特定の店舗から取得
 * @param draftCart - ドラフトカート
 * @param storeId - 店舗ID
 * @param cardname - カード名
 * @param cardnumber - カード番号
 * @returns そのカードの統合グループ（見つからない場合は空配列）
 */
export function getCartUnifiedGroupForCard(
  draftCart: DraftCart | null,
  storeId: number,
  cardname: string | null,
  cardnumber: string | null,
): CartUnifiedProductGroup[] {
  const storeGroups = getUnifiedCartProductsByStore(draftCart, storeId);
  const targetCardKey = `${cardname || ''}-${cardnumber || ''}`;

  if (!storeGroups[storeId]) {
    return [];
  }

  return storeGroups[storeId].filter(
    (group) => group.cardKey === targetCardKey,
  );
}
