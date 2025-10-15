import { createClientAPI, CustomError } from '@/api/implement';
import { mycaPosCommonConstants } from '@/constants/mycapos';
import {
  LabelPrinterOptions,
  LabelPrinterTemplate,
} from '@/contexts/LabelPrinterContext';
import { IDocument, IsExtensionInstalled } from '@/modules/brother/bpac';
import { Product, Store, TaxMode } from '@prisma/client';

export class LabelPrinter {
  //テンプレートが格納されているフォルダ

  private static config = {
    templatesDir: {
      app: mycaPosCommonConstants.brotherLabelPrinter.lbxTemplateDir,
      remote: mycaPosCommonConstants.brotherLabelPrinter.remoteTemplateDir,
    },
  };

  private static getTemplateFileUrl(
    size: LabelPrinterOptions['size'],
    template: LabelPrinterTemplate,
  ) {
    //サイズに_を含んでいたらリモート、含んでなかったら通常
    if (size.includes('_')) {
      return `${this.config.templatesDir.remote}${template}/${size}.lbx`;
    } else {
      return `${this.config.templatesDir.app}${template}/${size}.lbx`;
    }
  }

  //クロームの拡張機能のURL
  private static chromeExtensionUrl =
    'https://chrome.google.com/webstore/detail/ilpghlfadkjifilabejhhijpfphfcfhb';

  private static getMediaType = (handle: LabelPrinterOptions['size']) => {
    //_以降は無視
    const value = handle.split('_')[0];
    const splitted = value.split('x');
    return `${splitted[0]}mm x ${splitted[1]}mm`;
  };

  public static getTemplateName = (handle: LabelPrinterTemplate) => {
    switch (handle) {
      case 'product':
        return '在庫ラベル';
      case 'staff':
        return '従業員バーコード';
      case 'customer':
        return '顧客バーコード';
    }
  };

  private static printerOptionDict = {
    cut: {
      do: 0x1,
      not: 0x200,
    },
  };

  //プリントを行う
  public static async doPrint(
    options: LabelPrinterOptions,
    template: LabelPrinterTemplate,
    data: number,
    storeID: Store['id'],
  ): Promise<false | { src: string }> {
    try {
      //拡張機能がインストールされているか確認
      if (!IsExtensionInstalled()) {
        window.open(this.chromeExtensionUrl, '_blank');
        throw new Error();
      }

      console.log(`ラベル印刷オプションは${JSON.stringify(options)}`);
      console.log(`テンプレートは${template}`);

      const clientAPI = createClientAPI();

      // テンプレートを読み込む;
      const openTemplateResult = await IDocument.Open(
        options.labelTemplate
          ? options.labelTemplate // 直接URLを使用
          : this.getTemplateFileUrl(options.size, template),
      );

      if (!openTemplateResult) throw new Error();

      console.log('テンプレートが読み込めました');

      //それぞれのデータをセットしていく

      switch (template) {
        case 'product': {
          if (!data) throw new Error('productIdを指定してください');
          const getProductsRes = await clientAPI.product.listProducts({
            storeID,
            id: data as Product['id'],
          });

          if (getProductsRes instanceof CustomError)
            throw new Error('商品情報が取得できませんでした');

          const productInfos = getProductsRes.products;

          if (!Array.isArray(productInfos) || productInfos.length != 1)
            throw new Error('商品情報が取得できませんでした');

          const thisProductInfo = productInfos[0];

          //ラベル印刷が必要ない商品かどうかを判断
          if (
            !options.isManual &&
            (thisProductInfo.is_buy_only ||
              !thisProductInfo.item_allow_auto_print_label)
          ) {
            // alert('この商品はラベル印刷しない設定になっています');
            return { src: '' };
          }

          console.log(openTemplateResult);

          //バーコード
          let thisIObject: any = await IDocument.GetObject('objBarcode');
          if (thisIObject) {
            thisIObject.Text = String(thisProductInfo.product_code ?? '');
          }

          //バーコード（数字）
          thisIObject = await IDocument.GetObject('objProductCode');
          if (thisIObject) {
            let text = String(thisProductInfo.product_code ?? '');
            if (options.wholesalePrice == 'do') {
              text += `0000${thisProductInfo.average_wholesale_price ?? 0}`;
            }

            console.log(text, 'バーコード文字列');

            thisIObject.Text = text;
          }

          //商品名
          thisIObject = await IDocument.GetObject('objProductName');
          if (thisIObject) {
            thisIObject.Text = `${thisProductInfo.displayNameWithMeta} 
              ${
                thisProductInfo.consignment_client__display_name
                  ? `（${thisProductInfo.consignment_client__display_name}）`
                  : ''
              }`;
          }

          //状態
          thisIObject = await IDocument.GetObject('objProductCondition');
          if (thisIObject) {
            thisIObject.Text = String(
              thisProductInfo.condition_option_display_name ?? '',
            );
          }

          //価格あり、かつ価格なしラベルを矯正されていないときだけ
          if (
            options.product.price == 'withPrice' &&
            !thisProductInfo.force_no_price_label
          ) {
            //税区分
            thisIObject = await IDocument.GetObject('objTaxKind');
            if (thisIObject) {
              thisIObject.Text =
                thisProductInfo.store_tax_mode == TaxMode.INCLUDE
                  ? '税込'
                  : '税別';
            }

            //価格
            thisIObject = await IDocument.GetObject('objProductPrice');
            if (thisIObject) {
              thisIObject.Text = `¥ ${(
                thisProductInfo.specific_sell_price ??
                thisProductInfo.sell_price ??
                0
              ).toLocaleString()}`;
            }
          } else {
            //税区分
            thisIObject = await IDocument.GetObject('objTaxKind');
            if (thisIObject) {
              thisIObject.Text = '';
            }

            //価格
            thisIObject = await IDocument.GetObject('objProductPrice');
            if (thisIObject) {
              thisIObject.Text = '';
            }
          }

          break;
        }

        case 'staff': {
          if (!data) throw new Error('スタッフを指定してください');
          const getAccountsRes = await clientAPI.account.getAccountByStaffCode({
            staffCode: data,
          });

          if (getAccountsRes instanceof CustomError)
            throw new Error('アカウント情報が取得できませんでした');

          const accountInfos = getAccountsRes.accounts;

          if (!Array.isArray(accountInfos) || accountInfos.length != 1)
            throw new Error('アカウント情報が取得できませんでした');

          const thisAccountInfo = accountInfos[0];

          if (!thisAccountInfo.code)
            throw new Error('アカウント情報が取得できませんでした');

          const code = thisAccountInfo.code;
          const displayName = thisAccountInfo.display_name;

          //バーコード
          let thisIObject: any = await IDocument.GetObject('objBarcode');
          if (thisIObject) {
            thisIObject.Text = String(code ?? '');
          }

          //商品名
          thisIObject = await IDocument.GetObject('objStaffName');
          if (thisIObject) {
            thisIObject.Text = displayName;
          }

          break;
        }

        case 'customer': {
          if (!data) throw new Error('顧客を指定してください');
          const getCustomersRes = await clientAPI.customer.getCustomerByID({
            customer_id: data,
            store_id: storeID,
          });

          if (getCustomersRes instanceof CustomError)
            throw new Error('顧客情報が取得できませんでした');

          const customerInfo = getCustomersRes;

          if (!customerInfo || !customerInfo.barcode)
            throw new Error('顧客情報が取得できませんでした');

          const barcode = customerInfo.barcode;
          //バーコード
          const thisIObject: any = await IDocument.GetObject('objBarcode');
          if (thisIObject) {
            thisIObject.Text = String(barcode ?? '');
          }

          break;
        }
      }

      //印刷設定を変える
      if (
        !(await IDocument.SetMediaByName(this.getMediaType(options.size), true))
      )
        throw new Error();

      console.log('印刷設定を変えました');

      //プレビュー用にデータを取得する
      const imageData = (await IDocument.GetImageData(4, 0, 100)) || '';

      //印刷オプション
      let printOption = 0x00010000; //初期値は高品質優先

      //カット設定
      printOption += this.printerOptionDict.cut[options.cut as 'do' | 'not'];

      //プリントを実行する
      const startRes = await IDocument.StartPrint('', printOption);

      // const startRes = await IDocument.StartPrint('', 0);

      const printRes = await IDocument.PrintOut(1, 0);

      const endRes = await IDocument.EndPrint();

      //画像データを返却する
      return {
        src: imageData,
      };
    } catch (e: any) {
      //失敗したら一律falseで返す
      console.log(e);
      alert(`エラー内容：${e.message || e}`);
      return false;
    }
  }
}
