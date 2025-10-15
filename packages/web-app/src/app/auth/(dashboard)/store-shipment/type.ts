import type { StoreShipmentService } from 'api-generator/client';

export type FieldType = 'condition_option' | 'genre' | 'specialty' | 'category';

// API型から抽出
export type ShipmentMappingRequestBody = Parameters<
  StoreShipmentService['setStoreShipmentMapping']
>[0]['requestBody'];

export type FormValue = NonNullable<ShipmentMappingRequestBody>['mappings'];

// 各フィールドの from/to キーをユニオンで定義（型安全化に利用）
export type FromFieldKey =
  | 'from_option_id'
  | 'from_genre_id'
  | 'from_specialty_id'
  | 'from_category_id';
export type ToFieldKey =
  | 'to_option_id'
  | 'to_genre_id'
  | 'to_specialty_id'
  | 'to_category_id';
export type FieldKey = FromFieldKey | ToFieldKey;

// RelationSettingItem
/**
 * 状態の型
 */
interface ConditionOptionField {
  id: string;
  from_option_id: number | null;
  to_option_id: number | null;
}

/**
 * ジャンル関連設定の型
 */
interface GenreField {
  id: string;
  from_genre_id: number | null;
  to_genre_id: number | null;
}

/**
 * 特殊状態の型
 */
interface SpecialtyField {
  id: string;
  from_specialty_id: number | null;
  to_specialty_id: number | null;
}

/**
 * カテゴリの型
 */
interface CategoryField {
  id: string;
  from_category_id: number | null;
  to_category_id: number | null;
}

export type FieldItem =
  | ConditionOptionField
  | GenreField
  | SpecialtyField
  | CategoryField;

export interface SelectOption {
  value: number;
  label: string;
}
