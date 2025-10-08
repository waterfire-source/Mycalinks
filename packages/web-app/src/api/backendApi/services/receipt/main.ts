import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import { htmlEncode } from 'js-htmlencode';
import { Transaction, TransactionKind } from '@prisma/client';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { BackendImageUtil, BackendService } from 'backend-core';
import { PNG } from 'pngjs';

// \nなどの改行コードも除く
const escaper = (str: string) => htmlEncode(str.replace(/\r?\n/g, ''));

/**
 * レシート生成（EPOSコマンド）
 */
export class BackendApiReceiptService extends BackendApiService {
  constructor(API: BackendAPI<any>) {
    super(API);
  }

  public config = {
    logoWidth: 300,
    columnLength: 48,
  };

  /**
   * 行を作るための関数
   * @param left 左側の文字列
   * @param right 右側の文字列
   * @returns 行のコマンド
   */
  public makeRow = (left: string, right: string = '') => {
    left = String(left || '');
    right = String(right || '');

    let rowString: string = '';

    //rightが指定されている場合、leftに割り当てられる文字数を取得する
    const rightWidth = this.getTextWidth(right);

    const leftAllowedWidth = rightWidth
      ? this.config.columnLength - rightWidth - 1
      : this.config.columnLength;

    //leftの文字列を決定
    let leftString: string = '';

    for (const c of String(left)) {
      const candidate = leftString + c;
      if (this.getTextWidth(candidate) > leftAllowedWidth) {
        break;
      } else {
        leftString = candidate;
      }
    }

    //余った部分
    const remainLeft = left.replace(leftString, '');

    //間に入れる半角スペースの数を測定
    const spacerWidth = Math.max(
      0,
      this.config.columnLength - rightWidth - this.getTextWidth(leftString),
    );

    rowString = remainLeft
      ? `${leftString}${' '.repeat(spacerWidth)}${right} ${remainLeft}`
      : `${leftString}${' '.repeat(spacerWidth)}${right}`;

    //コマンドを作成
    return `
    <text align="left"/>
    <text lang="ja"/>
    <text>${escaper(rowString)}\n</text>
    `;
  };

  /**
   * 行を作るための関数
   * @param value 文字列
   */
  public makeFreeText = (value: string) => {
    //コマンドを作成
    return `
    <text align="left"/>
    <text lang="ja"/>
    <text>${escaper(value)}\n</text>
    `;
  };

  //分割線を入れる（hlineコマンドだと何故か反映されないため文字で攻める
  public get hr() {
    return `
    <text>________________________________________________\n</text>
    <feed unit="8"/>
    `;
  }

  //ありがとうございます系
  public get thanks() {
    return {
      sell: `
    ${this.tinySpacer}
    ${this.makeCenter('お買い上げありがとうございます！')}
    ${this.hr}
    `,
      purchaseForm: `
    ${this.tinySpacer}
    ${this.makeCenter('買取受付用QRコード')}
    ${this.hr}
    `,
      reservationForm: `
    ${this.tinySpacer}
    ${this.makeCenter('予約受付用QRコード')}
    ${this.hr}
    `,
      purchaseReceptionNumber: `
    ${this.tinySpacer}
    ${this.makeCenter('買取受付番号')}
    ${this.hr}
    `,
      saleReceptionNumber: `
    ${this.tinySpacer}
    ${this.makeCenter('受付番号')}
    ${this.hr}
    `,
      buy: `
    ${this.tinySpacer}
    ${this.makeCenter('《買取承諾書》')}
    ${this.hr}
    `,
      ryoshu: `
    ${this.tinySpacer}
    ${this.makeCenter('《領収書》')}
    ${this.hr}
    `,
      reservation: `
    ${this.tinySpacer}
    ${this.makeCenter('《予約票》')}
    ${this.hr}
    `,
      buyForCustomer: `
    ${this.tinySpacer}
    ${this.makeCenter('《精算レシート》')}
    ${this.hr}
    `,
      estimate: `
    ${this.tinySpacer}
    ${this.makeCenter('《買取見積書》')}
    ${this.hr}
    `,
      settlement: `
    ${this.tinySpacer}
    ${this.makeCenter('《精算》')}
    ${this.hr}
    `,
      close: `
    ${this.tinySpacer}
    ${this.makeCenter('《閉店レシート》')}
    ${this.hr}
    `,
    };
  }

  //中央寄せ
  public makeCenter(text: string, big?: boolean) {
    return `
    <text align="center"/>
    <text lang="ja"/>
    ${
      big
        ? `
      <text width="5" height="5"/>
      <text smooth="true"/>
    `
        : ''
    }
    <text>${escaper(text)}\n</text>
    ${
      big
        ? `
      <text width="1" height="1"/>
      <text smooth="false"/>
    `
        : ''
    }
    `;
  }

  //タイトル
  public makeTitle(title: string) {
    return `
    ${this.hr}
    ${this.makeRow(title)}
    ${this.hr}
    `;
  }

  //商品
  public makeProduct(
    p: any,
    prefix: string = '',
    transaction_kind: Transaction['transaction_kind'] = TransactionKind.sell,
  ) {
    let discountMsg = '';

    const basePrice = p.total_unit_price;
    const unitPrice = p.unit_price;

    //セール
    if (p.sale_discount_price) {
      discountMsg += `
      ${this.makeRow(
        `セール:${p.sale__display_name}`,
        `${p.sale_discount_price > 0 ? '+' : '-'} ¥${Math.abs(
          p.sale_discount_price,
        ).toLocaleString()} ${p.item_count > 1 ? `×${p.item_count}` : ''}　`,
      )}
      `;
    }

    if (p.discount_price) {
      discountMsg += `
      ${this.makeRow(
        transaction_kind == TransactionKind.sell ? '割引' : '割増',
        `${p.discount_price > 0 ? '+' : '-'} ¥${Math.abs(
          p.discount_price,
        ).toLocaleString()} ${p.item_count > 1 ? `×${p.item_count}` : ''}　`,
      )}
      `;
    }

    const productModel = new BackendApiProductService(this.API);
    this.give(productModel);
    const productNameWithMeta = productModel.core.getProductNameWithMeta({
      management_number: null,
      consignment_client: {
        display_name_on_receipt:
          p[`${prefix}consignment_client__display_name_on_receipt`],
        display_name: p[`${prefix}consignment_client__display_name`],
      },
      display_name: p[`${prefix}display_name`],
      specialty: {
        display_name: p[`${prefix}specialty__display_name`],
      },
      item: {
        expansion: p[`${prefix}item__expansion`],
        cardnumber: p[`${prefix}item__cardnumber`],
        rarity: p[`${prefix}item__rarity`],
      },
    });

    return `
    ${this.makeRow(p[`${prefix}product_code`])}
    ${this.makeRow(
      `${productNameWithMeta}`,
      `${
        p[`${prefix}condition_option__display_name`]
          ? p[`${prefix}condition_option__display_name`]
          : ''
      } ¥${unitPrice.toLocaleString()} ${
        p.item_count > 1 ? `×${p.item_count}` : ''
      } 内`,
    )}
    ${
      p.item_count > 1
        ? this.makeRow(`@${basePrice.toLocaleString()} ×${p.item_count}`)
        : ''
    }
    ${discountMsg}
    ${this.spacer}
    `;
  }

  /**
   * レシート生成
   * @param innerCommand 内部コマンド
   * @param noFooter フッターを出力しないかどうか
   * @returns レシートのコマンド
   */
  @BackendService.WithIds(['storeId'])
  @BackendService.WithResources(['store'])
  public async makeReceiptCommand(
    innerCommand: string,
    noFooter: boolean = false,
  ) {
    const thisStoreInfo = this.API.resources.store!;

    let resultCommand: string = '';

    //通常のレシートの場合
    resultCommand = ``;

    const header = `
    ${this.spacer}
    ${
      thisStoreInfo.receipt_logo_url
        ? await this.logoUrlToImage(thisStoreInfo.receipt_logo_url)
        : ''
    }
    ${this.tinySpacer}
    ${this.makeCenter(thisStoreInfo.display_name || '')}
    ${this.hr}
    `;

    const footer = `
${this.spacer}
${this.spacer}
${this.hr}
${this.spacer}
${this.makeCenter(`〒${thisStoreInfo.zip_code}`)}
${this.makeCenter(`${thisStoreInfo.full_address}`)}
${this.spacer}

${this.makeCenter('カード管理アプリMycalinks')}
${this.makeQr('https://myca.cards')}


${this.spacer}
${this.spacer}
`;

    resultCommand += `${header}${innerCommand}${noFooter ? '' : footer}`;

    return resultCommand;
  }

  //スペーサー
  public get spacer() {
    return `
    <text> \n</text>
    `;
  }

  //ミニスペーサー
  public get tinySpacer() {
    return `
    <feed unit="10"/>
    `;
  }

  //QRコード挿入
  public makeQr(url: string, width: number = 5) {
    return `
    <text align="center"/>
    <symbol type="qrcode_model_2" level="default" width="${width}" height="0" size="0">${escaper(
      url,
    )}</symbol>
    `;
  }

  //バーコード挿入
  public makeBarcode(value: number) {
    return `
    <text align="center"/>
    <barcode type="code128_auto" hri="none" font="font_a" width="3" height="80">${escaper(
      String(value),
    )}</barcode>
    `;
  }

  /**
   * 収入印紙を表示するメソッド
   * @param amount 金額（収入印紙が必要かどうかの判定に使用）
   * @param paymentMethod 決済方法（現金決済の場合のみ収入印紙を表示）
   * @returns 収入印紙のコマンド
   */
  public makeRevenueStamp(amount: number, paymentMethod?: string) {
    // 収入印紙が必要な条件：5万円以上かつ現金決済
    const isStampRequired = amount >= 50000 && paymentMethod === 'cash';

    if (!isStampRequired) {
      return '';
    }

    return `
    ${this.spacer}
    ${this.makeCenter('収入印紙')}
    ${this.spacer}
    ${this.makeCenter('┌─ ─ ─ ─ ─ - ┐')}
    ${this.makeCenter('│                 │')}
    ${this.makeCenter('│                 │')}
    ${this.makeCenter('│                 │')}
    ${this.makeCenter('│      印紙       │')}
    ${this.makeCenter('│                 │')}
    ${this.makeCenter('│                 │')}
    ${this.makeCenter('│                 │')}
    ${this.makeCenter('└─ ─ ─ ─ ─ - ┘')}
    ${this.spacer}
    `;
  }

  //画像URLをロゴ用にリサイズし、モノクロ化してそれをcanvasにしてからimageコマンドにする
  public logoUrlToImage = async (url: string) => {
    //画像データをBufferにする

    const resizedBuffer = await BackendImageUtil.logoUrlToPng(url);

    const png = PNG.sync.read(resizedBuffer.buffer!);
    const clampedArray = Uint8ClampedArray.from(png.data);

    //グレースケールに
    const raster = this.toMonoImage({
      data: clampedArray,
      width: png.width,
      height: png.height,
    });

    //バイナリに
    const binaryData = this.toBase64Binary(raster);

    //コマンドに
    const cmd = `
    <text align="center"/>
    <image width="${png.width}" height="${png.height}" color="color_1" mode="mono">${binaryData}</image>
    `;

    return cmd;
  };

  private toMonoImage(
    imgdata: {
      data: Uint8ClampedArray;
      width: number;
      height: number;
    },
    s = 0,
    g = 1,
  ) {
    let x = String.fromCharCode,
      m8 = [
        [2, 130, 34, 162, 10, 138, 42, 170],
        [194, 66, 226, 98, 202, 74, 234, 106],
        [50, 178, 18, 146, 58, 186, 26, 154],
        [242, 114, 210, 82, 250, 122, 218, 90],
        [14, 142, 46, 174, 6, 134, 38, 166],
        [206, 78, 238, 110, 198, 70, 230, 102],
        [62, 190, 30, 158, 54, 182, 22, 150],
        [254, 126, 222, 94, 246, 118, 214, 86],
      ],
      d = imgdata.data,
      w = imgdata.width,
      h = imgdata.height,
      r = new Array(((w + 7) >> 3) * h),
      n = 0,
      p = 0,
      q = 0,
      t = 128,
      e = [],
      e1,
      e2,
      b,
      v,
      f,
      i,
      j;
    if (s == 1) {
      i = w;
      while (i--) {
        e.push(0);
      }
    }
    for (j = 0; j < h; j++) {
      e1 = 0;
      e2 = 0;
      i = 0;
      while (i < w) {
        b = i & 7;
        if (s == 0) {
          t = m8[j & 7][b];
        }
        v =
          (Math.pow(
            (((d[p++] * 0.29891 + d[p++] * 0.58661 + d[p++] * 0.11448) * d[p]) /
              255 +
              255 -
              d[p++]) /
              255,
            1 / g,
          ) *
            255) |
          0;
        if (s == 1) {
          v += (e[i] + e1) >> 4;
          f = v - (v < t ? 0 : 255);
          if (i > 0) {
            e[i - 1] += f;
          }
          e[i] = f * 7 + e2;
          e1 = f * 5;
          e2 = f * 3;
        }
        if (v < t) {
          n |= 128 >> b;
        }
        i++;
        if (b == 7 || i == w) {
          r[q++] = x(n == 16 ? 32 : n);
          n = 0;
        }
      }
    }
    return r.join('');
  }

  private toBase64Binary(s: string) {
    let l = s.length,
      r = new Array(((l + 2) / 3) << 2),
      t = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
      p = (3 - (l % 3)) % 3,
      j = 0,
      i = 0,
      n;
    s += '\x00\x00';
    while (i < l) {
      n =
        (s.charCodeAt(i++) << 16) |
        (s.charCodeAt(i++) << 8) |
        s.charCodeAt(i++);
      r[j++] = t.charAt((n >> 18) & 63);
      r[j++] = t.charAt((n >> 12) & 63);
      r[j++] = t.charAt((n >> 6) & 63);
      r[j++] = t.charAt(n & 63);
    }
    while (p--) {
      r[--j] = '=';
    }
    return r.join('');
  }

  private getTextWidth = (s: string) => {
    return [...String(s)].reduce(
      (curSum, c) => curSum + (this.isHankaku(c) ? 1 : 2),
      0,
    );
  };

  private isHankaku = (s: string) =>
    !s.match(/[^\x01-\x7E]/) || !s.match(/[^\uFF65-\uFF9F]/);
}
