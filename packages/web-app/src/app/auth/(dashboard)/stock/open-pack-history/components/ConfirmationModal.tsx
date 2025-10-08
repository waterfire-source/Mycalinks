'use client';

import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { useEffect, useState } from 'react';
import { ActionSelectModal } from '@/components/modals/ActionSelectModal';
import { useRouter } from 'next/navigation';
import { OpenPackHistory } from '@/app/auth/(dashboard)/stock/open-pack-history/components/DetailModal';

interface ConfirmationModalProps {
  onClose: () => void;
  rollback: (isDryRun?: boolean) => Promise<{ ok: string } | undefined>;
  isLoading: boolean;
  openPackHistory: OpenPackHistory;
}

export function ConfirmationModal({
  onClose,
  rollback,
  isLoading,
  openPackHistory,
}: ConfirmationModalProps) {
  const [whichModalIsOpen, setWhichModalIsOpen] = useState<
    'actionSelect' | 'confirm' | 'failed' | null
  >(null);
  const { push } = useRouter();
  const onLoad = async () => {
    const res = await rollback(true);

    if (!res) {
      setWhichModalIsOpen('failed');
    } else {
      setWhichModalIsOpen('actionSelect');
    }
  };

  useEffect(() => {
    onLoad();
  }, []);

  const onClickFix = () => {
    push(`/auth/stock/register/pack?fixId=${openPackHistory.id}`);
  };
  const onClickDelete = () => {
    setWhichModalIsOpen('confirm');
  };

  return (
    <>
      <ActionSelectModal
        isOpen={whichModalIsOpen === 'actionSelect'}
        onClose={onClose}
        option1={{ label: '修正して取り消し', onClick: onClickFix }}
        option2={{ label: '取り消し', onClick: onClickDelete }}
      />
      <ConfirmationDialog
        open={whichModalIsOpen === 'confirm'}
        onClose={onClose}
        title="パック開封結果の取り消し"
        message="登録内容はすべてリセットされ、関連する在庫は開封前の状態に戻ります。"
        width="500px"
        confirmButtonText="取り消す"
        cancelButtonText="キャンセル"
        onConfirm={() => rollback(false)}
        confirmButtonLoading={isLoading}
      />
      <ConfirmationDialog
        open={whichModalIsOpen === 'failed'}
        onClose={onClose}
        confirmButtonDisable
        title="修正・取り消しができません"
        message="登録された商品が取引や在庫変換等の処理を受けたため、この結果は修正・取り消しができません。"
        width="500px"
        cancelButtonText="閉じる"
        confirmButtonLoading={isLoading}
      />
    </>
  );
}
