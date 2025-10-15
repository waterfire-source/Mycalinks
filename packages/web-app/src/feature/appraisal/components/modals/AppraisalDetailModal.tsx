import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { AppraisalItem } from '@/feature/appraisal/components/tables/PsaTable';
import { AppraisalDetailProductTable } from '@/feature/appraisal/components/tables/AppraisalDetailProductTable';
import { Stack } from '@mui/material';
import { AppraisalDetailFeeData } from '@/feature/appraisal/components/AppraisalDetailFeeData';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { useEffect, useState } from 'react';
import { useAppraisal } from '@/feature/appraisal/hooks/useAppraisal';
import { ActionSelectModal } from '@/components/modals/ActionSelectModal';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { useAlert } from '@/contexts/AlertContext';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';

type Props = {
  selectedAppraisal: AppraisalItem | undefined;
  onClose: () => void;
};

export const AppraisalDetailModal = ({ selectedAppraisal, onClose }: Props) => {
  const { push } = useRouter();
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();

  const {
    cancelAppraisal: cancelAppraisalApi,
    updateAppraisal: updateAppraisalApi,
  } = useAppraisal();

  const [isOpenSelectModal, setIsOpenSelectModal] = useState(false);
  const [isOpenEditConfirmDialog, setIsOpenEditConfirmDialog] = useState(false);
  const [isOpenCancelConfirmDialog, setIsOpenCancelConfirmDialog] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');

  const editAppraisal = async () => {
    if (!selectedAppraisal) return;
    setLoading(true);
    const ok = await cancelAppraisalApi({
      appraisal_id: selectedAppraisal?.id,
    });
    setLoading(false);
    if (!ok) return;
    push(PATH.APPRAISAL.register(selectedAppraisal?.id));
  };

  const cancelAppraisal = async () => {
    if (!selectedAppraisal) return;

    setLoading(true);
    const ok = await cancelAppraisalApi({
      appraisal_id: selectedAppraisal.id,
    });
    setLoading(false);

    if (!ok) return;
    setAlertState({ message: '鑑定情報を破棄しました', severity: 'success' });
    return { ok: true };
  };

  const updateDescription = async () => {
    if (!selectedAppraisal) return;
    try {
      await updateAppraisalApi({
        appraisal_id: selectedAppraisal.id,
        description: description,
      });
    } catch (err) {
      handleError(err);
    }
  };

  useEffect(() => {
    setDescription(selectedAppraisal?.description ?? '');
  }, [selectedAppraisal]);

  const viewMode = selectedAppraisal?.finished ? 'toProduct' : 'fromProduct';

  return (
    <CustomModalWithIcon
      open={!!selectedAppraisal}
      onClose={onClose}
      title={viewMode === 'toProduct' ? '鑑定結果詳細' : '鑑定情報詳細'}
      secondActionButtonText={
        selectedAppraisal?.finished ? undefined : '編集・破棄'
      }
      onSecondActionButtonClick={() => setIsOpenSelectModal(true)}
      width="90%"
      height="90%"
    >
      <Stack direction="row" height="100%" spacing={2} flex={1}>
        <Stack flex={7}>
          <AppraisalDetailProductTable
            selectedAppraisal={selectedAppraisal}
            viewMode={viewMode}
          />
        </Stack>
        <Stack flex={4}>
          <AppraisalDetailFeeData
            selectedAppraisal={selectedAppraisal}
            updateDescription={updateDescription}
            description={description}
            setDescription={setDescription}
          />
        </Stack>
      </Stack>
      <ActionSelectModal
        isOpen={isOpenSelectModal}
        onClose={() => setIsOpenSelectModal(false)}
        option1={{
          label: '破棄',
          onClick: () => setIsOpenCancelConfirmDialog(true),
        }}
        option2={{
          label: '編集',
          onClick: () => setIsOpenEditConfirmDialog(true),
        }}
        loading={loading}
      />
      <ConfirmationDialog
        open={isOpenEditConfirmDialog}
        onClose={() => setIsOpenEditConfirmDialog(false)}
        title="本当に編集しますか？"
        content="現在の内容を一度破棄し、同じ内容で作成画面に遷移します。よろしいですか？"
        onConfirm={editAppraisal}
        confirmButtonLoading={loading}
        confirmButtonText="編集する"
      />
      <ConfirmationDialog
        open={isOpenCancelConfirmDialog}
        onClose={() => setIsOpenCancelConfirmDialog(false)}
        title="本当に内容を破棄しますか？"
        content="現在の内容を破棄します。よろしいですか？"
        onConfirm={async () => {
          const res = await cancelAppraisal();
          if (res?.ok) {
            setIsOpenSelectModal(false);
            setIsOpenCancelConfirmDialog(false);
            onClose();
          }
        }}
        confirmButtonLoading={loading}
        confirmButtonText="破棄する"
      />
    </CustomModalWithIcon>
  );
};
