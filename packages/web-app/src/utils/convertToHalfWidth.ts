//全角の数字を半角に変換するutil

export const toHalfWidth = (str: string) => {
  // 半角に変換するタイミングで色々起きてそうなのでコメントアウト
  return str;
  //   str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
  //     String.fromCharCode(s.charCodeAt(0) - 0xfee0),
  // );
};

// 全角の数字を半角に変換し、全角英字や記号を削除するutil
export const toHalfWidthOnly = (str: string) => {
  // 半角に変換するタイミングで色々起きてそうなのでコメントアウト
  return str;
  // const converted = toRomaji(str.normalize('NFKC'));
  // return converted.replace(/[^\u0020-\u007E]/g, '');
};
