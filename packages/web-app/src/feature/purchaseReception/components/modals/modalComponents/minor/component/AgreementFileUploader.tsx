import {
  Box,
  Button,
  CircularProgress,
  FormHelperText,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

interface AgreementFileUploaderProps {
  handleFileChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<void>;
  errors?: Record<string, boolean>;
  parental_consent_image_url: string; // 承諾書のアップロード後URL
  disabled?: boolean;
  isIpadSize: boolean;
}

export const AgreementFileUploader = ({
  handleFileChange,
  errors,
  parental_consent_image_url,
  disabled = false, // デフォルトは無効化されていない状態
  isIpadSize,
}: AgreementFileUploaderProps) => {
  const [uploaded, setUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return; // 無効化されている場合は何もしない
    setIsUploading(true);
    await handleFileChange(event);
    setUploaded(true);
    setIsUploading(false);
  };

  const renderUploadedImage = () => (
    <Box sx={{ mt: 2 }}>
      <Image
        src={parental_consent_image_url}
        alt="保護者同意書"
        width={300}
        height={200}
        style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
      />
    </Box>
  );

  const renderUploadButton = () => (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
      <Button
        variant="outlined"
        component="label"
        disabled={disabled || isUploading} // disabled を適用
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          width: isIpadSize ? '95%' : '80%',
          height: '280px',
          backgroundColor: 'common.white',
          color: 'grey.700',
          border: '1px solid',
          borderColor: 'grey.700',
          '&:hover': {
            backgroundColor: 'grey.200',
            color: 'grey.800',
            borderColor: 'grey.200',
          },
          '&:disabled': {
            backgroundColor: 'grey.100',
            color: 'grey.500',
            borderColor: 'grey.400',
          },
        }}
      >
        {isUploading ? (
          <CircularProgress size={40} />
        ) : (
          <>
            <CameraAltIcon fontSize="large" />
            <Typography>写真を撮影する</Typography>
          </>
        )}
        <input
          type="file"
          name="agreement"
          required
          hidden
          onChange={handleUpload}
          disabled={disabled || isUploading} // 入力フィールドも無効化
        />
      </Button>
      {uploaded && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          アップロード完了
        </Typography>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography
        sx={{
          color: disabled ? 'grey.500' : 'text.primary',
        }}
      >
        買取承諾書
      </Typography>

      {parental_consent_image_url
        ? renderUploadedImage()
        : renderUploadButton()}

      {errors?.parental_consent_image_url && (
        <FormHelperText sx={{ color: 'primary.main' }}>
          買取承諾書の提出が必要です。
        </FormHelperText>
      )}
    </Box>
  );
};
