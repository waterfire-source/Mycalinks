import React from 'react';

export type BarcodeChunkOptions = {
  textPosition: 'top' | 'bottom';
  fontSize: number;
  textMargin: number;
  width: number;
  height: number;
};

type BarcodeChunkProps = {
  binary: string;
  padding: number;
  options: BarcodeChunkOptions;
};

export const BarcodeChunk: React.FC<BarcodeChunkProps> = ({
  binary,
  padding,
  options,
}) => {
  const yFrom =
    options.textPosition === 'top' ? options.fontSize + options.textMargin : 0;

  let barWidth = 0;
  let x = 0;
  const bars: { x: number; y: number; width: number; height: number }[] = [];

  for (let b = 0; b < binary.length; b++) {
    x = b * options.width + padding;

    if (binary[b] === '1') {
      barWidth++;
    } else if (barWidth > 0) {
      bars.push({
        x: x - options.width * barWidth,
        y: yFrom,
        width: options.width * barWidth,
        height: options.height,
      });
      barWidth = 0;
    }
  }

  if (barWidth > 0) {
    bars.push({
      x: x - options.width * (barWidth - 1),
      y: yFrom,
      width: options.width * barWidth,
      height: options.height,
    });
  }

  return (
    <>
      {bars.map((bar, i) => (
        <rect
          key={i}
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
        />
      ))}
    </>
  );
};
