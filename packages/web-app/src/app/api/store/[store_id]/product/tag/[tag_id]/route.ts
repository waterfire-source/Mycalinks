// import { apiRole, BackendAPI } from '@/api/backendApi/main';
// import { type apiPrivilegesType } from '@/types/BackendAPI';
// // import dayjs from 'dayjs';
// import { type NextRequest } from 'next/server';
// import { ApiError } from '@/api/backendApi/error/apiError';

// //タグの削除を行うことができるAPI
// export const DELETE = ApiError.errorWrapper(
//   async (req: NextRequest, { params }: any) => {
//     const apiDef: apiPrivilegesType = {
//       privileges: {
//         role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
//         policies: [], //実行に必要なポリシー
//       },
//     };

//     const API = await BackendAPI.setUp(req, params, apiDef);

//     const { store_id, tag_id } = API.params;

//     //このタグがあるのか確認
//     const thisTagInfo = await API.db.tag.findUnique({
//       where: {
//         id: parseInt(tag_id),
//         store_id: Number(store_id),
//       },
//     });

//     // タグがない場合のエラーハンドリング
//     if (!thisTagInfo) throw new ApiError('notExist');

//     // 物理削除を行う
//     await API.db.tag.delete({
//       where: {
//         id: thisTagInfo.id,
//       },
//     });

//     return API.status(200).response({
//       msgContent: 'タグが正しく削除されました',
//     });
//   },
// );
