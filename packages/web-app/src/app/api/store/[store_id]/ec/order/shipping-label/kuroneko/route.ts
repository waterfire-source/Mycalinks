//クロネコヤマトの発送用の送り状を作るためのCSVファイルの生成
// ヤマト発送用の送り状CSVの発行

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiCsvService } from '@/api/backendApi/services/csv/main';
import { BackendApiFileService } from '@/api/backendApi/services/file/main';
import { EcOrderCartStoreStatus, Prisma } from '@prisma/client';
import { getEcOrderKuronekoShippingLabelCsvApi } from 'api-generator';
import { AddressUtil, customDayjs } from 'common';

export const GET = BackendAPI.create(
  getEcOrderKuronekoShippingLabelCsvApi,
  async (API, { params, query }) => {
    const whereInput: Array<Prisma.RegisterWhereInput> = [];

    const orderIds = query.order_id.split(',').map((e) => Number(e));

    //とりあえずオーダーの情報を取得する
    const orderCartStores = await API.db.ec_Order_Cart_Store.findMany({
      where: {
        store_id: params.store_id,
        order_id: {
          in: orderIds,
        },
        status: {
          notIn: [
            EcOrderCartStoreStatus.CANCELED,
            EcOrderCartStoreStatus.DRAFT,
          ],
        },
      },
      include: {
        order: true,
      },
    });

    //ヘッダーを作る
    const header = {
      empty1: `お客様管理番号
半角英数字50文字`,
      const1: `送り状種類
半角数字1文字
 0 : 発払い
 2 : コレクト
 3 : クロネコゆうメール
 4 : タイム
 5 : 着払い
 6 : 発払い（複数口）
 7 : クロネコゆうパケット
 8 : 宅急便コンパクト
 9 : 宅急便コンパクトコレクト
 A : ネコポス

(※宅急便_必須項目)
(※ＤＭ便_必須項目)
(※ネコポス_必須項目)
`,
      shippingDate: `出荷予定日
半角10文字
｢YYYY/MM/DD｣で入力してください。

(※宅急便_必須項目)
(※ＤＭ便_必須項目)
(※ネコポス_必須項目)`,
      empty2: `お届け予定日
半角10文字
｢YYYY/MM/DD｣で入力してください。

※入力なしの場合、印字されません。
※「最短日」と入力可`,
      phoneNumber: `お届け先電話番号
半角数字15文字ハイフン含む

(※宅急便_必須項目)
(※ＤＭ便_必須項目)
(※ネコポス_必須項目)`,
      zipCode: `お届け先郵便番号
半角数字8文字
ハイフンなし7文字も可

(※宅急便_必須項目)
(※ＤＭ便_必須項目)
(※ネコポス_必須項目)`,
      address: `お届け先住所
全角/半角
都道府県（４文字）
市区郡町村（１２文字）
町・番地（１６文字）

(※宅急便_必須項目)
(※ＤＭ便_必須項目)
(※ネコポス_必須項目)`,
      building: `お届け先アパートマンション名
全角/半角 
16文字/32文字`,
      fullName: `お届け先名
全角/半角
16文字/32文字 

(※宅急便_必須項目)
(※ＤＭ便_必須項目)
(※ネコポス_必須項目)`,
      merchantPhoneNumber: `ご依頼主電話番号
半角数字15文字ハイフン含む

(※宅急便_必須項目)
(※ネコポス_必須項目)`,
      empty3: `ご依頼主電話番号枝番
半角数字 2文字 `,
      merchantZipCode: `ご依頼主郵便番号
半角数字8文字
ハイフンなし半角7文字も可 

(※宅急便_必須項目)
(※ネコポス_必須項目)`,
      merchantAddress: `ご依頼主住所
全角/半角32文字/64文字
都道府県（４文字）
市区郡町村（１２文字）
町・番地（１６文字）

(※宅急便_必須項目)
(※ネコポス_必須項目)`,
      merchantBuilding: `ご依頼主アパートマンション
全角/半角 16文字/32文字 `,
      merchantFullName: `ご依頼主名
全角/半角 16文字/32文字 

(※宅急便_必須項目)
(※ネコポス_必須項目)`,
      merchantFullNameRuby: `ご依頼主名(ｶﾅ)
半角カタカナ 50文字`,
      empty4: `品名コード１
半角英数字 30文字 `,
      const2: `品名１
全角/半角 25文字/50文字 

(※宅急便_必須項目)
(※ネコポス_必須項目)`,
      empty5: `品名コード２
半角英数字 30文字`,
      empty6: `品名２
全角/半角 25文字/50文字 `,
      empty7: `荷扱い１
全角/半角 10文字/20文字 `,
      empty8: `荷扱い２
全角/半角 10文字/20文字 `,
      empty9: `記事
全角/半角 22文字/44文字`,
      empty10: `ｺﾚｸﾄ代金引換額（税込)
半角数字 7文字

※コレクトの場合は必須
300,000円以下　1円以上
※但し、宅急便コンパクトコレクトの場合は
30,000円以下　　1円以上`,
      empty11: `内消費税額等
半角数字 7文字

※コレクトの場合は必須 
※コレクト代金引換額（税込)以下`,
      empty12: `止置き
半角数字 1文字
0 : 利用しない
1 : 利用する `,
      empty13: `営業所コード
半角数字 6文字

※止置きを利用する場合は必須 `,
      empty14: `発行枚数
半角数字 2文字

※発払いのみ指定可能`,
      empty15: `個数口表示フラグ
半角数字 1文字
1 : 印字する
2 : 印字しない 
3 : 枠と口数を印字する

※宅急便コンパクト、宅急便コンパクトコレクトは対象外`,
      empty16: `請求先顧客コード
半角数字12文字

(※宅急便_必須項目)
(※ネコポス_必須項目)`,
      empty17: `運賃管理番号
半角数字2文字

(※宅急便_必須項目)
(※ネコポス_必須項目)`,
    };

    //行を作っていく
    const rows: Array<Record<keyof typeof header, string>> = orderIds.map(
      (orderId) => {
        const orderCartStore = orderCartStores.find(
          (e) => e.order_id === orderId,
        );

        if (!orderCartStore) {
          throw new ApiError({
            status: 404,
            messageText: 'オーダーが見つかりません',
          });
        }

        const record: Record<keyof typeof header, string> = {
          empty1: '',
          const1: '7',
          shippingDate: '',
          empty2: '',
          phoneNumber: '',
          zipCode: '',
          address: '',
          building: '',
          fullName: '',
          merchantPhoneNumber: '',
          empty3: '',
          merchantZipCode: '',
          merchantAddress: '',
          merchantBuilding: '',
          merchantFullName: '',
          merchantFullNameRuby: '',
          empty4: '',
          const2: 'トレーディングカード',
          empty5: '',
          empty6: '',
          empty7: '',
          empty8: '',
          empty9: '',
          empty10: '',
          empty11: '',
          empty12: '',
          empty13: '',
          empty14: '',
          empty15: '',
          empty16: '',
          empty17: '',
        };

        const customerAddress = new AddressUtil(
          (orderCartStore.order.customer_address_info_json ||
            {}) as AddressUtil.Info,
        );

        Object.keys(record).forEach((key) => {
          const prop = key as keyof typeof record;
          const a = customerAddress.info!;
          const s = API.resources.store!;
          switch (prop) {
            case 'shippingDate':
              record.shippingDate = customDayjs().tz().format('YYYY/MM/DD');
              break;
            case 'phoneNumber':
              record.phoneNumber = a.phoneNumber;
              break;
            case 'zipCode':
              record.zipCode = a.zipCode;
              break;
            case 'address':
              record.address = `${a.prefecture} ${a.city} ${a.address2}`;
              break;
            case 'building':
              record.building = a.building;
              break;
            case 'fullName':
              record.fullName = a.fullName;
              break;
            case 'merchantPhoneNumber':
              record.merchantPhoneNumber = s.phone_number ?? '';
              break;
            case 'merchantZipCode':
              record.merchantZipCode = s.zip_code ?? '';
              break;
            case 'merchantAddress':
              record.merchantAddress = s.full_address ?? '';
              break;
            // case 'merchantBuilding':
            //   record.merchantBuilding = s. ?? '';
            //   break;
            case 'merchantFullName':
              record.merchantFullName = s.display_name ?? '';
              break;
            // case 'merchantFullNameRuby':
            //   record.merchantFullNameRuby = s.full_name_ruby ?? '';
            //   break;
          }
        });

        return record;
      },
    );

    //CSVを作っていく
    const csvService = new BackendApiCsvService(API);
    const fileService = new BackendApiFileService(API);

    //@ts-expect-error テンプレート管理外
    const csvData = await csvService.core.maker(rows, false, header);

    const uploadRes = await fileService.uploadCsvToS3({
      dirKind: 'ec',
      fileData: csvData,
    });

    return {
      fileUrl: uploadRes,
    };
  },
);
