import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { AppAdvertisementDataType, AppAdvertisementKind } from '@prisma/client';
import { useCallback, useMemo } from 'react';

export interface createOrUpdateAdvertisement {
  id?: number;
  displayName?: string;
  onPause?: boolean;
  asDraft?: boolean;
  kind?: AppAdvertisementKind;
  startAt?: Date;
  endAt?: Date;
  thumbnailImageUrl?: string;
  dataType?: AppAdvertisementDataType;
  dataText?: string;
  dataImages: {
    imageUrl: string;
  }[];
}

export const useCreateOrUpdateAdvertisement = () => {
  const { setAlertState } = useAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);

  const createOrUpdateAdvertisement = useCallback(
    async (storeId: number, updateState: createOrUpdateAdvertisement) => {
      try {
        const response =
          await clientAPI.advertisement.createOrUpdateAppAdvertisement({
            storeId,
            id: updateState.id,
            displayName: updateState.displayName,
            onPause: updateState.onPause,
            asDraft: updateState.asDraft,
            kind: updateState.kind,
            startAt: updateState.startAt,
            endAt: updateState.endAt,
            thumbnailImageUrl: updateState.thumbnailImageUrl,
            dataType: updateState.dataType,
            dataText: updateState.dataText,
            dataImages: updateState.dataImages.map((img) => ({
              imageUrl: img.imageUrl,
            })),
          });

        if (response instanceof CustomError) {
          setAlertState({ message: response.message, severity: 'error' });
          return response;
        }

        setAlertState({
          message: `登録に成功しました。`,
          severity: 'success',
        });
        return response; // 必要なら返却
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setAlertState({
          message: `エラーが発生しました: ${errorMessage}`,
          severity: 'error',
        });
      }
    },
    [clientAPI, setAlertState],
  );

  return {
    createOrUpdateAdvertisement,
  };
};
