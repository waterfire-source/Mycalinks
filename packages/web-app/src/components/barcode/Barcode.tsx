import React from 'react';
import { Box } from '@mui/material';
import JSBarcode from 'jsbarcode';

// eslint-disable-next-line no-restricted-imports
import {
  getMaximumHeightOfEncodings,
  getTotalWidthOfEncodings,
  merge,
  calculateEncodingAttributes,
} from './services';
import { Background } from '@/components/barcode/components/Background';
import {
  BarcodeChunkOptions,
  BarcodeChunk,
} from '@/components/barcode/components/BarcodeChunk';
import {
  BarcodeTextOptions,
  BarcodeText,
} from '@/components/barcode/components/BarcodeText';

/**
 * バーコードフォーマット（シンボロジー）を定義する列挙型
 */
export enum BarcodeFormat {
  /** 自動判定（デフォルトは CODE128） */
  AUTO = 'auto',
  /** CODE128 - 汎用性の高いフォーマット */
  CODE128 = 'CODE128',
  /** CODE128A - 英数字大文字と制御文字のみ */
  CODE128A = 'CODE128A',
  /** CODE128B - 英数字大文字・小文字対応 */
  CODE128B = 'CODE128B',
  /** CODE128C - 数字ペア専用（数字2桁を1コードで表現） */
  CODE128C = 'CODE128C',
  /** EAN-13 - 国際的な商品コード */
  EAN13 = 'EAN13',
  /** EAN-8 - 短い商品コード */
  EAN8 = 'EAN8',
  /** UPC - 主に米国で使用される商品コード */
  UPC = 'UPC',
  /** CODE39 - 英数字大文字のみ */
  CODE39 = 'CODE39',
  /** ITF - Interleaved 2 of 5 */
  ITF = 'ITF',
  /** ITF-14 - 14桁のITF */
  ITF14 = 'ITF14',
  /** MSI - Modulo 10チェックサム */
  MSI = 'MSI',
  /** MSI Mod 10 */
  MSI10 = 'MSI10',
  /** MSI Mod 11 */
  MSI11 = 'MSI11',
  /** MSI Mod 1010 */
  MSI1010 = 'MSI1010',
  /** MSI Mod 1110 */
  MSI1110 = 'MSI1110',
  /** Pharmacode - 医薬品コード */
  PHARMACODE = 'Pharmacode',
}

/** JSBarcode のオプション型定義 */
interface BarcodeOptions {
  /** フォーマット（シンボロジー） */
  format?: BarcodeFormat;
  background?: string;
  displayValue?: boolean;
  fontOptions?: string;
  fontSize?: number;
  height?: number;
  lineColor?: string;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  textAlign?: 'left' | 'center' | 'right';
  textMargin?: number;
  textPosition?: 'top' | 'bottom';
  width?: number;
  [key: string]: any;
}

/** Barcode コンポーネントの Props */
interface BarcodeProps {
  /** バーコードにエンコードする文字列 */
  value: string;
  /** JSBarcode オプション */
  options?: BarcodeOptions;
  /** 回転角度 (度数) */
  rotation?: number;
  /** true の場合 3333+0埋め+value の16桁に変形 */
  applyTransform?: boolean;
  /** applyTransformがtrueの場合バーコードの文字数を変更 */
  charCount?: number;
}

export const Barcode: React.FC<BarcodeProps> = ({
  value,
  options = {},
  rotation = 0,
  applyTransform = false,
  charCount = 16,
}) => {
  /** value を 16 桁に変形するロジック */
  const transformValue = (): string => {
    const prefix = '3333';
    const zerosCount = Math.max(charCount - prefix.length - value.length, 0);
    return prefix + '0'.repeat(zerosCount) + value;
  };

  const finalValue = applyTransform ? transformValue() : value;
  const barcode: { encodings?: any[] } = {};

  /** デフォルトオプション */
  const defaultOptions: BarcodeOptions = {
    format: BarcodeFormat.AUTO,
    background: '#ffffff',
    displayValue: true,
    fontOptions: 'bold',
    fontSize: 20,
    height: 100,
    lineColor: '#000000',
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    textAlign: 'center',
    textMargin: 2,
    textPosition: 'bottom',
    width: 2,
  };

  // JSBarcode 実行
  JSBarcode(barcode, finalValue, options);
  const encodings = barcode.encodings ?? [];

  // エンコーディング属性計算
  const mergedOptions = merge(defaultOptions, options as any);
  calculateEncodingAttributes(encodings, mergedOptions);

  // SVG サイズ計算
  const totalWidth = getTotalWidthOfEncodings(encodings);
  const maxHeight = getMaximumHeightOfEncodings(encodings);
  const width =
    totalWidth + mergedOptions.marginLeft + mergedOptions.marginRight;

  // 各チャンクの x 座標リスト
  const xs: number[] = [mergedOptions.marginLeft];
  encodings.forEach((e: any) => xs.push(xs[xs.length - 1] + e.width));

  return (
    <Box
      component="svg"
      viewBox={`0 0 ${width} ${maxHeight}`}
      // width={width}
      width="100%"
      height={maxHeight}
      sx={{
        transform: `rotate(${rotation}deg)`,
        display: 'block',
      }}
    >
      {mergedOptions.background && (
        <Background
          width={width}
          height={maxHeight}
          color={mergedOptions.background}
        />
      )}
      {encodings.map((encoding, i) => {
        const encodingOptions = merge(
          options,
          encoding.options || {},
        ) as BarcodeOptions;

        const barcodeChunkOptions: BarcodeChunkOptions = {
          textPosition: encodingOptions.textPosition ?? 'bottom',
          fontSize: encodingOptions.fontSize ?? 20,
          textMargin: encodingOptions.textMargin ?? 2,
          width: encodingOptions.width ?? 2,
          height: encodingOptions.height ?? 100,
        };

        const barcodeTextOptions: BarcodeTextOptions = {
          displayValue: encodingOptions.displayValue ?? true,
          textPosition: encodingOptions.textPosition ?? 'bottom',
          fontSize: encodingOptions.fontSize ?? 20,
          textMargin: encodingOptions.textMargin ?? 2,
          textAlign: encodingOptions.textAlign ?? 'center',
          height: encodingOptions.height ?? 100,
          lineColor: encodingOptions.lineColor ?? '#000000',
        };

        return (
          <g
            key={i}
            transform={`translate(${xs[i]}, ${encodingOptions.marginTop})`}
            fill={encodingOptions.lineColor}
          >
            <BarcodeChunk
              binary={encoding.data}
              padding={encoding.barcodePadding}
              options={barcodeChunkOptions}
            />
            <BarcodeText
              text={encoding.text}
              width={encoding.width}
              padding={encoding.barcodePadding}
              options={barcodeTextOptions}
            />
          </g>
        );
      })}
    </Box>
  );
};
