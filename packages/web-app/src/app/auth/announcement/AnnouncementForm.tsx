'use client';

import { useState } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Stack,
  InputLabel,
  Select,
  FormControl,
  Alert,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import dayjs from 'dayjs';

const CATEGORY_OPTIONS = [
  { value: 'BUG', label: '不具合' },
  { value: 'UPDATE', label: 'アップデート' },
  // { value: 'PLAN', label: '開発予定' },今後実装予定
  { value: 'OTHER', label: 'その他' },
];

export type AnnouncementFormValues = {
  id?: number;
  title: string;
  target_day: string;
  publish_at: string;
  url: string;
  kind: string;
  status?: string;
};

interface AnnouncementFormModalProps {
  open: boolean;
  onClose: () => void;
  initialValues?: AnnouncementFormValues;
  onSubmit?: (values: AnnouncementFormValues) => void;
  onDelete?: (id: number) => void;
}

export function AnnouncementForm({
  initialValues,
  onSubmit,
  onDelete,
  showSuccessMessage = true,
}: {
  initialValues?: AnnouncementFormValues;
  onSubmit?: (values: AnnouncementFormValues) => void;
  onDelete?: (id: number) => void;
  showSuccessMessage?: boolean;
} = {}) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [targetDay, setTargetDay] = useState(
    initialValues?.target_day
      ? dayjs(initialValues.target_day).format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD'),
  );
  const [publishAt, setPublishAt] = useState(
    initialValues?.publish_at
      ? dayjs(initialValues.publish_at).format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD'),
  );
  const [url, setUrl] = useState(initialValues?.url || '');
  const [kind, setKind] = useState(
    initialValues?.kind || CATEGORY_OPTIONS[0].value,
  );
  const [isPublished, setIsPublished] = useState(
    initialValues?.status === 'PUBLISHED' ? true : true, // 新規投稿時はデフォルトで公開
  );
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const { handleError } = useErrorAlert();

  // 公開設定が変更された時の処理
  const handlePublishedChange = (checked: boolean) => {
    setIsPublished(checked);
    // 非公開から公開に変更した場合、今日の日付を設定
    if (checked && initialValues?.status !== 'PUBLISHED') {
      setPublishAt(dayjs().format('YYYY-MM-DD'));
    }
  };

  const resetForm = () => {
    setTitle('');
    setTargetDay(dayjs().format('YYYY-MM-DD'));
    setPublishAt(dayjs().format('YYYY-MM-DD'));
    setUrl('');
    setKind(CATEGORY_OPTIONS[0].value);
    setIsPublished(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 日付文字列を明示的にUTCとして扱い、ISO-8601 DateTime形式に変換
      const dateTimeTargetDay = dayjs.utc(targetDay).toISOString();
      const dateTimePublishAt = dayjs.utc(publishAt).toISOString();

      const requestStatus = () => {
        if (initialValues?.id) {
          // 編集時は公開設定をそのまま反映
          return isPublished ? 'PUBLISHED' : 'UNPUBLISHED';
        } else {
          // 新規作成時は公開日が未来の日付ならstatusをUNPUBLISHEDにする
          return dayjs(publishAt).isAfter(dayjs())
            ? 'UNPUBLISHED'
            : 'PUBLISHED';
        }
      };

      const values: AnnouncementFormValues = {
        ...(initialValues?.id && { id: initialValues.id }), // 編集時のみidを含める
        title,
        target_day: dateTimeTargetDay,
        publish_at: dateTimePublishAt,
        url,
        kind,
        // 新規作成時は公開日が未来の日付ならstatusをUNPUBLISHEDにする
        status: requestStatus(),
      };

      if (onSubmit) {
        await onSubmit(values);
        // showSuccessMessageがtrueの場合のみ成功メッセージを表示（直接フォーム使用時）
        if (showSuccessMessage) {
          setMessage({ type: 'success', text: '更新しました' });
        }
      } else {
        handleError(new Error('更新できませんでした'));
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!initialValues?.id) return;

    setDeleteLoading(true);
    try {
      if (onDelete) {
        await onDelete(initialValues.id);
        // showSuccessMessageがtrueの場合のみ成功メッセージを表示（直接フォーム使用時）
        if (showSuccessMessage) {
          setMessage({ type: 'success', text: '削除しました' });
        }
      } else {
        handleError(new Error('削除できませんでした'));
      }
    } catch (error) {
      handleError(error);
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {message && (
            <Alert severity={message.type} onClose={() => setMessage(null)}>
              {message.text}
            </Alert>
          )}

          <TextField
            label="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            size="small"
            InputLabelProps={{
              style: { color: 'black' },
            }}
          />

          <TextField
            label="対象日"
            type="date"
            value={targetDay}
            onChange={(e) => setTargetDay(e.target.value)}
            InputLabelProps={{
              shrink: true,
              style: { color: 'black' },
            }}
            required
            fullWidth
            size="small"
          />

          <TextField
            label="公開日"
            type="date"
            value={publishAt}
            onChange={(e) => setPublishAt(e.target.value)}
            InputLabelProps={{
              shrink: true,
              style: { color: 'black' },
            }}
            required
            fullWidth
            size="small"
            disabled={
              !!initialValues?.id && initialValues.status === 'PUBLISHED'
            }
          />

          <TextField
            label="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            fullWidth
            size="small"
            InputLabelProps={{
              style: { color: 'black' },
            }}
          />

          <FormControl fullWidth size="small">
            <InputLabel id="kind-label" sx={{ color: 'black' }}>
              カテゴリ
            </InputLabel>
            <Select
              labelId="kind-label"
              value={kind}
              label="カテゴリ"
              onChange={(e) => setKind(e.target.value)}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 編集時のみ公開設定を表示 */}
          {initialValues && (
            <Box
              sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}
            >
              <Typography variant="subtitle2" gutterBottom>
                公開設定
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPublished}
                    onChange={(e) => handlePublishedChange(e.target.checked)}
                    color="primary"
                  />
                }
                label={isPublished ? '公開' : '非公開'}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mt: 1 }}
              >
                {isPublished
                  ? 'このお知らせはユーザーに表示されます'
                  : 'このお知らせはユーザーに表示されません'}
              </Typography>
            </Box>
          )}

          <Stack direction="row" spacing={2}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ flex: 1 }}
            >
              {loading ? '処理中...' : initialValues ? '更新' : '投稿'}
            </Button>

            {initialValues?.id && (
              <Button
                type="button"
                variant="outlined"
                color="error"
                onClick={handleDeleteClick}
                disabled={deleteLoading}
                sx={{ minWidth: '100px' }}
              >
                {deleteLoading ? '削除中...' : '削除'}
              </Button>
            )}
          </Stack>
        </Stack>
      </form>

      {/* 削除確認モーダル */}
      <Dialog
        open={showDeleteConfirm}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>削除の確認</DialogTitle>
        <DialogContent>
          <Typography>
            このお知らせ「{initialValues?.title}」を削除しますか？
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            この操作は取り消すことができません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
            キャンセル
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? '削除中...' : '削除'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function AnnouncementFormModal({
  open,
  onClose,
  initialValues,
  onSubmit,
  onDelete,
}: AnnouncementFormModalProps) {
  const { handleError } = useErrorAlert();
  const handleSubmit = async (values: AnnouncementFormValues) => {
    try {
      if (onSubmit) {
        await onSubmit(values);
      } else {
        handleError(new Error('更新できませんでした'));
        return;
      }
      onClose();
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (onDelete) {
        await onDelete(id);
      } else {
        handleError(new Error('削除できませんでした'));
        return;
      }
      onClose();
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  return (
    <CustomModalWithHeader
      open={open}
      onClose={onClose}
      title={initialValues ? 'お知らせ詳細・編集' : 'お知らせ投稿'}
      width="600px"
      height="auto"
    >
      <AnnouncementForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        showSuccessMessage={false}
      />
    </CustomModalWithHeader>
  );
}
