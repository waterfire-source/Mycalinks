// // 過去の取引の詳細をCSVで取得する（古物台帳）

// import { BackendAPI } from '@/api/backendApi/main';
// import {
//   getTransactionCartCsvApi,
//   getTransactionStatsCsvApi,
// } from 'api-generator';
// import { customDayjs } from 'common';
// import { BackendApiCsvService } from '@/api/backendApi/services/csv/main';
// import { BackendApiFileService } from '@/api/backendApi/services/file/main';

// //一旦買取用
// export const GET = BackendAPI.create(
//   getTransactionCartCsvApi,
//   async (API, { params, query }) => {
//     const startDay = customDayjs(query.finishedAtGte).tz().format('YYYY-MM-DD');
//     const endDay = customDayjs(query.finishedAtLte).tz().format('YYYY-MM-DD');

//     //dwhのfactレコードから取得していく
//     const selectRes = await API.db.$queryRaw<{}[]>`
//     SELECT
//       Transaction.finished_at,
//       Transaction.id AS transaction_id,
//       Transaction.transaction_kind,
//       Product.display_name AS product_display_name,
//       Item.expansion,
//       Item.cardnumber,
//       Item.rarity,
//       Item_Category_Condition_Option.display_name AS condition_option_display_name,
//       Transaction_Cart.item_count,
//       Transaction_Cart.total_unit_price,
//       Transaction_Cart.wholesale_total_price,
//       Item_Genre.display_name AS genre_display_name,
//       Item_Category.display_name AS category_display_name,
//     FROM Transaction_Cart
//     INNER JOIN Transaction ON Transaction.id = Transaction_Cart.transaction_id
//     INNER JOIN Product ON Product.id = Transaction_Cart.product_id
//     INNER JOIN Item ON Item.id = Product.item_id
//     INNER JOIN Item_Category ON Item_Category.id = Item.category_id
//     INNER JOIN Item_Genre ON Item_Genre.id = Item.genre_id
//     INNER JOIN Item_Category_Condition_Option ON Item_Category_Condition_Option.id = Product.condition_option_id
//     WHERE Transaction.store_id = ${params.store_id}
//     AND DATE(Transaction.finished_at) >= DATE(${startDay})
//     AND DATE(Transaction.finished_at) <= DATE(${endDay})
//     `;

//     //一つずつラベリングしていく
//     const transactionCarts = selectRes.map((p) => {
//       return {
//         取引日: customDayjs(p.transaction_finished_at)
//           .tz()
//           .format('YYYY/MM/DD'),
//         取引区分: '買受',
//         品目: '道具',
//         商品名: p.product_display_name,
//         'エキスパンション+型番': `${p.expansion ?? ''} ${p.cardnumber ?? ''}`,
//         レアリティ: p.rarity,
//         数量: p.item_count,
//         代価: p.total_unit_price * p.item_count,
//         本人確認書類の種類:
//           p.id_kind in ID_KIND_LABELS
//             ? ID_KIND_LABELS[p.id_kind as keyof typeof ID_KIND_LABELS]
//             : 'その他',
//         本人確認番号: p.id_number,
//         取引相手氏名: p.full_name,
//         住所: p.address,
//         年齢: p.age,
//         職業: p.career,
//       };
//     });

//     const csvService = new BackendApiCsvService(API);
//     const fileService = new BackendApiFileService(API);

//     const uploadRes = await fileService.uploadCsvToS3({
//       dirKind: 'transaction',
//       writer: async (passThrough) => {
//         csvService.core.passThrough = passThrough;

//         //@ts-expect-error テンプレート管理外
//         await csvService.core.maker(transactionCarts);
//       },
//     });

//     return {
//       fileUrl: uploadRes,
//     };
//   },
// );

// export enum ID_KIND_LABELS {
//   license = '運転免許証',
//   healthInsurance = '健康保険証',
//   myNumber = 'マイナンバーカード',
//   studentId = '写真付き学生証',
//   alienRegistration = '外国人登録証明書',
//   residentCard = '在留カード',
//   passport = 'パスポート',
//   Unsubmitted = '未提出',
// }
