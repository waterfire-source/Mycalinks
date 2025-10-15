//廃止済みAPI

// import { ApiError } from '@/api/backendApi/error/apiError';
// import { BackendAPI } from '@/api/backendApi/main';
// import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
// import { getItemFindOptionDef } from '@/app/api/store/[store_id]/item/def';

// //絞り込み選択肢取得
// export const GET = BackendAPI.defineApi(
//   getItemFindOptionDef,
//   async (API, { params, query }) => {
//     //カテゴリとジャンルの情報を取得する
//     const results = await Promise.all([
//       API.db.item_Category.findUnique({
//         where: {
//           id: query.category_id,
//           store_id: params.store_id,
//           handle: {
//             not: null,
//           },
//         },
//       }),
//       API.db.item_Genre.findUnique({
//         where: {
//           id: query.genre_id,
//           store_id: params.store_id,
//           handle: {
//             not: null,
//           },
//         },
//       }),
//     ]);

//     if (!results[0] || !results[1])
//       throw new ApiError(getItemFindOptionDef.error.invalidCategoryGenre);

//     const excludeColumn = ['pack_name', 'release_date'];

//     //メタ情報を取得する
//     const mycaApp = new BackendApiMycaAppService(API);
//     const metaList = (
//       await mycaApp.core.item.getItemMetaDef(
//         results[1].handle!,
//         results[0].handle!,
//       )
//     ).filter((e) => !excludeColumn.includes(e.columnOnPosItem));

//     //それぞれの選択肢を取得してくる
//     const searchElements = (
//       await Promise.all(
//         metaList.map(async (meta) => {
//           const options = (
//             await API.db.item.groupBy({
//               where: {
//                 store_id: params.store_id,
//                 [meta.columnOnPosItem]: {
//                   not: null,
//                 },
//                 genre_id: query.genre_id,
//                 category_id: query.category_id,
//               },
//               by: meta.columnOnPosItem,
//             })
//           ).map((e) => ({
//             label: String(e[meta.columnOnPosItem]),
//             value: String(e[meta.columnOnPosItem]),
//           }));

//           return {
//             metaLabel: meta.label,
//             columnOnPosItem: meta.columnOnPosItem,
//             options,
//           };
//         }),
//       )
//     ).filter(Boolean);

//     return {
//       searchElements,
//     };
//   },
// );
