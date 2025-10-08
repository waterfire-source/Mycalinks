'use client';

import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
  Typography,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { MycaPosApiClient } from 'api-generator/client';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import dayjs from 'dayjs';
import {
  AnnouncementFormValues,
  AnnouncementFormModal,
} from '@/app/auth/announcement/AnnouncementForm';
import { useStore } from '@/contexts/StoreContext';

interface Announcement {
  id: number;
  title: string;
  target_day: string;
  publish_at: string;
  url?: string;
  kind: string;
  status?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  BUG: '不具合',
  UPDATE: 'アップデート',
  // PLAN: '開発予定',　今後実装予定
  OTHER: 'その他',
};

export interface AnnouncementListRef {
  fetchAnnouncements: () => void;
}

export const AnnouncementList = forwardRef<AnnouncementListRef>(
  (props, ref) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<
      AnnouncementFormValues | undefined
    >(undefined);
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
      if (!store?.id) return;

      setLoading(true);
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
          target_day: announcement.target_day || '',
          publish_at: announcement.publish_at || '',
          url: announcement.url || undefined,
          kind: announcement.kind,
          status: announcement.status,
        }));

        setAnnouncements(convertedAnnouncements);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };

    // 外部からfetchAnnouncementsメソッドにアクセスできるようにする
    useImperativeHandle(ref, () => ({
      fetchAnnouncements,
    }));

    useEffect(() => {
      fetchAnnouncements();
    }, [store?.id]);

    const handleEdit = (a: Announcement) => {
      const formValues: AnnouncementFormValues = {
        id: a.id,
        title: a.title,
        target_day: a.target_day,
        publish_at: dayjs(a.publish_at).format('YYYY-MM-DD'),
        url: a.url || '',
        kind: a.kind,
        status: a.status,
      };
      setEditingAnnouncement(formValues);
      setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
      setIsEditModalOpen(false);
      setEditingAnnouncement(undefined);
      fetchAnnouncements();
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

        // 更新完了後、お知らせ一覧を再取得
        fetchAnnouncements();
      } catch (error) {
        handleError(error);
        throw error;
      }
    };

    const handleDelete = async (id: number) => {
      try {
        await apiClient.announcement.deleteAnnouncement({
          announcementId: id,
        });

        // 削除完了後、お知らせ一覧を再取得
        fetchAnnouncements();
      } catch (error) {
        handleError(error);
        throw error;
      }
    };

    if (loading) {
      return <Typography>読み込み中...</Typography>;
    }

    return (
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          お知らせ一覧
        </Typography>

        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>カテゴリ</TableCell>
                <TableCell>タイトル</TableCell>
                <TableCell>対象日</TableCell>
                <TableCell>公開日</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>ステータス</TableCell>
                <TableCell>編集</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {announcements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell>
                    <Chip
                      label={CATEGORY_LABELS[announcement.kind]}
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
                  <TableCell>{announcement.title}</TableCell>
                  <TableCell>
                    {dayjs(announcement.target_day).format('YYYY/MM/DD')}
                  </TableCell>
                  <TableCell>
                    {dayjs(announcement.publish_at).format('YYYY/MM/DD')}
                  </TableCell>
                  <TableCell>
                    {announcement.url ? (
                      <a
                        href={announcement.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: 'inherit',
                          textDecoration: 'underline',
                          fontSize: '0.875rem',
                        }}
                      >
                        {announcement.url}
                      </a>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        announcement.status === 'PUBLISHED' ? '公開' : '非公開'
                      }
                      size="small"
                      color={
                        announcement.status === 'PUBLISHED'
                          ? 'success'
                          : 'error'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEdit(announcement)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <AnnouncementFormModal
          open={isEditModalOpen}
          onClose={handleCloseModal}
          initialValues={editingAnnouncement}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      </Stack>
    );
  },
);

AnnouncementList.displayName = 'AnnouncementList';
