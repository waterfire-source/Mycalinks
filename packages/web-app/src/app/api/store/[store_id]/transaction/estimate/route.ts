// import { BackendAPI, ResponseMsgKind } from '@/api/backendApi/main';
// import { BackendEposClient } from '@/api/backendApi/model/receipt';
// import { storeSetting } from '@/constants/store';
// import { type apiPrivilegesType } from '@/types/BackendAPI';
// import { AccountKind, Product } from '@prisma/client';
// import dayjs from 'dayjs';
// import { type NextRequest } from 'next/server';
// import { ApiError } from '@/api/backendApi/error/apiError';

// //見積もり書の作成
// //取引IDによって作成できるようにしたい
// //レシート印刷APIに統合したため廃止する
// export const POST = ApiError.errorWrapper(
//   async (req: NextRequest, { params }: any) => {
//     const apiDef: apiPrivilegesType = {
//       privileges: {
//         role: [AccountKind.corp], //アカウントの種類がuserなら権限に関わらず実行できる
//         policies: [], //実行に必要なポリシー
//       },
//     };

//     const API = await BackendAPI.setUp(req, params, apiDef);

//     const {
//       staff_account_id,
//       customer_id, //独自の顧客ID ゆくゆくは紐づいているMycaユーザーのアプリ上に見積もりを送信する
//       total_price,
//       subtotal_price,
//       // tax,
//       description,
//       carts,
//     } = API.body;

//     const { store_id } = API.params;

//     //見積書を作っていく

//     //商品の情報
//     const productsInfoRaw = await API.db.product.findMany({
//       where: {
//         store_id: parseInt(store_id || '0'),
//         id: {
//           in: carts.map((e: any) => e.product_id),
//         },
//       },
//       include: {
//         conditions: {
//           include: {
//             condition_option: true,
//           },
//         },
//         item: {
//           select: {
//             rarity: true,
//             cardnumber: true,
//             expansion: true,
//           },
//         },
//       },
//     });

//     const productsInfo = BackendAPI.useFlat(productsInfoRaw);

//     if (!productsInfo.length) throw new ApiError('notEnough');

//     //担当者の情報
//     // const staffAccountInfo = await API.db.account.findFirst({
//     //   where: {
//     //     id: parseInt(staff_account_id || '0'),
//     //   },
//     // });

//     //レジの情報
//     const registerAccountInfo = await API.db.account.findUnique({
//       where: {
//         id: parseInt(API.user?.id || '0'),
//       },
//     });

//     //ストアの情報
//     const thisStoreInfo = API.resources.store;

//     //カートの情報に統合する
//     // productsInfo.forEach((each: Product) => {
//     //   const cartInfo = carts.find((cart: any) => cart.product_id == each.id);

//     //   each = Object.assign(each, cartInfo);
//     // });

//     carts.forEach((cart: any) => {
//       const productInfo = productsInfo.find(
//         (e: Product) => e.id == cart.product_id,
//       );

//       cart = Object.assign(cart, productInfo);
//     });

//     let estimateCommand: string | boolean = '';

//     let receiptCommandBody: string = '';

//     const receiptUtil = new BackendEposClient(API);

//     //情報
//     const infoCommand = `
//   ${receiptUtil.thanks.estimate}
//   ${receiptUtil.makeRow(dayjs().tz().format('YYYY年MM月DD日 HH:mm:ss'), `端末:${registerAccountInfo?.id}`)}
//   ${receiptUtil.makeRow(`レジ:${registerAccountInfo?.id}`, customer_id && `会員番号:${customer_id}`)}
//   ${receiptUtil.makeRow(`登録番号:${API.resources.corporation?.invoice_number}`)}
//   ${receiptUtil.hr}
//   `;

//     //カートの中身
//     const cartsCommand =
//       carts
//         .map(
//           (p: any) => `
//   ${receiptUtil.makeProduct(p)}
//   `,
//         )
//         .join('') + receiptUtil.hr;

//     const itemTotalCount = carts.reduce(
//       (curSum: number, p: any) => curSum + p.item_count,
//       0,
//     );
//     // const subTotalPrice = t.transaction_carts.reduce((curSum: number, p: any) => curSum + p.unit_price * p.item_count, 0)
//     const subTotalPrice = subtotal_price || 0;

//     //小計など
//     const priceInfoCommand = `
//   ${receiptUtil.makeRow(`合計`, `${itemTotalCount}点    ¥${total_price.toLocaleString()}`)}
//   ${receiptUtil.makeRow('(内税額', `¥${Math.floor(total_price / ((storeSetting.tax + 1) * 10)).toLocaleString()})`)}
//   ${receiptUtil.hr}
//   `;

//     const descriptionCommand = `
//   ${receiptUtil.makeTitle('備考：')}
//   ${receiptUtil.spacer}
//   ${description}
//   ${receiptUtil.spacer}
//   ${receiptUtil.hr}
//   `;

//     receiptCommandBody += infoCommand + cartsCommand + priceInfoCommand;

//     estimateCommand = await receiptUtil.makeReceiptCommand(receiptCommandBody);

//     return API.status(201).response({ data: { estimateCommand } }); //Mycaのアプリに送信したら、その情報もここに記すようにする
//   },
// );
