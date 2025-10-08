export class TaxCalculator {
  /** 内部で管理する税率（10%） */
  private static readonly TAX_RATE = 0.1;

  /** デフォルトコンストラクタ（税率は固定のため引数不要） */
  constructor() {}

  /**
   * 税抜価格から税額を計算します。
   * @param price 税抜価格（円）
   * @returns 計算された税額（円）
   *
   * @example
   * // 税抜価格1,000円 → 税額100円
   * // 税抜価格2,345円 → 税額234円（2,345 * 0.1 = 234.5 → 四捨五入）
   */
  public getTaxAmount(price: number): number {
    return Math.round(price * TaxCalculator.TAX_RATE);
  }

  /**
   * 税込価格から税額を計算します。
   * @param price 税込価格（円）
   * @returns 計算された税額（円）
   *
   * @example
   * // 税込価格1,100円 → 税額100円（1,100 ÷ 1.1 = 1,000 → 差分100）
   * // 税込価格2,579円 → 税額235円（2,579 ÷ 1.1 ≒ 2,344.545… → 2,345 → 差分234 → 四捨五入で235）
   */
  public getTaxAmountFromIncludedPrice(price: number): number {
    return Math.round(price - price / (1 + TaxCalculator.TAX_RATE));
  }

  /**
   * 税抜価格から税込価格を計算します。
   * @param price 税抜価格（円）
   * @returns 計算された税込価格（円）
   *
   * @example
   * // 税抜価格1,000円 → 税込価格1,100円
   * // 税抜価格2,345円 → 税込価格2,580円（2,345 * 1.1 = 2,579.5 → 四捨五入）
   */
  public getPriceWithTax(price: number): number {
    return Math.round(price * (1 + TaxCalculator.TAX_RATE));
  }

  /**
   * 税込価格から税抜価格を計算します。
   * @param price 税込価格（円）
   * @returns 計算された税抜価格（円）
   *
   * @example
   * // 税込価格1,100円 → 税抜価格1,000円
   * // 税込価格2,580円 → 税抜価格2,345円（2,580 ÷ 1.1 = 2,345.454… → 四捨五入）
   */
  public getPriceWithoutTax(price: number): number {
    return Math.round(price / (1 + TaxCalculator.TAX_RATE));
  }
}
