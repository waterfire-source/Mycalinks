'use client';

import { useState } from 'react';
import { TemplateKind } from '@prisma/client';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';

interface Template {
  id: number;
  store_id: number;
  kind: TemplateKind;
  display_name: string;
  url: string | null;
  created_at: string;
}

interface DeleteConfirmModalProps {
  open: boolean;
  template: Template | null;
  onClose: () => void;
  onConfirm: (templateId: number) => void;
}

export const DeleteConfirmModal = ({
  open,
  template,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) => {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!template) return;

    setDeleting(true);
    await onConfirm(template.id);
    setDeleting(false);
  };

  const handleClose = () => {
    if (!deleting) {
      onClose();
    }
  };

  return (
    <ConfirmationDialog
      open={open}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title="テンプレート削除"
      message={`削除したテンプレートは復元できません\n「${template?.display_name}」を削除しますか？`}
      confirmButtonText="削除"
      confirmButtonLoading={deleting}
      confirmButtonDisable={deleting}
      cancelButtonText="キャンセル"
    />
  );
};
