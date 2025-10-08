'use client';

import { useState, useMemo } from 'react';
import {
  TextField,
  Stack,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { TemplateKind } from '@prisma/client';
import { MycaPosApiClient } from 'api-generator/client';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { getCsrfToken } from 'next-auth/react';
import { CustomError } from '@/api/implement';
import CustomDialog from '@/components/dialogs/CustomDialog';

interface TemplateUploadModalProps {
  open: boolean;
  kind: TemplateKind | null;
  onClose: () => void;
  onUploaded: () => void;
}

export const TemplateUploadModal = ({
  open,
  kind,
  onClose,
  onUploaded,
}: TemplateUploadModalProps) => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();
  const [displayName, setDisplayName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // MycaPosApiClientインスタンスを作成
  const apiClient = useMemo(
    () =>
      new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      }),
    [],
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // ラベルプリンターの場合は.lbxファイルのみ許可
      if (kind === TemplateKind.LABEL_PRINTER && !file.name.endsWith('.lbx')) {
        setAlertState({
          message:
            'ラベルプリンターのテンプレートは.lbx形式のファイルを選択してください',
          severity: 'error',
        });
        return;
      }

      setSelectedFile(file);
      // ファイル名から表示名を自動設定する処理を削除
    }
  };

  const handleUpload = async () => {
    if (!store?.id || !selectedFile || !displayName.trim() || !kind) {
      setAlertState({
        message: 'ファイルとテンプレート名を入力してください',
        severity: 'error',
      });
      return;
    }

    setUploading(true);

    try {
      // CSRFトークンを取得
      const csrfToken = await getCsrfToken();

      // 1. ファイルをアップロード
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append(
        'kind',
        kind === TemplateKind.LABEL_PRINTER
          ? 'label-printer'
          : 'purchase-table',
      );

      const uploadResponse = await fetch(
        `/api/store/${store.id}/functions/upload-image/`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'X-CSRF-Token': csrfToken || '',
          },
        },
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({
          error: uploadResponse.statusText,
        }));
        const error = new CustomError(
          errorData.error || uploadResponse.statusText,
          uploadResponse.status,
        );
        throw error;
      }

      const uploadData = await uploadResponse.json();

      // レスポンス形式を確認して適切に処理
      let imageUrl;
      if (uploadData.data && uploadData.data.imageUrl) {
        imageUrl = uploadData.data.imageUrl;
      } else if (uploadData.imageUrl) {
        imageUrl = uploadData.imageUrl;
      } else {
        throw new Error('アップロードレスポンスの形式が不正です');
      }

      // 2. テンプレート情報を保存
      await apiClient.template.createTemplate({
        storeId: store.id,
        requestBody: {
          kind:
            kind === TemplateKind.LABEL_PRINTER
              ? 'LABEL_PRINTER'
              : 'PURCHASE_TABLE',
          display_name: displayName.trim(),
          url: imageUrl,
        },
      });

      setAlertState({
        message: 'テンプレートをアップロードしました',
        severity: 'success',
      });

      onUploaded();
      handleClose();
    } catch (error) {
      handleError(error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setDisplayName('');
    setSelectedFile(null);
    onClose();
  };

  const getAcceptTypes = () => {
    if (kind === TemplateKind.LABEL_PRINTER) {
      return '.lbx';
    }
    return 'image/*';
  };

  const getKindLabel = () => {
    return kind === TemplateKind.LABEL_PRINTER ? 'ラベル' : '買取表';
  };

  const actions = (
    <>
      <SecondaryButton onClick={handleClose} disabled={uploading}>
        キャンセル
      </SecondaryButton>
      <PrimaryButton
        onClick={handleUpload}
        disabled={!selectedFile || !displayName.trim() || uploading}
        loading={uploading}
      >
        {uploading ? <CircularProgress size={20} /> : 'アップロード'}
      </PrimaryButton>
    </>
  );

  return (
    <CustomDialog
      isOpen={open}
      onClose={handleClose}
      title="テンプレートアップロード"
      size="small"
      actions={actions}
    >
      <Stack spacing={3} sx={{ mt: 1 }}>
        <TextField
          label="テンプレート名"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="テンプレートの表示名を入力してください"
          disabled={uploading}
          fullWidth
        />
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {getKindLabel()}テンプレートファイルを選択してください
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            {selectedFile && (
              <Typography variant="body2" color="text.primary">
                {selectedFile.name}
              </Typography>
            )}
            <SecondaryButton
              component="label"
              disabled={uploading}
              sx={{ minWidth: 120 }}
            >
              ファイルを選択
              <input
                id="modal-file-input"
                type="file"
                accept={getAcceptTypes()}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </SecondaryButton>
          </Stack>
        </Box>
      </Stack>
    </CustomDialog>
  );
};
