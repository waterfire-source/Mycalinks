'use client';

import { useState, useRef, useMemo } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { MycaPosApiClient } from 'api-generator/client';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { AnnouncementList } from '@/app/auth/announcement/AnnouncementList';
import {
  AnnouncementFormModal,
  AnnouncementFormValues,
} from '@/app/auth/announcement/AnnouncementForm';
import AddIcon from '@mui/icons-material/Add';

export default function AnnouncementAdminPage() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const announcementListRef = useRef<{ fetchAnnouncements: () => void } | null>(
    null,
  );
  const { handleError } = useErrorAlert();

  // MycaPosApiClientインスタンスを作成
  const apiClient = useMemo(
    () =>
      new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      }),
    [],
  );

  const handleOpenFormModal = () => {
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    // モーダルが閉じられた時に一覧を再取得
    if (announcementListRef.current) {
      announcementListRef.current.fetchAnnouncements();
    }
  };

  const handleSubmit = async (values: AnnouncementFormValues) => {
    try {
      await apiClient.announcement.createOrUpdateAnnouncement({
        requestBody: {
          ...values,
          kind: values.kind as 'BUG' | 'UPDATE' | 'OTHER',
          status: values.status as 'UNPUBLISHED' | 'PUBLISHED' | 'DELETED',
        },
      });

      // 投稿完了後、AnnouncementListを再取得
      if (announcementListRef.current) {
        announcementListRef.current.fetchAnnouncements();
      }
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  return (
    <>
      <Stack
        sx={{
          backgroundColor: 'background.default',
          width: '100%',
          p: '24px',
          gap: '24px',
          height: 'calc(100vh - 64px)',
          justifyContent: 'space-between',
        }}
      >
        {/* ヘッダー部分 */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h1" component="h1" sx={{ fontWeight: 'bold' }}>
            お知らせ管理
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenFormModal}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            新規投稿
          </Button>
        </Stack>

        {/* お知らせ一覧 */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <AnnouncementList ref={announcementListRef} />
        </Box>
      </Stack>

      {/* お知らせ投稿・編集モーダル */}
      <AnnouncementFormModal
        open={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleSubmit}
      />
    </>
  );
}
