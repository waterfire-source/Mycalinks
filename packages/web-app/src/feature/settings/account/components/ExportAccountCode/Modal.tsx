import { Box, Typography } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { BarcodeDownloadButton } from '@/components/buttons/BarCodeDownoadButton';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';
import { useCallback } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  barcodeNumbers: number[];
  notExportButton?: boolean;
}

export const ExportAccountCodeModal = ({
  isOpen,
  onClose,
  barcodeNumbers,
  notExportButton = true,
}: Props) => {
  //従業員バーコード印刷
  const { pushQueue } = useLabelPrinterHistory();

  const handleClickPrintLabel = useCallback(async () => {
    barcodeNumbers.forEach((code) => {
      //コードを使ってラベル印刷を行う
      pushQueue({
        template: 'staff',
        data: Number(code),
      });
    });
  }, [barcodeNumbers]);

  return (
    <>
      <CustomModalWithHeader
        open={isOpen}
        onClose={onClose}
        title="従業員番号出力"
        sx={{ minWidth: '300px' }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 4,
          }}
        >
          <Typography variant="body1" sx={{ mt: 2 }}>
            バーコードの出力方法を選んでください
          </Typography>
          <Box
            sx={{
              mt: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '80%',
              gap: 2,
            }}
          >
            <BarcodeDownloadButton
              title="画像ダウンロード"
              values={barcodeNumbers}
              variant="contained"
              color="error"
              sx={{ width: '100%' }}
            />
            <PrimaryButton
              variant="contained"
              color="error"
              onClick={handleClickPrintLabel}
              sx={{ width: '100%' }}
            >
              ラベルプリンターで印刷
            </PrimaryButton>
            {notExportButton && (
              <SecondaryButton
                variant="contained"
                color="error"
                onClick={onClose}
                sx={{ width: '100%' }}
              >
                出力しない
              </SecondaryButton>
            )}
          </Box>
        </Box>
      </CustomModalWithHeader>
    </>
  );
};
