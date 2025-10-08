'use client';

import { useState, useEffect, useMemo } from 'react';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { MycaPosApiClient } from 'api-generator/client';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { useStore } from '@/contexts/StoreContext';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);

interface Announcement {
  id: number;
  title: string;
  url?: string;
  target_day: string;
  publish_at: string;
  kind: string;
  read?: boolean;
  status?: string;
}

interface AnnouncementModalProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_TABS = [
  { value: 'ALL', label: 'すべて' },
  { value: 'BUG', label: '不具合' },
  { value: 'UPDATE', label: 'アップデート' },
  // { value: 'PLAN', label: '開発予定' },今後実装予定
  { value: 'OTHER', label: 'その他' },
];

function getKindLabel(kind: string) {
  switch (kind) {
    case 'BUG':
      return '不具合';
    case 'UPDATE':
      return 'アップデート';
    // case 'PLAN':
    //   return '開発予定'; // 今後実装予定
    case 'OTHER':
      return 'その他';
    default:
      return kind;
  }
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  open,
  onClose,
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [tab, setTab] = useState('ALL');
  const { store } = useStore();
  const { handleError } = useErrorAlert();

  // MycaPosApiClientインスタンスを作成
  const apiClient = useMemo(
    () =>
      new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      }),
    [],
  );

  const fetchAnnouncements = async () => {
    if (!store?.id) {
      setError('ストア情報が取得できません');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.announcement.getAnnouncement({
        storeId: store.id,
      });

      // APIレスポンスをAnnouncementインターフェースに変換
      const convertedAnnouncements: Announcement[] = (
        data.announcements || []
      ).map((announcement) => ({
        id: announcement.id,
        title: announcement.title || '',
        url: announcement.url || undefined,
        target_day: announcement.target_day || '',
        publish_at: announcement.publish_at || '',
        kind: announcement.kind,
        read: announcement.read,
        status: announcement.status,
      }));

      setAnnouncements(convertedAnnouncements);
    } catch (error) {
      handleError(error);
      // エラー状態を表示するために空配列を設定
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAnnouncements();
    }
  }, [open, store?.id]);

  // モーダルを閉じたとき、未読のお知らせを一括で既読にする
  const handleModalClose = async () => {
    if (store?.id) {
      const unreadIds = announcements.filter((a) => !a.read).map((a) => a.id);
      if (unreadIds.length > 0) {
        try {
          await Promise.all(
            unreadIds.map((id) =>
              apiClient.announcement.readAnnouncement({
                storeId: store.id,
                announcementId: id,
              }),
            ),
          );
          await fetchAnnouncements();
        } catch (error) {
          handleError(error);
        }
      }
    }
    onClose();
  };

  // 今日までの日付かつ非公開でないものだけを表示
  const filteredAnnouncements = useMemo(() => {
    const today = dayjs().endOf('day');
    return announcements
      .filter(
        (a) =>
          dayjs(a.target_day).isSameOrBefore(today, 'day') &&
          a.status !== 'UNPUBLISHED',
      )
      .filter((a) => (tab === 'ALL' ? true : a.kind === tab));
  }, [announcements, tab]);

  // 年月ごとにグループ化
  const groupedByYearMonth = useMemo(() => {
    const groups: { [key: string]: Announcement[] } = {};
    filteredAnnouncements.forEach((a) => {
      const ym = dayjs(a.target_day).format('YYYY年M月');
      if (!groups[ym]) groups[ym] = [];
      groups[ym].push(a);
    });
    // 新しい年月順にソート
    return Object.entries(groups).sort((a, b) =>
      dayjs(b[0], 'YYYY年M月').isAfter(dayjs(a[0], 'YYYY年M月')) ? 1 : -1,
    );
  }, [filteredAnnouncements]);

  return (
    <>
      <CustomModalWithHeader
        open={open}
        onClose={handleModalClose}
        title="お知らせ"
        width="800px"
        height="600px"
      >
        <Box sx={{ p: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            {CATEGORY_TABS.map((cat) => (
              <Tab
                key={cat.value}
                value={cat.value}
                label={cat.label}
                sx={{
                  fontWeight: tab === cat.value ? 'bold' : 'normal',
                  color: tab === cat.value ? 'inherit' : 'black',
                }}
              />
            ))}
          </Tabs>

          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'auto',
              background: '#fff',
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
              boxShadow: 1,
              p: 0,
              mt: 0,
              minHeight: 400,
              maxHeight: 500,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {loading ? (
              <Typography sx={{ p: 4, textAlign: 'center' }}>
                読み込み中...
              </Typography>
            ) : error ? (
              <Alert severity="error" sx={{ m: 4 }}>
                {error}
              </Alert>
            ) : groupedByYearMonth.length === 0 ? (
              <Typography sx={{ p: 4, textAlign: 'center' }}>
                お知らせはありません
              </Typography>
            ) : (
              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: 0,
                  borderRadius: 2,
                  m: 0,
                  width: '100%',
                  maxHeight: 420,
                }}
              >
                <Table size="small">
                  <TableBody>
                    {filteredAnnouncements.map((announcement) => (
                      <TableRow
                        key={announcement.id}
                        hover
                        sx={{
                          cursor: announcement.url ? 'pointer' : 'default',
                        }}
                      >
                        <TableCell
                          sx={{ backgroundColor: 'inherit!important' }}
                        >
                          {dayjs(announcement.target_day).format('YYYY/MM/DD')}
                        </TableCell>
                        <TableCell
                          sx={{ backgroundColor: 'inherit!important' }}
                        >
                          <Chip
                            label={getKindLabel(announcement.kind)}
                            size="small"
                            color={
                              announcement.kind === 'BUG'
                                ? 'error'
                                : announcement.kind === 'UPDATE'
                                ? 'info'
                                : 'success'
                            }
                          />
                        </TableCell>
                        <TableCell
                          sx={{ backgroundColor: 'inherit!important' }}
                        >
                          {announcement.url ? (
                            <a
                              href={announcement.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: '#1976d2',
                                textDecoration: 'underline',
                                fontWeight: 'bold',
                                wordBreak: 'break-all',
                              }}
                            >
                              {announcement.title}
                            </a>
                          ) : (
                            announcement.title
                          )}
                          {announcement.read !== true && (
                            <Chip
                              label="NEW"
                              color="warning"
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>
      </CustomModalWithHeader>
    </>
  );
};
