//暗号関連
import crypto from 'crypto';

// 型
import { Account } from '@prisma/client';
import * as generator from 'generate-password';
import { v4 as uuidv4 } from 'uuid';

export class CustomCrypto {
  private static keys = {
    barcode: {
      privateKey: process.env.BARCODE_PRIVATE_KEY || '',
      iv: process.env.BARCODE_IV || '',
    },
  };

  /**
   * パスワード生成
   * @returns 生成されたパスワード
   */
  public static generatePassword = () => {
    const password = generator.generate({
      length: 12,
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
      excludeSimilarCharacters: true, // 似た文字を除外（例: O と 0）
      strict: true, // 必ず各種文字が最低1文字は入るように
    });

    return password;
  };

  /**
   * UUID発行
   */
  public static generateUuid = () => {
    const uuid = uuidv4();

    return uuid;
  };

  //署名を行う
  public static signBarcode(body: string) {
    //atStore: 店でのQRコード発行かどうか
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      this.keys.barcode.privateKey,
      this.keys.barcode.iv,
    );

    let encrypted: string = cipher.update(body, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
  }

  /**
   * ソルト付きでSHA-256ハッシュ化を行う
   * @param plaintext ハッシュ化する文字列
   * @returns {hash: string, salt: string} ハッシュ値とソルト
   */
  public static generateHash(plaintext: string) {
    // 毎回新しいソルトを生成（16バイト = 32文字のhex文字列）
    const salt = crypto.randomBytes(16).toString('hex');

    // ソルトと文字列を結合してハッシュ化
    const hash = crypto
      .createHash('sha256')
      .update(salt + plaintext)
      .digest('hex');

    return {
      hash,
      salt,
    };
  }

  public static sha256(text: string) {
    const hash = crypto.createHash('sha256').update(text).digest('hex');

    return hash;
  }

  /**
   * パスワードを検証する
   * @param plaintext 検証する文字列
   * @param storedHash 保存されているハッシュ値
   * @param storedSalt 保存されているソルト
   */
  public static verifyHash(
    plaintext: string,
    storedHash: Account['hashed_password'],
    storedSalt: Account['salt'],
  ): boolean {
    const hash = crypto
      .createHash('sha256')
      .update(storedSalt ? storedSalt + plaintext : plaintext)
      .digest('hex');

    return hash === storedHash;
  }

  public static randomState = crypto.randomBytes(32).toString('hex');

  public static base64Decode = (a: string) => {
    const base64decoded: string = atob(a);

    let jsonParsed: any = {};

    try {
      jsonParsed = JSON.parse(base64decoded);
    } catch (e) {
      console.error(e);
    }

    return jsonParsed;
  };

  public static base64Encode = (b: any) => btoa(JSON.stringify(b));
}
