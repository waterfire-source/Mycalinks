//おちゃのこメール関連

import { ParsedMail } from 'mailparser';
import { MailService } from './main';

export class OchanokoMailService extends MailService {
  public static config = {
    webhookPath: '/api/ochanoko/webhook',
  };

  constructor(parsedMail: ParsedMail) {
    super(parsedMail);
  }

  /**
   * メールの種類を判断
   */
  private get mailKind(): 'ordered' | 'shipped' | null {
    if (
      this.subject.includes('ご注文がありました') &&
      !this.subject.includes('ご注文が完了しました※')
    ) {
      return 'ordered'; //注文完了
    }

    if (this.subject.includes('発送が完了')) {
      return 'shipped'; //発送完了
    }

    return null;
  }

  /**
   * メール本文から受注番号を抽出する関数
   * @param text メール本文（プレーンテキスト）
   * @returns 受注番号（見つからなければ null）
   */
  private get orderId(): number | null {
    const match = this.bodyText.match(/受注番号：\s*(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * 注文情報の取得
   */
  public get orderInfo(): OrderInfo {
    const result: OrderInfo = null;

    //受注番号を取得
    const orderId = this.orderId;

    if (!orderId) {
      return null;
    }

    //ストアのメールアドレスを取得
    const storeEmail = this.to;

    if (!storeEmail) {
      return null;
    }

    //どの種類のメールなのか判断
    const mailKind = this.mailKind;

    if (!mailKind) {
      return null;
    }

    return {
      orderId,
      storeEmail,
      status: mailKind,
    };
  }
}

type OrderInfo = {
  orderId: number;
  storeEmail: string;
  status: 'ordered' | 'shipped';
} | null;
