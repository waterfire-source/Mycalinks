import { ECSettingProps } from '@/app/auth/(dashboard)/ec/settings/page';
import { HelpIcon } from '@/components/common/HelpIcon';
import {
  Card,
  FormControl,
  Stack,
  Typography,
  TextField,
  Box,
} from '@mui/material';
import { Dispatch, SetStateAction, useState, useEffect } from 'react';

interface Props {
  ECSettings: ECSettingProps | null | undefined;
  setECSettings: Dispatch<SetStateAction<ECSettingProps | null | undefined>>;
  isEditable: boolean;
}

export const NotificationEmailSettings = ({
  ECSettings,
  setECSettings,
  isEditable,
}: Props) => {
  // ローカル状態でテキストエリアの値を管理
  const [emailText, setEmailText] = useState<string>('');

  // カンマ区切りの文字列を改行区切りに変換
  const emailsToText = (emails: string | null | undefined): string => {
    if (!emails) return '';
    return emails
      .split(',')
      .map((email) => email.trim())
      .join('\n');
  };

  // 改行区切りのテキストをカンマ区切りに変換する関数（外部から呼び出し用）
  const textToEmails = (text: string): string => {
    return text
      .split('\n')
      .map((email) => email.trim())
      .filter((email) => email.length > 0)
      .join(',');
  };

  // ECSettingsが更新されたら、ローカル状態も更新
  useEffect(() => {
    setEmailText(emailsToText(ECSettings?.notificationEmail));
  }, [ECSettings?.notificationEmail]);

  // テキストエリアの値が変更されたら、ローカル状態のみ更新
  const handleEmailsChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setEmailText(event.target.value);
  };

  // 外部から変換した値を取得できる関数を親コンポーネントに提供するため
  // ECSettingsに変換後の値を設定する関数
  useEffect(() => {
    const convertedEmails = textToEmails(emailText);
    setECSettings((prev) => ({
      ...prev,
      notificationEmail: convertedEmails || null,
    }));
  }, [emailText, setECSettings]);

  return (
    <>
      <Box display="flex" alignItems="center" gap={1} mt={2} mb={1}>
        <Typography variant="h2">受注・問い合わせメール通知設定</Typography>
        <HelpIcon helpArchivesNumber={4418} />
      </Box>
      <Card
        sx={{ p: 2, width: '100%', flexDirection: 'column', display: 'flex' }}
      >
        <Stack spacing={3}>
          <Typography variant="body2">
            受注・お客様からのお問い合わせがあった時に通知を送信するメールアドレスを設定できます。
          </Typography>

          <FormControl fullWidth>
            <TextField
              multiline
              rows={6}
              value={emailText}
              onChange={handleEmailsChange}
              disabled={!isEditable}
              placeholder={`example1@example.com
example2@example.com
example3@example.com`}
              helperText="※メールアドレスごとに改行してください。"
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
            />
          </FormControl>
        </Stack>
      </Card>
    </>
  );
};
