'use client';

import React from 'react';
import { Menu, MenuItem, Typography, Box, Grid, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import { GenreMenuConfig } from '@/app/ec/(core)/constants/genreMenus';

interface GenreDropdownMenuProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  menuConfig: GenreMenuConfig | null;
}

export const GenreDropdownMenu = ({
  open,
  anchorEl,
  onClose,
  menuConfig,
}: GenreDropdownMenuProps) => {
  const router = useRouter();

  const handleMenuItemClick = (link: string) => {
    router.push(link);
    onClose();
  };

  if (!menuConfig) {
    return null;
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          minWidth: '600px',
          maxWidth: '800px',
          mt: 1,
          borderRadius: 2,
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
        },
      }}
      transformOrigin={{ horizontal: 'left', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
    >
      <Box sx={{ p: 1.5 }}>
        {/* ジャンル名ヘッダー */}
        <Typography
          variant="subtitle2"
          fontWeight="600"
          sx={{
            mb: 1.5,
            ml: 1,
            color: 'primary.main',
            textAlign: 'start',
          }}
        >
          {menuConfig.genreName}
        </Typography>

        {/* セクション一覧 */}
        <Grid container spacing={2}>
          {menuConfig.sections.map((section, sectionIndex) => (
            <Grid item xs={12} sm={6} key={sectionIndex}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  bgcolor: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.light',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                }}
              >
                {/* セクションタイトル */}
                <Typography
                  variant="subtitle2"
                  fontWeight="600"
                  sx={{
                    mb: 1,
                    color: 'text.primary',
                    fontSize: '0.9rem',
                    letterSpacing: '0.3px',
                  }}
                >
                  {section.title}
                </Typography>

                {/* セクション画像（オプション） */}
                {section.sectionImage && (
                  <Box
                    component="img"
                    src={section.sectionImage}
                    alt={section.title}
                    sx={{
                      width: '100%',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: 2,
                      mb: 1,
                    }}
                  />
                )}

                {/* メニューアイテム一覧 */}
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}
                >
                  {section.items.map((item) => (
                    <MenuItem
                      key={item.id}
                      onClick={() => handleMenuItemClick(item.link)}
                      sx={{
                        borderRadius: 2,
                        py: 0.7,
                        px: 1,
                        minHeight: 'auto',
                        transition: 'all 0.15s ease-in-out',
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          transform: 'scale(1.02)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.8,
                          width: '100%',
                        }}
                      >
                        {/* アイテムアイコン（オプション） */}
                        {item.icon && (
                          <Box
                            component="img"
                            src={item.icon}
                            alt={item.label}
                            sx={{ width: 20, height: 20, objectFit: 'contain' }}
                          />
                        )}

                        {/* アイテムラベル */}
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.85rem',
                            fontWeight: '500',
                          }}
                        >
                          {item.label}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Menu>
  );
};
