/**
 * 商品件数管理ユーティリティ
 * 統合後の正確な件数を各画面で簡単に取得できるモジュール
 */

/**
 * シンプルな件数表示（統合を隠蔽）
 * @param count 表示する件数
 * @returns 表示用テキスト
 */
export function formatSimpleCount(count: number): string {
  return `${count}件の出品`;
}

/**
 * 商品があるかどうかの判定
 * @param count 商品件数
 * @returns 商品があるかどうか
 */
export function hasProducts(count: number): boolean {
  return count > 0;
}

/**
 * 複数商品があるかどうかの判定（統合制御で使用）
 * @param count 商品件数
 * @returns 複数商品があるかどうか
 */
export function hasMultipleProducts(count: number): boolean {
  return count > 1;
}

/**
 * 件数に基づく表示メッセージを取得
 * @param count 商品件数
 * @returns 表示メッセージ
 */
export function getProductCountMessage(count: number): string {
  if (count === 0) {
    return '現在、購入可能な商品はありません';
  }
  return formatSimpleCount(count);
}

/**
 * 「◯件の出品を見る」形式のテキストを生成
 * @param count 商品件数
 * @returns 表示用テキスト
 */
export function formatViewAllText(count: number): string {
  return `${count}件の出品を見る`;
}

// 使用例:
// const displayText = formatSimpleCount(3); // "3件の出品"
// const viewAllText = formatViewAllText(3); // "3件の出品を見る"
