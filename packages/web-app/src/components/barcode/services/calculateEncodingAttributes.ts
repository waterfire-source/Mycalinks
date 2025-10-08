/* eslint-disable no-restricted-imports */
import { merge } from './merge';
import { measureText } from './measureText';
import { getBarcodePadding } from './getBarcodePadding';
import { getEncodingHeight } from './getEncodingHeight';

export function calculateEncodingAttributes(
  encodings: string | any[],
  barcodeOptions: any,
  context?: any,
) {
  // 入力配列が有効かチェック
  if (!Array.isArray(encodings)) {
    return [];
  }

  // 新しい配列を作成して元の配列を変更しないようにする
  const newEncodings = [...encodings];

  for (let i = 0; i < newEncodings.length; i++) {
    const encoding = newEncodings[i];

    // 必須プロパティの存在チェック
    if (!encoding || !encoding.data) {
      continue;
    }
    const options = merge(barcodeOptions, encoding.options);

    // Calculate the width of the encoding
    let textWidth;
    if (options.displayValue) {
      textWidth = measureText(encoding.text, options, context);
    } else {
      textWidth = 0;
    }

    const barcodeWidth = encoding.data.length * options.width;
    encoding.width = Math.ceil(Math.max(textWidth, barcodeWidth));

    encoding.height = getEncodingHeight(encoding, options);

    encoding.barcodePadding = getBarcodePadding(
      textWidth,
      barcodeWidth,
      options,
    );
  }
  return newEncodings;
}
