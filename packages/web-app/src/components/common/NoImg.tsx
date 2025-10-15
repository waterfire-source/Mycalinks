import React from 'react';
import { Typography } from '@mui/material';

interface NoImgProps {
  width?: string | number;
  height?: string | number;
}

const NoImg: React.FC<NoImgProps> = ({ width = 53, height = 75 }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        width,
        height,
        aspectRatio: 0.71,
        marginBottom: '2%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #ccc',
        borderRadius: 4,
        backgroundColor: '#f0f0f0',
      }}
    >
      <Typography fontSize={8}>
        NO <br />
        IMG
      </Typography>
    </div>
  </div>
);

export default NoImg;
