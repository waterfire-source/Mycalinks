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
import { useAccount } from '@/feature/account/hooks/useAccount';

/**
 * パスワード更新モーダルのプロパティ
 */
interface Props {
  isOpen: boolean; // モーダルの表示状態
  onClose: () => void; // モーダルを閉じる処理
  accountID: string;
}

/**
 * パスワード更新モーダルコンポーネント
 * ユーザーが現在のパスワードと新しいパスワードを入力して更新するためのモーダル
 */
export const PasswordUpdateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  accountID,
}) => {
  const { updatePassword } = useAccount();

  // 入力値の状態管理
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // バリデーションエラーの状態管理
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // パスワード表示/非表示の状態管理
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ローディング状態管理
  const [isLoading, setIsLoading] = useState(false);

  /**
   * モーダルが開閉されるたびに状態をリセット
   */
  useEffect(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }, [isOpen]);

  /**
   * パスワード更新モーダルの確認ボタン押下時の処理
   */
  const handleConfirm = async () => {
    setIsLoading(true);
    // バリデーション
    const newErrors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};
    if (!newPassword)
      newErrors.newPassword = '新しいパスワードを入力してください';
    if (!confirmPassword)
      newErrors.confirmPassword = '確認用パスワードを入力してください';
    if (!currentPassword)
      newErrors.currentPassword = '現在のパスワードを入力してください';
    if (newPassword !== confirmPassword)
      newErrors.confirmPassword = 'パスワードが一致しません';
    if (newPassword === currentPassword)
      newErrors.newPassword =
        '現在のパスワードと同じパスワードは設定できません';

    // 半角英数字記号のみを許可する正規表現
    const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/;

    if (!passwordRegex.test(newPassword)) {
      newErrors.newPassword = '半角英数字と記号のみ使用できます';
    }

    if (!passwordRegex.test(currentPassword)) {
      newErrors.currentPassword = '半角英数字と記号のみ使用できます';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    const isSuccess = await updatePassword(
      accountID,
      currentPassword,
      newPassword,
    );
    if (isSuccess) {
      handleClose();
    }
    setIsLoading(false);
  };

  /**
   * モーダルを閉じる際の処理
   * 入力値と状態をリセットする
   */
  const handleClose = () => {
    onClose();
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <CustomModalWithIcon
      open={isOpen}
      onClose={handleClose}
      title="パスワードを変更"
      onActionButtonClick={handleConfirm}
      actionButtonText="変更"
      cancelButtonText="キャンセル"
      loading={isLoading}
      width="500px"
    >
      <Box sx={{ p: 2 }}>
        {/* 現在のパスワード入力フィールド */}
        <Box sx={{ mb: 3 }}>
          <Typography>現在のパスワード</Typography>
          <TextField
            type={showCurrentPassword ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              if (errors.currentPassword) {
                setErrors({ ...errors, currentPassword: undefined });
              }
            }}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword}
            size="small"
            sx={{ width: '100%' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    edge="end"
                  >
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* 新しいパスワード入力フィールド */}
        <Box sx={{ mb: 3 }}>
          <Typography>新しいパスワード</Typography>
          <TextField
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (errors.newPassword) {
                setErrors({ ...errors, newPassword: undefined });
              }
            }}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
            size="small"
            sx={{ width: '100%' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* 確認用パスワード入力フィールド */}
        <Box sx={{ mb: 2 }}>
          <Typography>新しいパスワード（確認）</Typography>
          <TextField
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) {
                setErrors({ ...errors, confirmPassword: undefined });
              }
            }}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            size="small"
            sx={{ width: '100%' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
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
