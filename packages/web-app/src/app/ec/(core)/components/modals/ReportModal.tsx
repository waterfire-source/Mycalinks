import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Stack,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { useEcContact } from '@/app/ec/(core)/hooks/useEcContact';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mycaItemId: number;
};

export const ReportModal = ({ isOpen, onClose, mycaItemId }: Props) => {
  // 問題報告のカスタムフック
  const { reportProblem } = useEcContact();

  // 選択された問題の種類
  const [selectedKind, setSelectedKind] = useState('1');
  // 報告内容
  const [content, setContent] = useState('');
  // 送信中かどうか
  const [isSubmitting, setIsSubmitting] = useState(false);

  // モーダルを閉じる
  const handleClose = () => {
    setSelectedKind('1');
    setContent('');
    onClose();
  };

  // 報告を送信
  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 選択された問題の種類に応じたラベルを取得
      const kindLabel = (() => {
        switch (selectedKind) {
          case '1':
            return '画像が間違っている';
          case '2':
            return '商品情報が間違っている';
          case '3':
            return 'その他';
          default:
            return 'その他';
        }
      })();

      const success = await reportProblem(kindLabel, content, mycaItemId);
      if (success) {
        handleClose();
      } else {
        // TODO: エラー時の処理を実装
        console.error('問題報告の送信に失敗しました');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '10px',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          textAlign: 'center',
          fontSize: '1rem !important',
          fontWeight: 'bold',
          py: 1,
          position: 'relative',
        }}
      >
        問題を報告
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="h3" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
          問題の内容を選択してください
        </Typography>
        <RadioGroup
          value={selectedKind}
          onChange={(e) => setSelectedKind(e.target.value)}
        >
          <FormControlLabel
            value="1"
            control={<Radio />}
            label="画像が間違っている"
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: '1rem',
                fontWeight: 'bold',
              },
            }}
          />
          <FormControlLabel
            value="2"
            control={<Radio />}
            label="商品情報が間違っている"
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: '1rem',
                fontWeight: 'bold',
              },
            }}
          />
          <FormControlLabel
            value="3"
            control={<Radio />}
            label="その他"
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: '1rem',
                fontWeight: 'bold',
              },
            }}
          />
        </RadioGroup>
        <TextField
          multiline
          rows={5}
          fullWidth
          placeholder="問題の内容を入力してください"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Stack
          direction="column"
          spacing={2}
          sx={{ width: '100%', px: 2, pb: 2 }}
        >
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            sx={{ borderRadius: '10px' }}
            disabled={isSubmitting}
          >
            報告する
          </Button>
          <Button
            onClick={handleClose}
            color="inherit"
            sx={{ borderRadius: '10px' }}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
