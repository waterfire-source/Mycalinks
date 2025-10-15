import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiFileService } from '@/api/backendApi/services/file/main';

//画像アップロード
//ややこしいが、一旦こちらのAPIでlbxファイルのアップロードも受け付けることにする
export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        //アプリユーザーもOK
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef); //左にcheckField統合する？

    // const { store_id } = API.params;

    //アップロードする画像の種類
    const { kind } = API.body;

    //アップロードするファイルを確認
    const imgExtension = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.webp',
      '.svg',
      '.lbx',
    ];
    if (
      !API.files.find(
        (e) => e.fileKind == 'file' && imgExtension.includes(e.extension),
      ) ||
      !kind
    )
      throw new ApiError({
        status: 400,
        messageText:
          '情報が足りないか、ファイルの形式がサポートされていないです',
      });

    //アップロード処理を行う
    const fileService = new BackendApiFileService(API);
    const imageUrl = await fileService.uploadImageToS3(kind, 'file');
    return API.status(200).response({ data: { imageUrl } });
  },
);
