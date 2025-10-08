import { Box, Stack, TextField, Button, Typography } from '@mui/material';
import { CustomerData } from '@/app/auth/(dashboard)/customers/page';
import { useState, useEffect } from 'react';

interface Props {
  customer: CustomerData;
  onSave: (memo: string) => Promise<void>;
}

export const CustomerMemoInformation = ({ customer, onSave }: Props) => {
  const [memo, setMemo] = useState(customer.memo || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setMemo(customer.memo || '');
  }, [customer.memo]);

  const handleSave = async () => {
    await onSave(memo);
    setIsEditing(false);
  };

  return (
    <Box mt={2}>
      <Typography>メモ</Typography>
      <Box ml={2}>
        {isEditing ? (
          <Stack spacing={2} mt={2}>
            <TextField
              multiline
              rows={4}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="メモを入力してください"
              inputProps={{ maxLength: 5000 }}
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setMemo(customer.memo || '');
                  setIsEditing(false);
                }}
              >
                キャンセル
              </Button>
              <Button variant="contained" onClick={handleSave} size="small">
                保存
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ borderBottom: '1px solid', borderColor: 'grey.300', mt: 2 }}
          >
            <Typography
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                flex: 1,
              }}
            >
              {memo}
            </Typography>
            <Button
              variant="text"
              size="small"
              onClick={() => setIsEditing(true)}
              sx={{ ml: 2 }}
            >
              編集
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );
};
