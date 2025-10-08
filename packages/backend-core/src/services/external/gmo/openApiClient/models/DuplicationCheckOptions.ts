/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 重複チェック情報
 * **成功取引、直接、トークン化の場合に指定が可能です。**
 * **トークン化の場合、MPクレカトークンのみ利用可能です。**
 *
 */
export type DuplicationCheckOptions = {
  /**
   * カード番号重複チェック
   * 他会員IDで既に登録されているカード番号の登録を許可しない場合は<span class="mp-oas-code">true</span>にします。
   * チェックの結果、既に同じカード番号が他会員IDに登録されている場合は<span class="mp-oas-code">invalid_request</span>エラーが返ります。
   * 有効期限および同一会員IDの登録状況はチェックしません。
   *
   */
  enableDuplicationCheck?: boolean;
  /**
   * 重複チェックに削除カードを含めるか
   * カード番号重複チェック時の対象に削除済みカードを含める場合は<span class="mp-oas-code">true</span>にします。
   *
   */
  includeDeletedCards?: boolean;
  /**
   * 重複チェック除外会員ID
   * 設定した会員IDの一覧は、カード番号重複チェックの対象外にします。
   * 最大20個まで設定可能です。
   *
   */
  excludedMemberIds?: Array<string>;
};
