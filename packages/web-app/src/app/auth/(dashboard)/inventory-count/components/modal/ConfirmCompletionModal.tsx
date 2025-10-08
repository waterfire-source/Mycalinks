import { Typography } from '@mui/material';
import { useState } from 'react';
import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { palette } from '@/theme/palette';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';

interface ConfirmCompletionModalProps {
  isCompleteModalOpen: boolean;
  setIsCompleteModalOpen: (open: boolean) => void;
  handleConfirm: (adjust: boolean) => Promise<void>;
}
export const ConfirmCompletionModal = ({
  isCompleteModalOpen,
  setIsCompleteModalOpen,
  handleConfirm,
}: ConfirmCompletionModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdjust, setIsAdjust] = useState<boolean>(true);

  const onClose = () => {
    setIsCompleteModalOpen(false);
    setIsAdjust(true);
  };

  const onConfirm = async () => {
    setIsLoading(true);
    await handleConfirm(isAdjust);
    setIsLoading(false);
    setIsAdjust(true);
  };

  const content = (
    <>
      <FormControl>
        <Typography mb={2}>差分の処理を選択してください。</Typography>
        <RadioGroup
          value={String(isAdjust)}
          onChange={(e) => setIsAdjust(e.target.value === 'true')}
        >
          <FormControlLabel
            value="true"
            control={<Radio />}
            label="在庫数を棚卸結果に合わせる"
          />
          <FormControlLabel
            value="false"
            control={<Radio />}
            label="棚卸前の在庫数のまま運用する"
          />
        </RadioGroup>
      </FormControl>
      <Typography color={palette.primary.main} mt={2}>
        ※完了後は結果の編集ができません。
        <br />
        仕入れ値の記録がない商品がある場合、この後の画面で仕入れ値の入力が必要となります。
      </Typography>
    </>
  );

  return (
    <ConfirmationDialog
      open={isCompleteModalOpen}
      onClose={onClose}
      title="棚卸を完了"
      message=""
      content={content}
      confirmButtonText="完了"
      onConfirm={onConfirm}
      width="500px"
      isLoading={isLoading}
    />
  );
};
