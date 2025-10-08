'use client';

import React from 'react';
import { Fab, Menu, MenuItem, Typography, Box, Chip } from '@mui/material';
import {
  Settings as SettingsIcon,
  Smartphone as SmartphoneIcon,
  Computer as ComputerIcon,
  AutoAwesome as AutoIcon,
} from '@mui/icons-material';
import { useDevice, ViewMode } from '@/app/ec/(core)/contexts/DeviceContext';

export const ViewModeSwitcher = () => {
  const { viewMode, setViewMode, actualDeviceType, deviceType } = useDevice();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    handleClose();
  };

  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case 'mobile':
        return <SmartphoneIcon />;
      case 'desktop':
        return <ComputerIcon />;
      case 'auto':
        return <AutoIcon />;
    }
  };

  const getViewModeLabel = (mode: ViewMode) => {
    switch (mode) {
      case 'mobile':
        return 'モバイル表示';
      case 'desktop':
        return 'デスクトップ表示';
      case 'auto':
        return '自動判定';
    }
  };

  // 開発環境でのみ表示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <Fab
        color="secondary"
        aria-label="view mode switcher"
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 1300,
          width: 48,
          height: 48,
        }}
      >
        <SettingsIcon />
      </Fab>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        PaperProps={{
          sx: {
            minWidth: 280,
            p: 1,
          },
        }}
      >
        <Box sx={{ p: 1, borderBottom: '1px solid #e0e0e0', mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            デバッグ用表示切替
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              label={`実際のデバイス: ${
                actualDeviceType === 'desktop' ? 'PC' : 'モバイル'
              }`}
              color="info"
            />
            <Chip
              size="small"
              label={`表示: ${deviceType === 'desktop' ? 'PC' : 'モバイル'}`}
              color="primary"
            />
          </Box>
        </Box>

        {(['auto', 'desktop', 'mobile'] as ViewMode[]).map((mode) => (
          <MenuItem
            key={mode}
            onClick={() => handleViewModeChange(mode)}
            selected={viewMode === mode}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {getViewModeIcon(mode)}
              <Typography>{getViewModeLabel(mode)}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
