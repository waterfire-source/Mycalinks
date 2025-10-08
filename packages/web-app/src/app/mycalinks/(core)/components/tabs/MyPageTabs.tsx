'use client';

import React, { useState } from 'react';
import { Box, Tabs } from '@mui/material';
import { CustomTabTableStyle } from '@/components/tabs/CustomTabTableStyle';

interface MyPageTabsProps {
  onTabChange: (newValue: number) => void;
}

export const MyPageTabs: React.FC<MyPageTabsProps> = ({ onTabChange }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    onTabChange(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': {
              display: 'none',
            },
            '& .MuiTabs-flexContainer': {
              width: '100%',
            },
          }}
        >
          <CustomTabTableStyle label="メニュー" value={0} />
          <CustomTabTableStyle label="購・買履歴" value={1} />
          <CustomTabTableStyle label="設定" value={2} />
        </Tabs>
      </Box>
      {/* 赤いボーダーライン */}
      <Box
        sx={{
          width: '100%',
          height: '8px',
          backgroundColor: 'primary.main',
          marginTop: '-16px', // タブの隙間
        }}
      />
    </Box>
  );
};
