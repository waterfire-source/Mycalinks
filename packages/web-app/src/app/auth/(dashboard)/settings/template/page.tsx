'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { TemplateKind } from '@prisma/client';
import { MycaPosApiClient } from 'api-generator/client';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { TemplateList } from '@/app/auth/(dashboard)/settings/template/components/TemplateList';
import { TemplateUploadModal } from '@/app/auth/(dashboard)/settings/template/components/TemplateUploadModal';
import { DeleteConfirmModal } from '@/app/auth/(dashboard)/settings/template/components/DeleteConfirmModal';
import SecondaryButton from '@/components/buttons/SecondaryButton';

interface Template {
  id: number;
  store_id: number;
  kind: TemplateKind;
  display_name: string;
  url: string | null;
  created_at: string;
}

export default function TemplatePage() {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState<{
    open: boolean;
    kind: TemplateKind | null;
  }>({
    open: false,
    kind: null,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState<{
    open: boolean;
    template: Template | null;
  }>({
    open: false,
    template: null,
  });

  // MycaPosApiClientインスタンスを作成
  const apiClient = useMemo(
    () =>
      new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      }),
    [],
  );

  // テンプレート一覧を取得
  const fetchTemplates = useCallback(async () => {
    if (!store?.id) return;

    setLoading(true);
    try {
      const data = await apiClient.template.getTemplate({
        storeId: store.id,
      });

      // APIレスポンスをTemplateインターフェースに変換
      const convertedTemplates: Template[] = (data.templates || []).map(
        (template) => ({
          id: template.id,
          store_id: template.store_id,
          kind: template.kind,
          display_name: template.display_name,
          url: template.url,
          created_at: template.created_at || '',
        }),
      );

      setTemplates(convertedTemplates);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [store?.id, apiClient, handleError]);

  // テンプレートを削除
  const handleDeleteTemplate = async (templateId: number) => {
    if (!store?.id) return;

    try {
      await apiClient.template.deleteTemplate({
        storeId: store.id,
        templateId: templateId,
      });

      setAlertState({
        message: 'テンプレートを削除しました',
        severity: 'success',
      });

      // 一覧を再取得
      fetchTemplates();
      setDeleteModalOpen({ open: false, template: null });
    } catch (error) {
      handleError(error);
    }
  };

  // 削除モーダルを開く
  const handleDeleteClick = (template: Template) => {
    setDeleteModalOpen({ open: true, template });
  };

  // テンプレートアップロード後の処理
  const handleTemplateUploaded = () => {
    fetchTemplates();
  };

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const labelTemplates = templates.filter(
    (t) => t.kind === TemplateKind.LABEL_PRINTER,
  );
  const purchaseTableTemplates = templates.filter(
    (t) => t.kind === TemplateKind.PURCHASE_TABLE,
  );

  return (
    <ContainerLayout title="テンプレート一覧">
      <Box sx={{ mr: 5 }}>
        <Stack spacing={4}>
          {/* ラベルテンプレート */}
          <Box>
            <Typography variant="h4">ラベルテンプレート</Typography>
            <Box
              sx={{
                bgcolor: 'white',
                mt: 2,
                p: 0.2,
                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
                borderRadius: '4px',
              }}
            >
              <Box sx={{ m: 2 }}>
                <TemplateList
                  templates={labelTemplates}
                  onDelete={handleDeleteClick}
                  loading={loading}
                />

                <Box sx={{ mt: 3 }}>
                  <SecondaryButton
                    onClick={() =>
                      setUploadModalOpen({
                        open: true,
                        kind: TemplateKind.LABEL_PRINTER,
                      })
                    }
                  >
                    テンプレートアップロード
                  </SecondaryButton>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* 買取表テンプレート */}
          <Box>
            <Typography variant="h4">買取表テンプレート</Typography>
            <Box
              sx={{
                bgcolor: 'white',
                mt: 2,
                p: 0.2,
                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
                borderRadius: '4px',
              }}
            >
              <Box sx={{ m: 2 }}>
                <TemplateList
                  templates={purchaseTableTemplates}
                  onDelete={handleDeleteClick}
                  loading={loading}
                />

                <Box sx={{ mt: 3 }}>
                  <SecondaryButton
                    onClick={() =>
                      setUploadModalOpen({
                        open: true,
                        kind: TemplateKind.PURCHASE_TABLE,
                      })
                    }
                  >
                    テンプレートアップロード
                  </SecondaryButton>
                </Box>
              </Box>
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* アップロードモーダル */}
      <TemplateUploadModal
        open={uploadModalOpen.open}
        kind={uploadModalOpen.kind}
        onClose={() => setUploadModalOpen({ open: false, kind: null })}
        onUploaded={handleTemplateUploaded}
      />

      {/* 削除確認モーダル */}
      <DeleteConfirmModal
        open={deleteModalOpen.open}
        template={deleteModalOpen.template}
        onClose={() => setDeleteModalOpen({ open: false, template: null })}
        onConfirm={handleDeleteTemplate}
      />
    </ContainerLayout>
  );
}
