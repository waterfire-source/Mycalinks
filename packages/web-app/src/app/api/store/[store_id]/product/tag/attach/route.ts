// //Productにタグをつける

// import { BackendAPI } from '@/api/backendApi/main';
// import { attachTagsToProductDef } from '../../def';
// import { attachTagsToProductApi } from 'api-generator';
// import { ApiError } from '@/api/backendApi/error/apiError';

// //在庫にタグを結びつけるAPI
// export const POST = BackendAPI.create(
//   attachTagsToProductApi,
//   async (API, { params, body }) => {
//     //一つ一つタグをつけていく

//     await API.transaction(async (tx) => {
//       for (const product of body.products) {
//         try {
//           await tx.product_Tag.create({
//             data: {
//               product: {
//                 connect: {
//                   id: product.product_id,
//                   store_id: params.store_id,
//                 },
//               },
//               tag: {
//                 connect: {
//                   id: product.tag_id,
//                   store_id: params.store_id,
//                   genre1: null,
//                   genre2: null, //この二つが入っていないタグじゃないといけない
//                 },
//               },
//             },
//           });
//         } catch (e) {
//           throw new ApiError({
//             status: 400,
//             messageText: '指定できない在庫やタグが含まれています',
//           });
//         }
//       }
//     });
//   },
// );
