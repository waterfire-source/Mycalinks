import { EditConditionOptionsTable } from '@/app/auth/(dashboard)/settings/condition/components/EditConditionOptionsTable';
import { CardConditionOption } from '@/app/auth/(dashboard)/settings/condition/page';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useConditionOption } from '@/feature/conditionOption/hooks/useConditionOption';
import { Typography } from '@mui/material';
import { useState } from 'react';

interface EditConditionOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conditionOptions: CardConditionOption[];
  itemCategoryId: number;
}

export const EditConditionOptionsModal = ({
  isOpen,
  onClose,
  conditionOptions,
  itemCategoryId,
}: EditConditionOptionModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    createConditionOption,
    updateConditionOption,
    deleteConditionOption,
  } = useConditionOption();

  const [createdConditionOptions, setCreatedConditionOptions] = useState<
    CardConditionOption[]
  >([]);
  const [updatedConditionOptions, setUpdatedConditionOptions] = useState<
    CardConditionOption[]
  >([]);
  const [deletedConditionOptionIds, setDeletedConditionOptionIds] = useState<
    number[]
  >([]);

  const handleCancel = () => {
    setCreatedConditionOptions([]);
    setUpdatedConditionOptions([]);
    setDeletedConditionOptionIds([]);
    onClose();
  };

  const handleSave = async () => {
    setIsLoading(true);

    for (const option of createdConditionOptions) {
      try {
        await createConditionOption({
          displayName: option.displayName,
          rateVariants: [option.rateVariants[0]],
          handle: undefined,
          orderNumber: option.orderNumber,
        });
      } catch (e) {
        continue; // エラーが発生しても次の処理をする
      }
    }

    for (const option of updatedConditionOptions) {
      try {
        await updateConditionOption({
          id: option.id,
          displayName: option.displayName,
          rateVariants: [option.rateVariants[0]],
          orderNumber: option.orderNumber,
        });
      } catch (e) {
        continue; // エラーが発生しても次の処理をする
      }
    }

    for (const id of deletedConditionOptionIds) {
      try {
        await deleteConditionOption({
          id: id,
        });
      } catch (e) {
        continue; // エラーが発生しても次の処理をする
      }
    }

    setCreatedConditionOptions([]);
    setUpdatedConditionOptions([]);
    setDeletedConditionOptionIds([]);
    onClose();
    setIsLoading(false);
  };

  return (
    <CustomModalWithIcon
      open={isOpen}
      onClose={handleCancel}
      width="90%"
      height="85%"
      title="状態編集"
      loading={isLoading}
      onCancelClick={handleCancel}
      cancelButtonText="保存せずに戻る"
      onActionButtonClick={handleSave}
      actionButtonText="編集内容を保存"
    >
      <EditConditionOptionsTable
        itemCategoryId={itemCategoryId}
        conditionOptions={conditionOptions}
        createdConditionOptions={createdConditionOptions}
        setCreatedConditionOptions={setCreatedConditionOptions}
        updatedConditionOptions={updatedConditionOptions}
        setUpdatedConditionOptions={setUpdatedConditionOptions}
        deletedConditionOptionIds={deletedConditionOptionIds}
        setDeletedConditionOptionIds={setDeletedConditionOptionIds}
      />
      <Typography fontWeight="bold" sx={{ mt: 2 }} textAlign="right">
        ※状態の反映には時間がかかる場合があります
      </Typography>
      <SecondaryButtonWithIcon
        fullWidth
        onClick={() =>
          setCreatedConditionOptions([
            ...createdConditionOptions,
            {
              id: -(createdConditionOptions.length + 1),
              orderNumber:
                createdConditionOptions.length +
                updatedConditionOptions.length +
                1,
              displayName: '',
              rateVariants: [
                {
                  autoSellPriceAdjustment: '100%',
                  autoBuyPriceAdjustment: '100%',
                  groupId: undefined,
                  genreId: undefined,
                },
              ],
            },
          ])
        }
        sx={{ marginTop: '1rem' }}
      >
        新しい状態を追加
      </SecondaryButtonWithIcon>
    </CustomModalWithIcon>
  );
};
