import { createObjectCsvStringifier } from 'csv-writer';
import {
  Item,
  Item_Category,
  Item_Category_Condition_Option,
  Item_Genre,
  Product,
  Specialty,
  Supplier,
} from '@prisma/client';
import { BackendCoreError } from '@/error/main';
import { BackendService } from '@/services/internal/main';
import { parse as csvParser } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { PassThrough } from 'stream';

// const { csvTemplateKinds } = mycaPosCommonConstants;

//CSV関係のユーティリティ

export class BackendCoreCsvService<
  TemplateName extends keyof CsvTemplateType,
  T extends CsvTemplateType[TemplateName],
> extends BackendService {
  public rule = {
    //CSVユーティリティ上でのルール
    keywords: {
      dataStart: 'この下の行からデータ開始',
      handleStart: 'ハンドル名',
    },
    bom: {
      utf8: new Uint8Array([0xef, 0xbb, 0xbf]),
    },
    mimetype: 'text/csv',
  };

  public dataRecord!: T;

  //書き込み用
  public writingStarted: boolean = false;
  public passThrough?: PassThrough;

  constructor(public templateName?: TemplateName) {
    super();
  }

  public parseCsv = (fsData: Buffer<ArrayBufferLike> | null) => {
    const parsed: Array<Array<string>> = csvParser(fsData || '', { bom: true });

    return parsed;
  };

  /**
   * テンプレートをダウンロードして、headerDataと、データ開始前のCSVデータを返す
   */
  private getTemplate = async () => {
    // テンプレートファイルのパスを構築
    const templatePath = `./public/templates/csv/${this.templateName}.csv`;

    let fsData: Buffer<ArrayBufferLike>;
    try {
      // ファイルシステムからテンプレートを読み込む
      fsData = readFileSync(templatePath);
    } catch (error) {
      throw new BackendCoreError({
        internalMessage: `CSVテンプレート「${this.templateName}」の読み込みに失敗しました: ${error}`,
        externalMessage: 'CSVテンプレートの読み込みに失敗しました',
      });
    }

    // CSVデータをパース
    const parsed = this.parseCsv(fsData);

    const belowIndex = parsed.findIndex(
      (e: Array<any>) => e.length && e[0] == this.rule.keywords.dataStart,
    );

    const indexIndex = parsed.findIndex(
      (e: Array<any>) => e.length && e[0] == this.rule.keywords.handleStart,
    );

    //むしろデータ手前を取得
    const beforeData: Array<Array<string>> =
      belowIndex > -1 ? parsed.slice(0, belowIndex + 1) : parsed;

    const beforeDataStringified = beforeData.map((e) => e.join(',')).join('\n');

    const columns = parsed[indexIndex + 1];

    const headerData = columns.map((e) => ({
      id: e,
      title: e,
    })) as Array<{ id: string; title: string }>;

    return {
      headerData,
      beforeDataStringified,
    };
  };

  /**
   * データからCSVファイルを作成する関数ファイルデータを作成して返す
   * パススルーが指定されている場合、ストリーミング書き出し
   * @param data - CSVファイル化したいデータ
   * @returns - 文字列化したデータ
   */
  public async maker(
    data: Array<T>,
    onTemplate?: boolean,
    headers?: Record<keyof T, string>,
  ): Promise<Buffer> {
    if (!data.length)
      throw new BackendCoreError({
        internalMessage:
          '指定された条件では対象のデータは1つも見つかりませんでした',
        externalMessage:
          '指定された条件では対象のデータは1つも見つかりませんでした',
      });

    if (!this.passThrough) {
      console.log(
        `パススルーが指定されていないので、ストリーミング書き出しを無効にします`,
      );
    }

    let csvStringified = '';

    //onTemplateが指定されていたらテンプレートの上にデータを載せる
    if (onTemplate) {
      //テンプレート取得
      const { headerData, beforeDataStringified } = await this.getTemplate();

      const writer = createObjectCsvStringifier({
        header: headerData,
      });

      const bodyStringified = writer.stringifyRecords(data);

      if (this.passThrough && !this.writingStarted) {
        //最初にbomを書き出す
        this.passThrough.write(this.rule.bom.utf8);
        this.writingStarted = true;

        //上もつける
        csvStringified = beforeDataStringified + '\n';
      }

      csvStringified += bodyStringified;
    } else {
      //ヘッダー
      const headerData = Object.keys(headers || data[0]).map((e) => ({
        id: e,
        title: headers ? headers[e as keyof T] : e,
      }));

      const writer = createObjectCsvStringifier({
        header: headerData,
      });

      const bodyStringified = writer.stringifyRecords(data);
      const headerStringified = writer.getHeaderString();

      if (this.passThrough && !this.writingStarted) {
        //最初にbomを書き出す
        this.passThrough.write(this.rule.bom.utf8);
        this.writingStarted = true;

        //上もつける
        csvStringified = String(headerStringified);
      } else if (!this.passThrough) {
        //パススルーがなかったらヘッダーを普通につける
        csvStringified = String(headerStringified);
      }

      csvStringified += bodyStringified;
    }

    //bomをのせてblob化する
    const blob = new Blob([this.rule.bom.utf8, csvStringified], {
      type: this.rule.mimetype,
    });

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (this.passThrough) {
      this.passThrough.write(csvStringified);
    }

    return buffer;
  }
}

/**
 * CSVテンプレートの型
 */
export type CsvTemplateType = {
  item: {
    id: Item['id'];
    myca_item_id: Item['myca_item_id'];
    display_name: Item['display_name'];
    display_name_ruby: Item['display_name_ruby'];
    expansion: Item['expansion'];
    cardnumber: Item['cardnumber'];
    rarity: Item['rarity'];
    pack_name: Item['pack_name'];
    keyword: Item['keyword'];
    readonly_product_code: Item['readonly_product_code'];
    order_number: Item['order_number'];
    genre_display_name: Item_Genre['display_name'];
    category_display_name: Item_Category['display_name'];
    sell_price: Item['sell_price'];
    buy_price: Item['buy_price'];
    is_buy_only: number;
    allow_auto_print_label: number;
    tablet_allowed: number;
    infinite_stock: number;
    disallow_round: number;
    hidden: number;
  };
  product: {
    id: Product['id'];
    product_code: number;
    item_id: Product['item_id'];
    myca_item_id: Item['myca_item_id'];
    display_name: Product['display_name'];
    condition_option_display_name: Item_Category_Condition_Option['display_name'];
    specific_sell_price: Product['specific_sell_price'];
    specific_buy_price: Product['specific_buy_price'];
    sell_price: Product['sell_price'];
    buy_price: Product['buy_price'];
    average_wholesale_price: Product['average_wholesale_price'];
    minimum_wholesale_price: Product['minimum_wholesale_price'];
    maximum_wholesale_price: Product['maximum_wholesale_price'];
    readonly_product_code: Product['readonly_product_code'];
    genre_display_name: Item_Genre['display_name'];
    category_display_name: Item_Category['display_name'];
    specialty_display_name: Specialty['display_name'] | null;
    tablet_allowed: Product['tablet_allowed'];
    stock_number: Product['stock_number'];
    stocking_item_count: number;
    stocking_wholesale_price: number;
    supplier_display_name: Supplier['display_name'];
    label_print_count: number;
    label_product_option: string;
    label_cutting_option: string;
    mycalinks_ec_enabled: Product['mycalinks_ec_enabled'];
    ochanoko_product_id: Product['ochanoko_product_id'];
    shopify_product_id: Product['shopify_product_id'];
    shopify_product_variant_id: Product['shopify_product_variant_id'];
    shopify_inventory_item_id: Product['shopify_inventory_item_id'];
    upload_error: string;
  };
};
