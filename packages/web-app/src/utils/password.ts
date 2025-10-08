import crypto from 'crypto';

export class Password {
  /**
   * パスワードを生成する
   * @param length パスワードの長さ
   * @returns パスワード
   */
  public static generatePassword(length: number = 8): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(crypto.randomBytes(length))
      .map((byte) => characters[byte % characters.length])
      .join('');
  }
}
