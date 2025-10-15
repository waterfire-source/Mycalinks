import { useState, useEffect, useMemo } from 'react';
import { IconButton, Badge } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { MycaPosApiClient } from 'api-generator/client';
import { AnnouncementModal } from '@/feature/announcementModal/AnnouncementModal';
import { useStore } from '@/contexts/StoreContext';

export const HeaderAnnouncementButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { store } = useStore();

  // MycaPosApiClientインスタンスを作成
  const apiClient = useMemo(
    () =>
      new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      }),
    [],
  );

  const fetchUnreadCount = async () => {
    if (!store?.id) return;
    try {
      const data = await apiClient.announcement.getAnnouncement({
        storeId: store.id,
        onlyUnread: true,
      });
      setUnreadCount(data.announcements?.length || 0);
    } catch (e) {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [store?.id]);

  // モーダルが閉じられた時に未読件数を再取得
  const handleClose = () => {
    setIsOpen(false);
    fetchUnreadCount();
  };

  return (
    <>
      <IconButton onClick={() => setIsOpen(true)} size="large">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>
      <AnnouncementModal open={isOpen} onClose={handleClose} />
    </>
  );
};
