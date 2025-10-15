//署名付きのバーコード関係のクラス

import dayjs from 'dayjs';
import { Corporation, Customer } from '@prisma/client';
import { ApiError } from '@/api/backendApi/error/apiError';
import { CustomCrypto } from 'common';

type barcodeKind = 'app' | 'pos';

export class Barcode {
  //文字列を数字にする（6桁）
  private static stringToHash(string: string, length: number = 6) {
    let hash: any = 0;

    for (let i = 0; i < string.length; i++) {
      const char = string.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    hash = Math.abs(hash);
    hash = String(hash).slice(0, length).padStart(length, '0');

    return hash;
  }

  //会員のバーコードの検証を行う
  //バーコードのスキーマ 24桁
  // 0000 0000 0000 0000 0000 0000
  // 4|000 0000|0000 0000 00|00 0000
  // myca接頭辞(4)|ユーザーID|unixtime上10桁|左の署名6桁

  //非会員のバーコード 12桁
  // 0000 0000 0000
  // 5|000 0000|0000
  // 5接頭辞(5)|ユーザーID|左の署名4桁

  // 6|000 0000 0000|0000 00|00 0000
  // staff接頭辞(6)|法人ID|従業員コード|左の署名6桁
  public static verifyBarcode(token: string): {
    kind: barcodeKind;
    userId?: number; //mycaのユーザーID
    customerId?: Customer['id']; //POSの顧客ID
    corporationId?: Corporation['id']; //従業員バーコードの場合 [TODO] returnわかりやすくしたい
  } {
    if (token.length != 24 && token.length != 12)
      throw new ApiError({
        status: 400,
        messageText: '会員バーコードが不適切です',
      });

    let barcodeKind: barcodeKind;

    let userId: number | undefined = undefined;
    let customerId: Customer['id'] | undefined = undefined;
    const corporationId: Corporation['id'] | undefined = undefined;

    switch (token[0]) {
      case '4': {
        barcodeKind = 'app';

        const tokenBody = token.slice(0, 18);

        const exp = tokenBody.slice(-10);

        //有効期限チェック また、有効期限が10分以上後だったらおかしいため、蹴る
        if (
          dayjs.unix(parseInt(exp)).isBefore(dayjs()) ||
          dayjs.unix(parseInt(exp)).isAfter(dayjs().add(10, 'minute'))
        )
          throw new ApiError({
            status: 400,
            messageText: '会員バーコードの有効期限が切れています',
          });

        const tokenBodySignatured = CustomCrypto.signBarcode(tokenBody);

        //署名チェック
        if (token.slice(18) != this.stringToHash(tokenBodySignatured))
          throw new ApiError({
            status: 400,
            messageText: '会員バーコードが不適切です',
          });

        userId = parseInt(token.slice(1, 8));

        break;
      }
      case '5': {
        barcodeKind = 'pos';

        const tokenBody = token.slice(0, 8);

        const tokenBodySignatured = CustomCrypto.signBarcode(tokenBody);

        //署名チェック
        if (token.slice(8) != this.stringToHash(tokenBodySignatured, 4))
          throw new ApiError({
            status: 400,
            messageText: '会員バーコードが不適切です',
          });

        customerId = parseInt(token.slice(1, 8));

        break;
      }
      // case '6':
      //   barcodeKind = 'staff';
      //   break;
      default:
        throw new ApiError({
          status: 400,
          messageText: '会員バーコードが不適切です',
        });
    }

    console.log(`バーコードがパースできました`, {
      kind: barcodeKind,
      userId,
      customerId,
      corporationId,
    });

    return {
      kind: barcodeKind,
      userId,
      customerId,
      corporationId,
    };
  }

  /**
   * Mycaユーザーの、POS連携用の会員バーコードを生成する
   */
  public static generateMycaUserBarcode(mycaUserId: number): string {
    let tokenString = '4'; //Mycaの接頭辞

    //QRの方は情報はIDと有効期限だけ

    tokenString = `${tokenString}${String(mycaUserId).padStart(7, '0')}`;

    const exp = dayjs().add(5, 'm').unix();

    tokenString = `${tokenString}${exp}`;

    const tokenSignatured = CustomCrypto.signBarcode(tokenString);

    tokenString = `${tokenString}${this.stringToHash(tokenSignatured)}`;

    return tokenString;
  }

  //従業員コード用のバーコードを生成する
  //有効期限は特になし
  //バーコードのスキーマ 24桁
  // 0000 0000 0000 0000 0000 0000
  // 6|000 0000 0000|0000 00|00 0000
  // 従業員アカウントの接頭辞(6)|法人ID|従業員コード6桁|左の署名6桁
  // public static generateStaffBarcode(
  //   corporationId: Corporation['id'],
  //   staffCode: Staff['code'],
  // ): string {
  //   let tokenString = '6';
  //   tokenString = `${tokenString}${String(corporationId).padStart(11, '0')}`;
  //   tokenString = `${tokenString}${String(staffCode).padStart(6, '0')}`;

  //   const tokenSignatured = CustomCrypto.signBarcode(tokenString);

  //   tokenString = `${tokenString}${this.stringToHash(tokenSignatured)}`;

  //   return String(tokenString);
  // }

  //非会員コードのバーコード発行
  //有効期限は特になし
  //非会員のバーコード
  // 0000 0000 0000
  // 5|000 0000|0000
  // 5接頭辞(5)|ユーザーID|左の署名4桁

  public static generateCustomerBarcode(customerId: Customer['id']): string {
    let tokenString = '5';
    tokenString = `${tokenString}${String(customerId).padStart(7, '0')}`;

    const tokenSignatured = CustomCrypto.signBarcode(tokenString);

    tokenString = `${tokenString}${this.stringToHash(tokenSignatured, 4)}`;

    return String(tokenString);
  }
}
