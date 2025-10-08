import JsBarcode from 'jsbarcode';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { SxProps, Theme } from '@mui/material';
import { ButtonProps } from '@mui/material/Button';

interface Props extends ButtonProps {
  values: number[];
  title: string;
  sx?: SxProps<Theme>;
  variant?: 'contained' | 'outlined' | 'text';
}

export const BarcodeDownloadButton = ({
  values,
  title,
  sx,
  variant,
  ...props
}: Props) => {
  const downloadAsDataUrl = (e: React.MouseEvent<HTMLButtonElement>) => {
    const svgElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg',
    );
    // バーコードの生成
    values.map((value) => {
      try {
        JsBarcode(svgElement, value.toString(), {
          format: 'CODE128', // バーコードの形式
          lineColor: '#000', // バーコードの色
          width: 2, // 各バーの幅
          height: 100, // バーコードの高さ
          displayValue: true, // 値を下に表示する
        });
        if (!svgElement) return;

        // SVGを文字列化
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);

        // Base64エンコード
        const base64Data = btoa(svgString);

        // Data URL形式に変換
        const dataUrl = `data:image/svg+xml;base64,${base64Data}`;

        // ダウンロードリンクを生成
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `barcode_${value}.svg`;
        link.click();
      } catch (e) {
        console.error(e);
      }
    });
    props.onClick && props.onClick(e);
  };

  return (
    <PrimaryButton
      variant={variant}
      onClick={(e) => downloadAsDataUrl(e)}
      sx={{ ...sx }}
      {...props}
    >
      {title}
    </PrimaryButton>
  );
};
