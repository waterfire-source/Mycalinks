/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DuplicationCheckOptions } from './DuplicationCheckOptions';
import type { MemberId } from './MemberId';
import type { MemberName } from './MemberName';
import type { OnfileCardId } from './OnfileCardId';
/**
 * カード登録オプション情報
 * カード情報を会員に紐づけて登録する必要がない場合は、このパラメーターを設定しないでください。
 *
 */
export type OnfileCardOptions = {
  /**
   * カード情報を登録する対象の会員ID
   * 該当する会員IDが存在しない場合は登録できませんが、<span class="mp-oas-code">createNewMember</span>パラメーターを<span class="mp-oas-code">true</span>にすることで会員IDを新規登録します。
   *
   */
  memberId: MemberId;
  /**
   * 新規登録する会員の名称
   * 会員を新規登録する場合にのみ設定できます。
   * カードの追加・更新時に設定してもエラーにはなりませんが、会員の名称は更新されません。
   *
   */
  memberName?: MemberName;
  /**
   * 更新するカードのID(物理連番)
   * 登録済みのカード情報を上書きして保存する場合に該当のカードIDを設定します。
   * 新規で追加保存する場合は設定不要です。
   * 最大で5枚のカードを登録できます。
   *
   */
  cardId?: OnfileCardId;
  /**
   * 会員ID未登録時の新規作成
   * <span class="mp-oas-code">true</span>にすると、指定した会員IDが存在しない場合に新規登録します。
   *
   */
  createNewMember?: boolean;
  /**
   * デフォルト設定
   * <span class="mp-oas-code">true</span>にすると、このカードがデフォルトカードとして登録されます。
   * デフォルトカードにした場合、随時支払い時にカードのID(物理連番)<span class="mp-oas-code">cardId</span>、またインデックス(論理連番)<span class="mp-oas-code">index</span>の設定が不要です。
   * また、洗替や一括決済サービス時に「カード登録連番」を設定することなく利用できます。
   *
   */
  setDefault?: boolean;
  duplicationCheckOptions?: DuplicationCheckOptions;
};
