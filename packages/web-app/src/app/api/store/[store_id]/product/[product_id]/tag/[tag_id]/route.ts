// //Productからタグを取り除く

// //Productにタグをつける

// import { BackendAPI } from '@/api/backendApi/main';
// import { ApiError } from '@/api/backendApi/error/apiError';
// import { detachTagsFromProductDef } from '../../../def';
// import { detachTagsFromProductApi } from 'api-generator';

// //在庫からタグを取り除くAPI
// export const DELETE = BackendAPI.create(
//   detachTagsFromProductApi,
//   async (API, { params }) => {
//     //存在するか確認
//     //タグはgenre1やgenre2などが入っていてはいけない
//     const productTagInfo = await API.db.product_Tag.findUnique({
//       where: {
//         product_id_tag_id: {
//           product_id: params.product_id,
//           tag_id: params.tag_id,
//         },
//       },
//       include: {
//         tag: true,
//       },
//     });

//     if (!productTagInfo) throw new ApiError('notExist');

//     if (productTagInfo.tag.genre1 || productTagInfo.tag.genre2)
//       throw new ApiError({
//         status: 400,
//         messageText: 'このタグは手動で取り外すことができません',
//       });

//     const tags = await API.transaction(async (tx) => {
//       //タグを外す
//       await tx.product_Tag.delete({
//         where: {
//           product_id_tag_id: {
//             product_id: params.product_id,
//             tag_id: params.tag_id,
//           },
//         },
//       });

//       //タグを取り外した後の情報を取得
//       const tags = await tx.product_Tag.findMany({
//         where: {
//           product_id: params.product_id,
//         },
//         include: {
//           tag: true,
//         },
//       });

//       return tags;
//     });

//     return {
//       tags,
//     };
//   },
// );
