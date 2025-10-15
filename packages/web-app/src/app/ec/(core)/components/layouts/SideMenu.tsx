'use client';

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { MycaAppGenre } from 'backend-core';
import Link from 'next/link';
import Image from 'next/image';
import { PATH } from '@/app/ec/(core)/constants/paths';
import { EcSessionStorageManager } from '@/app/ec/(core)/utils/sessionStorage';

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
  menuItems: MycaAppGenre[];
}

export const SideMenu = ({ open, onClose, menuItems }: SideMenuProps) => {
  const handleClick = () => {
    // SessionStorageをクリア（新しいジャンルに移動するため）
    EcSessionStorageManager.clear();
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: '85%',
          maxWidth: '360px',
          boxSizing: 'border-box',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        }}
      >
        <Link
          href={PATH.TOP}
          style={{ textDecoration: 'none', color: 'inherit' }}
          onClick={handleClick}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <Box sx={{ position: 'relative', height: 40, width: 120, ml: 1 }}>
              <Image
                src="/images/ec/Mycalinks_Mall_logo.png"
                alt="mycalinks logo"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </Box>
          </Box>
        </Link>
        <IconButton onClick={onClose} edge="end" aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>

      <List
        sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}
        component="nav"
      >
        {menuItems.map((item) => (
          <React.Fragment key={item.id}>
            <ListItem disablePadding divider>
              <Link
                // デフォルトでは在庫のある商品のみ表示
                href={`${PATH.ITEMS.genre(
                  String(item.id),
                )}?hasStock=true&orderBy=-actual_ec_sell_price`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  width: '100%',
                }}
                onClick={handleClick}
              >
                <ListItemButton component="div">
                  <ListItemIcon sx={{ minWidth: 42 }}>
                    <Box sx={{ position: 'relative', width: 28, height: 28 }}>
                      <Image
                        src={
                          item.single_genre_image || '/images/ec/noimage.png'
                        }
                        alt={item.display_name}
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </Box>
                  </ListItemIcon>
                  <ListItemText primary={item.display_name} />
                </ListItemButton>
              </Link>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};
