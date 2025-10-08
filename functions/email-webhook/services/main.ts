import { ParsedMail } from 'mailparser';

export class MailService {
  constructor(protected parsedMail: ParsedMail) {}

  public get provider(): 'ochanoko' | null {
    //おちゃのこかどうか
    if (this.messageId.includes('ocnk.net')) {
      return 'ochanoko';
    }

    return null;
  }

  /**
   * メールの本文を取得
   */
  protected get bodyText(): string {
    return this.parsedMail.text || this.parsedMail.html || '';
  }

  /**
   * メールの件名を取得
   */
  protected get subject(): string {
    return this.parsedMail.subject || '';
  }

  /**
   * メールの送信者を取得
   */
  protected get from(): string {
    return this.parsedMail.from?.text || '';
  }

  /**
   * メールのメッセージIDを取得
   */
  protected get messageId(): string {
    return this.parsedMail.messageId || '';
  }

  /**
   * メールの宛先を取得
   */
  public get to(): string {
    let to = '';

    if (this.parsedMail.to) {
      if (Array.isArray(this.parsedMail.to)) {
        // 複数の宛先がある場合は最初のアドレスを使用
        to = this.parsedMail.to[0]?.text || '';
      } else {
        // 単一の宛先の場合
        to = this.parsedMail.to.text || '';
      }
    }

    return to;
  }
}
