import { FunctionsAPI } from '@/api/frontend/functions/api';
import { customFetch, METHOD } from '@/api/implement';

export const functionsImplement = () => {
  return {
    uploadImage: async (
      request: FunctionsAPI['uploadImage']['request'],
    ): Promise<FunctionsAPI['uploadImage']['response']> => {
      const formDataForImage = new FormData();

      formDataForImage.append('file', request.body.file);
      formDataForImage.append('kind', request.body.kind);

      return await customFetch(
        {
          method: METHOD.POST,
          url: `/api/store/${request.store_id}/functions/upload-image`,
          body: formDataForImage,
        },
        true,
      )();
    },
  };
};
