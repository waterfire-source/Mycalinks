//部門変更API
// export const PUT = ApiError.errorWrapper(
//   async (req: NextRequest, { params }: any) => {
//     const apiDef: apiPrivilegesType = {
//       privileges: {
//         role: [AccountKind.corp], //アカウントの種類がuserなら権限に関わらず実行できる
//         policies: [], //実行に必要なポリシー
//       },
//     };

//     const API = await BackendAPI.setUp(req, params, apiDef);

//     let result: Department | undefined = undefined;

//     const { store_id, department_id } = API.params;

//     const {
//       display_name,
//       hidden,
//       auto_update,
//       is_deleted, //ここでtrueを指定することで削除できる
//     } = API.body;

//     const currentInfo = await API.db.department.findUnique({
//       where: {
//         store_id: parseInt(store_id),
//         id: parseInt(department_id),
//       },
//     });

//     if (!currentInfo) throw new ApiError('notExist');

//     //変更できる部門なのか確認

//     //自動生成の場合、削除はできない
//     if (currentInfo.is_auto_registered) {
//       if (is_deleted)
//         throw new ApiError({
//           status: 400,
//           messageText: '自動生成部門は削除できません',
//         });
//     } else {
//       //自動生成以外だと、auto_updateにできない
//       if (auto_update)
//         throw new ApiError({
//           status: 400,
//           messageText: '自動生成部門以外は自動更新設定ができません',
//         });
//     }

//     //更新していく
//     const updateRes = await API.db.department.update({
//       where: {
//         id: currentInfo.id,
//       },
//       data: {
//         display_name,
//         hidden,
//         auto_update,
//         is_deleted,
//       },
//     });

//     result = updateRes;

//     //新旧を比較して処理を行う

//     //auto_updateがtrueになってたら
//     if (
//       currentInfo.auto_update != updateRes.auto_update &&
//       updateRes.auto_update == true
//     ) {
//       //ここでMycaデータベースとの同期処理を書く

//       //全て登録する（非同期）
//       (async () => {
//         //店のステータスを変える
//         const thisStore = new BackendStoreModel(API);
//         await thisStore.setStatusMessage(
//           thisStore.rule.statusMessageDict.registerItemFromApp.doing,
//         );

//         try {
//           //このdepartmentIdのアイテムを全てフェッチする
//           const itemModel = new BackendItemModel(API);
//           const createItemQueryRes = await itemModel.createQueryFromMycaApp({
//             departmentId: updateRes.id,
//           });
//           const itemQueries = createItemQueryRes.itemQueries;
//           const conditionOptionInfo = createItemQueryRes.thisConditionOption;

//           if (!conditionOptionInfo)
//             throw new ApiError({
//               status: 500,
//               messageText: '状態の情報が取得できませんでした',
//             });

//           //全て登録する
//           for (const each of itemQueries) {
//             await API.transaction(async (tx) => {
//               const insertResult = await tx.item.create({
//                 data: {
//                   ...each,
//                   store: {
//                     connect: {
//                       id: Number(store_id),
//                     },
//                   },
//                 },
//               });

//               const thisItem = new BackendItemModel(API, insertResult.id);

//               await thisItem.createProducts({
//                 tx,
//                 specificItemInfo: insertResult,
//                 specificConditionOptions: conditionOptionInfo,
//               });
//             });
//           }

//           await thisStore.setStatusMessage(
//             thisStore.rule.statusMessageDict.registerItemFromApp.finished,
//           );
//         } catch (e) {
//           console.log(e);

//           await thisStore.setStatusMessage(
//             thisStore.rule.statusMessageDict.registerItemFromApp.error,
//           );
//         }
//       })();
//     }

//     // try {

//     // } catch (e) {
//     //   console.log(e);
//     //   return API.status(500).response({
//     //     msgContent: ResponseMsgKind.serverError,
//     //   });
//     // }

//     return API.status(200).response({ data: result });
//   },
// );
