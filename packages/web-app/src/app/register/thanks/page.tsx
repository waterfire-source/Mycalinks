'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  Stack,
  Button,
} from '@mui/material';
import Image from 'next/image';
import { PATH } from '@/constants/paths';

const ThanksPage = () => {
  const [email, setEmail] = useState('');

  // URLパラメータからemailを取得
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const handleCorporationSetup = () => {
    // CORPORATION_LOGINにemailパラメータ付きで遷移
    window.location.href = `${
      PATH.CORPORATION_LOGIN
    }?email=${encodeURIComponent(email)}`;
  };

  return (
    <Box>
      <AppBar position="fixed" color="default" elevation={2}>
        <Toolbar>
          <Box width={140}>
            <Image
              src="/images/logo/posLogo.png"
              alt="MycalinksPos Logo"
              width={140}
              height={40}
              priority
              style={{ objectFit: 'contain' }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ pt: 10, pb: 2 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Stack alignItems="center" flexDirection="column" gap={2}>
            <Box width={160} mx="auto">
              <Image
                src="/images/logo/posLogo.png"
                alt="MycalinksPos Logo"
                width={160}
                height={45}
                priority
                style={{ objectFit: 'contain' }}
              />
            </Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="grey.800"
              align="center"
            >
              利用登録ありがとうございました。
            </Typography>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="grey.800"
              align="center"
            >
              今後の流れについては担当者よりご連絡させていただきます。
            </Typography>

            {email && (
              <Stack alignItems="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCorporationSetup}
                  sx={{ minWidth: 200 }}
                >
                  法人設定に進む
                </Button>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default ThanksPage;
