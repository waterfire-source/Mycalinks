import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';

/**
 * パスワード確認モーダルのプロパティ
 */
interface Props {
  isOpen: boolean; // モーダルの表示状態
  onClose: () => void; // モーダルを閉じる処理
  onConfirm: (password: string) => void; // パスワード確認後の処理
  title?: string; // モーダルのタイトル
  isLoading?: boolean; // 読み込み状態
}

/**
 * パスワード確認モーダルコンポーネント
 * ユーザーがパスワードを入力して操作を確認するためのモーダル
 */
export const PasswordConfirmModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'パスワードを入力',
  isLoading = false,
}) => {
  // 入力値の状態管理
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  // モーダーが開いたときに入力値をリセット
  useEffect(() => {
    setPassword('');
    setError('');
  }, [isOpen]);

  /**
   * 確認ボタンクリック時の処理
   * パスワードの入力チェックを行い、問題なければ確認処理を実行
   */
  const handleConfirm = async () => {
    if (!password) {
      setError('パスワードを入力してください');
      return;
    }

    await onConfirm(password);
  };

  /**
   * モーダルを閉じる際の処理
   * 入力値と状態をリセットする
   */
  const handleClose = () => {
    onClose();
    setShowPassword(false);
  };

  return (
    <CustomModalWithIcon
      open={isOpen}
      onClose={handleClose}
      title={title}
      onActionButtonClick={handleConfirm}
      actionButtonText="保存"
      cancelButtonText="キャンセル"
      loading={isLoading}
      width="500px"
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ gap: 2, mb: 3, alignItems: 'center' }}>
          {/* パスワード入力フィールド */}
          <Typography sx={{ width: '100px', minWidth: '100px', mb: 1 }}>
            パスワード
          </Typography>
          <TextField
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            error={!!error}
            helperText={error}
            size="small"
            sx={{ width: '100%' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {/* パスワード表示/非表示切り替えボタン */}
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>
    </CustomModalWithIcon>
  );
};
