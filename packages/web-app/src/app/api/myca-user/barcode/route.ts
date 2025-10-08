// Myca会員のバーコードを取得

import { BackendAPI } from '@/api/backendApi/main';
import { Barcode } from '@/utils/barcode';
import { getMycaUserBarcodeApi } from 'api-generator';

export const GET = BackendAPI.create(getMycaUserBarcodeApi, async (API) => {
  const barcode = Barcode.generateMycaUserBarcode(API.mycaUser!.id);
  return {
    barcode,
  };
});
