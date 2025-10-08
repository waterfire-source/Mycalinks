'use client';

import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';
import { EC_EXTERNAL_PATH, PATH } from '@/app/ec/(core)/constants/paths';
import { openExternalUrl } from '@/app/ec/(core)/utils/browserUtils';
import { useDevice } from '@/app/ec/(core)/contexts/DeviceContext';
import { useAppAuth } from '@/providers/useAppAuth';

interface AccountMenuProps {
  open: boolean;
  onClose: () => void;
}

export const AccountMenu: React.FC<AccountMenuProps> = ({ open, onClose }) => {
  const router = useRouter();
  const { isWebView } = useDevice();
  const { signOut, getUserId } = useAppAuth();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const menuItems = [
    { text: '注文履歴', path: PATH.ORDER.history.root, external: false },
    //{ text: 'お支払い方法', path: PATH.PAYMENT_METHODS, external: false }, // 初回リリースから除く
    //{ text: 'お届け先一覧', path: PATH.ADDRESSES, external: false }, // 初回リリースから除く
    {
      text: 'メッセージセンター',
      path: PATH.MESSAGE_CENTER.root,
      external: false,
    },
    {
      text: '状態の表記について',
      path: EC_EXTERNAL_PATH.condition,
      external: true,
    },
    {
      text: 'MycalinksMallの使い方',
      path: EC_EXTERNAL_PATH.help,
      external: true,
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleLogin = () => {
    router.push(PATH.LOGIN);
    onClose();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (error) {
      console.error('Sign out failed:', error);
      // エラーが発生してもリロードする
      window.location.reload();
    }
    onClose();
  };

  // ログイン状態をチェック
  useEffect(() => {
    const checkAuth = async () => {
      const userId = await getUserId();
      setIsLoggedIn(!!userId);
    };

    if (open) {
      checkAuth();
    }
  }, [open, getUserId]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 250,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
        role="presentation"
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h4" component="div">
            アカウントメニュー
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() =>
                    item.external
                      ? openExternalUrl(item.path)
                      : handleNavigation(item.path)
                  }
                >
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}

          {!isWebView && (
            <React.Fragment>
              <Divider />
              <ListItem disablePadding>
                {isLoggedIn ? (
                  <ListItemButton
                    onClick={handleSignOut}
                    sx={{ color: 'error.main' }}
                  >
                    <ListItemText primary="ログアウト" />
                  </ListItemButton>
                ) : (
                  <ListItemButton
                    onClick={handleLogin}
                    sx={{ color: 'primary.main' }}
                  >
                    <ListItemText primary="ログイン" />
                  </ListItemButton>
                )}
              </ListItem>
            </React.Fragment>
          )}
        </List>
      </Box>
      <Box sx={{ p: 2 }}>
        {[
          {
            label: '特定商取引法に基づく表示',
            path: EC_EXTERNAL_PATH.specialCommercialLaw,
          },
          {
            label: 'プライバシーポリシー',
            path: EC_EXTERNAL_PATH.privacyPolicy,
          },
          {
            label: 'ガイドライン',
            path: EC_EXTERNAL_PATH.guideline,
          },
          {
            label: '利用規約',
            path: EC_EXTERNAL_PATH.terms,
          },
        ].map((item) => (
          <Typography
            key={item.label}
            variant="body2"
            component="div"
            onClick={() => openExternalUrl(item.path)}
            sx={{
              cursor: 'pointer',
              color: 'primary.main',
              textDecoration: 'underline',
              mt: 1,
              '&:hover': {
                opacity: 0.7,
              },
            }}
          >
            {item.label}
          </Typography>
        ))}
      </Box>
    </Drawer>
  );
};
