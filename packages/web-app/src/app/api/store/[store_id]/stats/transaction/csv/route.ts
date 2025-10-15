// 過去の取引の詳細をCSVで取得する（古物台帳）

import { BackendAPI } from '@/api/backendApi/main';
import { getTransactionStatsCsvApi } from 'api-generator';
import { customDayjs } from 'common';
import { BackendApiCsvService } from '@/api/backendApi/services/csv/main';
import { BackendApiFileService } from '@/api/backendApi/services/file/main';

//一旦買取用
export const GET = BackendAPI.create(
  getTransactionStatsCsvApi,
  async (API, { params, query }) => {
    const startDay = customDayjs(query.target_day_gte)
      .tz()
      .format('YYYY-MM-DD');
    const endDay = customDayjs(query.target_day_lte).tz().format('YYYY-MM-DD');

    //dwhのfactレコードから取得していく
    const selectRes = await API.db.$queryRaw<
      {
        transaction_finished_at: string;
        transaction_kind: string;
        product_display_name: string;
        expansion: string;
        cardnumber: string;
        rarity: string;
        item_count: number;
        total_unit_price: number;
        id_kind: string;
        id_number: string;
        full_name: string;
        address: string;
        age: number;
        career: string;
      }[]
    >`
    SELECT
      transaction_finished_at,
      transaction_kind,
      product_display_name,
      expansion,
      cardnumber
      rarity,
      item_count,
      total_unit_price,
      id_kind,
      id_number,
      full_name,
      address,
      age,
      career
    FROM Fact_Transaction_Product
    INNER JOIN Dim_Transaction_Customer ON Fact_Transaction_Product.transaction_id = Dim_Transaction_Customer.transaction_id
    WHERE store_id = ${params.store_id}
    AND Fact_Transaction_Product.transaction_kind = 'buy'
    AND Fact_Transaction_Product.target_day >= ${startDay}
    AND Fact_Transaction_Product.target_day <= ${endDay}
    `;

    //一つずつラベリングしていく
    const transactionCarts = selectRes.map((p) => {
      return {
        取引日: customDayjs(p.transaction_finished_at)
          .tz()
          .format('YYYY/MM/DD'),
        取引区分: '買受',
        品目: '道具',
        商品名: p.product_display_name,
        'エキスパンション+型番': `${p.expansion ?? ''} ${p.cardnumber ?? ''}`,
        レアリティ: p.rarity,
        数量: p.item_count,
        代価: p.total_unit_price * p.item_count,
        本人確認書類の種類:
          p.id_kind in ID_KIND_LABELS
            ? ID_KIND_LABELS[p.id_kind as keyof typeof ID_KIND_LABELS]
            : 'その他',
        本人確認番号: p.id_number,
        取引相手氏名: p.full_name,
        住所: p.address,
        年齢: p.age,
        職業: p.career,
      };
    });

    const csvService = new BackendApiCsvService(API);
    const fileService = new BackendApiFileService(API);

    const uploadRes = await fileService.uploadCsvToS3({
      dirKind: 'transaction',
      writer: async (passThrough) => {
        csvService.core.passThrough = passThrough;

        //@ts-expect-error テンプレート管理外
        await csvService.core.maker(transactionCarts);
      },
    });

    return {
      fileUrl: uploadRes,
    };
  },
);

export enum ID_KIND_LABELS {
  license = '運転免許証',
  healthInsurance = '健康保険証',
  myNumber = 'マイナンバーカード',
  studentId = '写真付き学生証',
  alienRegistration = '外国人登録証明書',
  residentCard = '在留カード',
  passport = 'パスポート',
  Unsubmitted = '未提出',
}
