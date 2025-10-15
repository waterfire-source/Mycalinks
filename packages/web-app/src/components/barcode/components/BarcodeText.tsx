import React from 'react';

export type BarcodeTextOptions = {
  displayValue: boolean;
  textPosition: 'top' | 'bottom';
  fontSize: number;
  textMargin: number;
  textAlign: 'left' | 'right' | 'center';
  height: number;
  lineColor: string;
};

type BarcodeTextProps = {
  text: string;
  width: number;
  padding: number;
  options: BarcodeTextOptions;
};

export const BarcodeText: React.FC<BarcodeTextProps> = ({
  text,
  width,
  padding,
  options,
}) => {
  if (!options.displayValue) return null;

  let x: number;
  let y: number;
  let textAnchor: 'start' | 'end' | 'middle';

  // eslint-disable-next-line prefer-const
  y =
    options.textPosition === 'top'
      ? options.fontSize - options.textMargin
      : options.height + options.textMargin + options.fontSize;

  if (options.textAlign === 'left' || padding > 0) {
    x = 0;
    textAnchor = 'start';
  } else if (options.textAlign === 'right') {
    x = width - 1;
    textAnchor = 'end';
  } else {
    x = width / 2;
    textAnchor = 'middle';
  }

  return (
    <text
      x={x}
      y={y}
      fontSize={options.fontSize}
      fontWeight="bold"
      textAnchor={textAnchor}
      fill={options.lineColor}
    >
      {text}
    </text>
  );
};
