import React from 'react';
import Image from 'next/image';

export const DangerousIcon: React.FC<{
  width: number;
  height: number;
  style?: React.CSSProperties;
}> = ({ width, height, style }) => {
  return (
    <>
      <Image
        src="/images/dangerous_icon.png"
        alt="Dangerous icon"
        width={width}
        height={height}
        style={{
          ...style,
        }}
      />
    </>
  );
};
