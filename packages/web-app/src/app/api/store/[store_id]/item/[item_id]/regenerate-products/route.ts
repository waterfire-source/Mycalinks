//結びつく在庫を作り直す（在庫を一度全て削除するため危険）廃止予定
// export const POST = ApiError.errorWrapper(
//   async (req: NextRequest, { params }: any) => {
//     const apiDef: apiPrivilegesType = {
//       privileges: {
//         role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
//         policies: [], //実行に必要なポリシー
//       },
//     };

//     const API = await BackendAPI.setUp(req, params, apiDef); //左にcheckField統合する？

//     const { store_id, item_id: id } = API.params;

//     if (!id || isNaN(id)) throw new ApiError('notEnough');

//     //そもそも存在するのか調べる
//     const findResult = await API.db.item.findUniqueExists({
//       where: {
//         id: parseInt(id),
//         store_id: parseInt(store_id),
//       },
//     });

//     if (!findResult)
//       //そもそも商品マスタが存在しないとき
//       throw new ApiError('notExist');

//     //一度在庫を削除する ※一回この処理は書かない

//     const thisItem = new BackendApiItemService(API, findResult.id);

//     await API.transaction(async (tx) => {
//       //状態なしの生成もOK

//       await thisItem.core.createProducts({});
//     });

//     return API.status(200).response({ msgContent: '再生成されました' });
//   },
// );
