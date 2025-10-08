import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
} from '@mui/material';
import * as fabric from 'fabric';
import { mycalinksTransactionImplement } from '@/api/frontend/mycalinks/transaction/implement';
import { BackendAllTransactionAPI } from '@/app/api/store/all/transaction/api';
import { useMycalinksUploadImage } from '@/hooks/useMycalinksUploadImage';
interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transactionInfo: BackendAllTransactionAPI[1]['response'][200] | null;
}

export const SignatureModal = ({
  open,
  onClose,
  transactionInfo,
  onConfirm,
}: Props) => {
  // useUploadImage から result を取得
  const { uploadImage } = useMycalinksUploadImage();
  const [processStatus, setProcessStatus] = useState('');
  const [screenWidth, setScreenWidth] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const signatureHeight = screenWidth ? screenWidth * 0.5 : 600;
  const [isSigned, setIsSigned] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setScreenWidth(window.innerWidth);
    }
  }, []);

  // Fabricキャンバスの初期化関数
  const initializeFabricCanvas = () => {
    if (screenWidth === null || !canvasRef.current) return;

    const options = {
      isDrawingMode: true,
      backgroundColor: 'white',
    };
    const fabricCanvas = new fabric.Canvas(canvasRef.current, options);

    fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
    fabricCanvas.freeDrawingBrush.color = 'black';
    fabricCanvas.freeDrawingBrush.width = 2;

    fabricCanvas.on('path:created', () => {
      setIsSigned(true);
    });

    fabricCanvasRef.current = fabricCanvas;
  };

  // 署名クリア
  const handleClear = () => {
    setIsSigned(false);
    fabricCanvasRef.current?.clear();
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.backgroundColor = 'white';
      fabricCanvasRef.current.renderAll();
    }
  };

  // モーダルを閉じる
  const handleClose = () => {
    handleClear();
    fabricCanvasRef.current?.dispose();
    fabricCanvasRef.current = null;
    onClose();
  };

  // 画像ファイルに変換
  const dataURLtoFile = (dataUrl: string, fileName: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], fileName, { type: mime });
  };

  // handleConfirm 内を簡略化
  const handleConfirm = async () => {
    if (!transactionInfo) {
      console.error('transactionInfo is null');
      return;
    }
    setIsLoading(true);
    setProcessStatus('署名アップロード中');
    const dataUri = fabricCanvasRef.current?.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 1,
    }) as string;
    try {
      const result = await uploadImage(
        dataURLtoFile(dataUri, 'signature.png'),
        'transaction',
      );
      await mycalinksTransactionImplement().putPosTransaction({
        transactionId: transactionInfo.id,
        signatureImageUrl: result?.imageUrl ?? null,
      });

      setProcessStatus('');
      onConfirm();
    } catch (error) {
      setProcessStatus('署名のアップロードに失敗しました');
      console.error('署名アップロードエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (screenWidth === null) return null;

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      onClose={handleClose}
      TransitionProps={{
        onEntered: initializeFabricCanvas,
      }}
      PaperProps={{
        sx: {
          width: '90%',
          height: '90vh',
          borderRadius: 2,
        },
      }}
      sx={{
        '.MuiBackdrop-root': {
          backgroundColor: 'rgba(0,0,0,0.5)',
        },
      }}
    >
      <DialogContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: 'white',
          borderRadius: 2,
          mx: 'auto',
          p: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ボタン */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'column',
            width: '20%',
            height: '100%',
            px: 2,
            py: 1,
            mt: 1,
          }}
        >
          <Button
            variant="contained"
            onClick={handleClear}
            sx={{
              transform: 'translate(-25%, 75%) rotate(90deg)',
              backgroundColor: '#676767!important',
              color: 'text.secondary',
              borderRadius: 2,
              py: 1,
              px: 2,
              display: 'block',
              opacity: isLoading ? 0.5 : 1,
              width: 'fit-content',
              height: 'fit-content',
              textWrap: 'nowrap',
            }}
          >
            書き直す
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={!isSigned || isLoading}
            sx={{
              transform: 'translate(-25%, -100%) rotate(90deg)',
              backgroundColor: 'primary.main!important',
              color: 'text.secondary',
              borderRadius: 2,
              py: 1,
              px: 2,
              display: 'block',
              opacity: isLoading ? 0.5 : 1,
              width: 'fit-content',
              height: 'fit-content',
              textWrap: 'nowrap',
            }}
          >
            署名提出
          </Button>
        </Box>
        {/* サイン記入欄 */}
        <Box
          sx={{
            width: '70%',
            height: 'auto',
            px: 1,
            mx: 'auto',
          }}
        >
          <canvas
            ref={canvasRef}
            width={signatureHeight * 0.9}
            height={500}
            style={{
              borderRadius: 10,
              border: '1px solid #808080',
              width: signatureHeight * 0.9,
              height: 500,
              touchAction: 'none',
              boxSizing: 'border-box',
            }}
          />
        </Box>
        {/* エラー文 */}
        <Box
          sx={{
            p: 1,
            transform: 'translate(-50% , -50%) rotate(90deg)',
            position: 'absolute',
            top: '50%',
            left: '78%',
            width: 'max-content',
          }}
        >
          {processStatus && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2,
              }}
            >
              <Typography>{processStatus}</Typography>
              {!processStatus.includes('エラー') && (
                <CircularProgress size={20} color="error" />
              )}
            </Box>
          )}
        </Box>
        {/* タイトル */}
        <Box
          sx={{
            width: '15%',
            height: '100%',
            backgroundColor: 'primary.main',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '15px!important',
            textAlign: 'center',
            py: 1,
          }}
        >
          <DialogTitle
            sx={{
              width: '15%',
              height: '100%',
              backgroundColor: 'primary.main',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '15px!important',
              textAlign: 'center',
              py: 1,
            }}
          >
            <Box
              component="span"
              sx={{
                width: '90vh',
                height: 'auto',
                display: 'block',
                transformOrigin: 'left top',
                transform: 'translate(3%, -40%) rotate(90deg)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '15px!important',
                py: 1,
              }}
            >
              署名してください
            </Box>
          </DialogTitle>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
