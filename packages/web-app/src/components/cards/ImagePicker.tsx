'use client';

import { Box, SxProps } from '@mui/material';
import { useStore } from '@/contexts/StoreContext';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';

export type ImageKind = 'item' | 'product' | 'store';

interface Props {
  onImageUploaded:
    | React.Dispatch<React.SetStateAction<string | null>>
    | ((url: string | null) => void);
  kind: ImageKind;
  label?: string;
  buttonSx?: SxProps;
}

export const ImagePicker: React.FC<Props> = ({
  onImageUploaded,
  kind,
  label = '画像選択',
  buttonSx,
}: Props) => {
  const { store } = useStore();

  //画像の処理
  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files?.length) {
      const fileData = event.target.files[0];
      const formDataForImage = new FormData();

      formDataForImage.append('file', fileData);
      formDataForImage.append('kind', kind);

      const res = await fetch(
        `/api/store/${store?.id}/functions/upload-image/`,
        {
          method: 'POST',
          headers: {},
          body: formDataForImage,
        },
      );

      const resJson = await res.json();

      if (resJson.imageUrl) {
        onImageUploaded(resJson.imageUrl);
      }
    }
  };

  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <SecondaryButtonWithIcon component="label" sx={{ mt: 2, ...buttonSx }}>
        {label}
        <input type="file" hidden onChange={handleImageChange} />
      </SecondaryButtonWithIcon>
    </Box>
  );
};
