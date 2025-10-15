import React from 'react';

type BackgroundProps = {
  width: number;
  height: number;
  color: string;
};

export const Background: React.FC<BackgroundProps> = ({
  width,
  height,
  color,
}) => <rect x={0} y={0} width={width} height={height} fill={color} />;
