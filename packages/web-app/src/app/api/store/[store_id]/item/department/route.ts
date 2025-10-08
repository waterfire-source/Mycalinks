//部門を取得するAPI
//数が少ないためもはや条件指定は必要なさそう
// export const GET = ApiError.errorWrapper(
//   async (req: NextRequest, { params }: any) => {
//     const apiDef: apiPrivilegesType = {
//       privileges: {
//         role: [AccountKind.corp], //アカウントの種類がuserなら権限に関わらず実行できる
//         policies: [], //実行に必要なポリシー
//       },
//     };

//     const API = await BackendAPI.setUp(req, params, apiDef);

//     let result: any = [];

//     const { store_id } = API.params;

//     const whereQuery: Prisma.DepartmentWhereInput = {};

//     Object.entries(API.query).forEach(([prop, value]) => {
//       switch (prop) {
//         case 'id':
//           whereQuery[prop] = Number(value);
//           break;
//       }
//     });

//     const selectResult: Array<
//       Department & {
//         stat?: {
//           hasStockProductsCount: number;
//         };
//       }
//     > = await API.db.department.findMany({
//       where: {
//         ...whereQuery,
//         store_id: parseInt(store_id || '0'),
//         is_deleted: false, //論理削除はされていないものだけ
//       },
//       orderBy: [
//         {
//           id: 'desc',
//         },
//       ],
//     });

//     //統計をとる
//     if (API.query?.includesStats) {
//       await Promise.all(
//         selectResult.map(async (e) => {
//           const relationalItems = await API.db.item.aggregate({
//             where: {
//               department_id: e.id,
//               products_stock_number: {
//                 gt: 0,
//               },
//             },
//             _count: true,
//           });

//           e.stat = {
//             hasStockProductsCount: relationalItems._count ?? 0,
//           };
//         }),
//       );
//     }

//     result = selectResult;

//     return API.status(200).response({ data: result });
//   },
// );
//部門を新規登録するAPI
// export const POST = ApiError.errorWrapper(
//   async (req: NextRequest, { params }: any) => {
//     const apiDef: apiPrivilegesType = {
//       privileges: {
//         role: [AccountKind.corp], //アカウントの種類がuserなら権限に関わらず実行できる
//         policies: [], //実行に必要なポリシー
//       },
//     };

//     const API = await BackendAPI.setUp(req, params, apiDef);

//     let result: Department | undefined = undefined;

//     const { store_id } = API.params;

//     const {
//       staff_account_id, //担当者ID
//       myca_genre_id, //Myca上のジャンルID
//       parent_department_id, //親部門ID

//       display_name, //表示名
//     } = API.body;

//     if (!staff_account_id)
//       throw new ApiError({
//         status: 400,
//         messageText: '担当者IDの指定が必要です',
//       });

//     //Mycaからの登録かどうか
//     if (myca_genre_id) {
//       //parent_department_idが必要

//       const parentDepartmentInfo = await API.db.department.findUnique({
//         where: {
//           store_id: parseInt(store_id),
//           id: parent_department_id || 0,
//           is_auto_registered: true,
//           parent_department_id: null,
//         },
//       });

//       if (!parentDepartmentInfo)
//         throw new ApiError({
//           status: 404,
//           messageText: '指定されたparent_departmentが見つかりませんでした',
//         });

//       //指定されたmycaのジャンルの情報を取得する
//       const mycaApp = new MycaApp(API);
//       const allGenres = await mycaApp.item.getGenres();
//       const thisMycaGenre = allGenres.find((e) => e.id == myca_genre_id);

//       if (!thisMycaGenre)
//         throw new ApiError({
//           status: 404,
//           messageText: '存在しないMycaジャンルを指定しています',
//         });

//       //このジャンルがすでに追加されていないか確認
//       const currentInfo = await API.db.department.findUnique({
//         where: {
//           store_id_handle: {
//             store_id: parseInt(store_id),
//             handle: `${parentDepartmentInfo.handle}_${thisMycaGenre.name}`,
//           },
//           parent_department_id: parentDepartmentInfo.id,
//           is_auto_registered: true,
//         },
//       });

//       if (currentInfo)
//         throw new ApiError({
//           status: 400,
//           messageText: 'すでに存在するMycaジャンルです',
//         });

//       //作る
//       const createDepartmentRes = await API.db.department.create({
//         data: {
//           store_id: parseInt(store_id),
//           staff_account_id,
//           parent_department_id: parentDepartmentInfo.id,
//           is_auto_registered: true,
//           handle: `${parentDepartmentInfo.handle}_${thisMycaGenre.name}`,
//           display_name: thisMycaGenre.display_name,
//         },
//       });

//       //この下から、Mycaからのアイテム自動インポート処理を書く

//       result = createDepartmentRes;
//     } else {
//       //独自部門作成だったら
//       //親部門として指定していいのは親にカードorボックスを含まないもののみ

//       if (parent_department_id) {
//         const departmentModel = new BackendDepartmentModel(API);
//         await departmentModel.getAllDepartments();

//         const isChildOfCard =
//           await departmentModel.judgeIsChildOfFixedDepartment({
//             departmentId: parent_department_id,
//             handle: 'card',
//             includesMe: true,
//           });
//         const isChildOfBox =
//           await departmentModel.judgeIsChildOfFixedDepartment({
//             departmentId: parent_department_id,
//             handle: 'box',
//             includesMe: true,
//           });

//         //cardかboxを含んでいるか確認
//         if (isChildOfCard.isChild || isChildOfBox.isChild)
//           throw new ApiError({
//             status: 400,
//             messageText: '指定された親部門には子部門が追加できません',
//           });
//       }

//       if (!display_name)
//         throw new ApiError({
//           status: 400,
//           messageText: '新規部門追加には表示名の指定が必要です',
//         });

//       //作る
//       const createDepartmentRes = await API.db.department.create({
//         data: {
//           store_id: parseInt(store_id),
//           staff_account_id,
//           parent_department_id,
//           display_name,
//         },
//       });

//       result = createDepartmentRes;
//     }

//     return API.status(201).response({ data: result });
//   },
// );
