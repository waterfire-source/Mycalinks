// URL安全なBase64デコードを行う関数
export const urlSafeBase64Decode = (str: string): string => {
  // URL安全なBase64を標準的なBase64に変換：
  // + ⇔ - (マイナス)
  // / ⇔ _ (アンダースコア)
  // = ⇔ 省略されている(必要に応じて末尾に追加)
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // パディング（末尾の=）を追加
  while (base64.length % 4) {
    base64 += '=';
  }

  try {
    return atob(base64);
  } catch (e) {
    console.error('Base64デコードエラー:', e);
    return '';
  }
};

export const decodeStockParams = (
  encodedParams: string,
): { storeId: number; printerSerialNumber: string } => {
  try {
    // URL安全なBase64でエンコードされた文字列をデコード
    const decodedString = urlSafeBase64Decode(encodedParams);
    if (!decodedString) {
      throw new Error('デコードされた文字列が空です');
    }

    // JSONをパース
    const params = JSON.parse(decodedString);

    return {
      storeId: params.storeId,
      printerSerialNumber: params.printerSerialNumber,
    };
  } catch (error) {
    console.error('デコードエラー:', error);
    return {
      storeId: 0,
      printerSerialNumber: '',
    };
  }
};

export const urlSafeBase64Encode = (str: string): string => {
  // 全角入力が入っていたら削除する
  const halfWidthStr = str.replace(/[^\x00-\x7F]/g, '');
  // 標準的なBase64をURL安全なBase64に変換
  return btoa(halfWidthStr)
    .replace(/\+/g, '-') // + → -
    .replace(/\//g, '_') // / → _
    .replace(/=+$/, ''); // 末尾の = を削除
};
