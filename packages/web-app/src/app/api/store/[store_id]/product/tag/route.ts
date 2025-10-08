// import { apiRole, BackendAPI } from '@/api/backendApi/main';
// // import { BackendDepartmentModel } from '@/api/backendApi/model/department';
// import { type apiPrivilegesType } from '@/types/BackendAPI';
// import { Tag } from '@prisma/client';
// import { type NextRequest } from 'next/server';
// import { ApiError } from '@/api/backendApi/error/apiError';
// import { Prisma } from '@prisma/client';

// //タグの情報を取得するAPI
// export const GET = ApiError.errorWrapper(
//   async (req: NextRequest, { params }: any) => {
//     const apiDef: apiPrivilegesType = {
//       privileges: {
//         role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
//         policies: [], //実行に必要なポリシー
//       },
//     };
//     const API = await BackendAPI.setUp(req, params, apiDef);

//     const { store_id } = API.params;

//     const whereQuery: Prisma.TagWhereInput[] = [];
//     // クエリパラメータの探索&取得
//     await Promise.all(
//       Object.entries(API.query).map(async ([prop, value]: any) => {
//         switch (prop) {
//           case 'id':
//             whereQuery.push({
//               id: parseInt(value),
//             });
//             break;

//           case 'genre1':
//           case 'genre2':
//             whereQuery.push({
//               [prop]: value,
//             });
//             break;
//         }
//       }),
//     );

//     const selectResult = await API.db.tag.findMany({
//       where: {
//         AND: structuredClone(whereQuery),
//         store_id: parseInt(store_id || '0'),
//         ...(!API.query?.includesAuto
//           ? {
//               genre1: null,
//               genre2: null,
//             }
//           : null),
//       },
//       select: {
//         id: true,
//         display_name: true,
//         description: true,
//         genre1: true,
//         genre2: true,
//         created_at: true,
//         updated_at: true,
//         _count: {
//           select: {
//             products: true, // 結びついているプロダクトの合計数
//           },
//         },
//       },
//     });

//     const result = BackendAPI.useFlat(selectResult, {
//       _count__products: 'productsCount',
//     });

//     return API.status(200).response({
//       data: {
//         tags: result,
//       },
//     });
//   },
// );

// // タグ情報の登録、変更機能
// export const POST = ApiError.errorWrapper(
//   async (req: NextRequest, { params }: any) => {
//     const apiDef: apiPrivilegesType = {
//       privileges: {
//         role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
//         policies: [], //実行に必要なポリシー
//       },
//     };

//     const API = await BackendAPI.setUp(req, params, apiDef);

//     const { store_id } = API.params;

//     const { id, display_name, description, genre1, genre2 } = API.body; // 一応genre1も取得できるように実装

//     let result: Tag | null = null;

//     // bodyでidが指定されていた際に、そのidを持つレコードの更新を行う
//     if (id) {
//       const updateResult = await API.db.tag.update({
//         where: {
//           id: parseInt(id),
//           store_id: Number(store_id),
//         },
//         data: {
//           display_name,
//           description,
//           genre1,
//           genre2,
//           store: {
//             connect: { id: Number(store_id) }, // NUmber(store_id)
//           },
//         },
//       });

//       result = updateResult;
//     } else {
//       // id指定されない場合は新しくタグを作成
//       // 必須パラメータの設定
//       API.checkField(['display_name'], true);

//       const insertResult = await API.db.tag.create({
//         data: {
//           display_name,
//           description,
//           genre1,
//           genre2,
//           store: {
//             connect: { id: Number(store_id) },
//           },
//         },
//       });

//       result = insertResult;
//     }

//     return API.status(id ? 200 : 201).response({ data: result });
//   },
// );
