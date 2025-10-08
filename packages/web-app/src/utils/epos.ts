export interface ePosDevice {
  connect: (
    host: string,
    port: string,
    callback: (connResult: string) => void,
  ) => void; //eposネットワークに接続する関数
  ondisconnect: () => void; //接続が切れた時
  disconnect: () => void;
  isConnected: () => boolean;

  //デバイスに接続する時
  createDevice: (
    deviceId: string,
    deviceType: string,
    options: Record<string, unknown>,
    callback: (deviceObj: any, errorCode: string) => void,
  ) => void;
  DEVICE_TYPE_DISPLAY: string;
  DEVICE_TYPE_PRINTER: string;
}

export type eposDeviceKind = 'display' | 'printer';

/**
 * プリンターのステータス
 */
export type EPosStatus = {
  printer: {
    canPrint: boolean; //プリントができる状態かどうか
    power: boolean; //これがfalseになったら再接続し直す
    online: boolean; //オンラインかどうか falseだと印刷できない
    cover: boolean; //カバーが開いてるかどうか
    paper: boolean; //用紙が入ってるかどうか
  };
};

export type EposEventArgs = {
  type: 'statusChange' | 'actionFailed';
  restart?: boolean;
  status: EPosStatus;
  description: string;
};

export type PrinterEventCallback = (args: EposEventArgs) => void;

interface customWindow extends Window {
  epson: {
    ePOSDevice: any;
  };
}
declare let window: customWindow;

type devices = {
  printer: any;
  display: any;
};

import { createClientAPI, CustomError } from '@/api/implement';
import { isHankaku } from '@/utils/common';
import { MycalinksConnectorReceipt } from '@/utils/mycalinksConnector/receipt/main';
import { Store } from '@prisma/client';
import { MycaPosApiClient } from 'api-generator/client';
import { sleep } from 'common';
export class EposClient {
  //以下、EPOS SDKを使って頑張りたい時

  private rule = {
    //ユーザーがカスタマイズする必要のない、決まりなど
    connection: {
      port: '8043', //SSL通信のため、ポートは8043固定
      epsonDomain: 'omnilinkcert.epson.biz', //ネットワーク接続用親ドメイン
    },
    device: {
      options: { crypto: false, buffer: false },
      display: {
        id: 'local_display',
        label: 'カスタマーディスプレイ',
        typeHandle: 'DEVICE_TYPE_DISPLAY',
      },
      printer: {
        id: 'local_printer',
        label: 'レシートプリンター',
        typeHandle: 'DEVICE_TYPE_PRINTER',
      },
    },
  } as const;

  //@ts-expect-error becuase of because of
  private ePosDev: ePosDevice;
  private connector: MycalinksConnectorReceipt;

  public status: EPosStatus = {
    printer: {
      canPrint: false,
      power: true,
      online: true,
      cover: true,
      paper: true,
    },
  };

  // public storeId?: Store['id'];

  public devices: devices = {
    printer: null,
    display: null,
  };

  //コンストラクタでePOSDeviceに接続
  constructor(
    private setting: {
      connectionMode: 'connector' | 'lan' | 'child';
      port: string;
      serialCode: string;
    },
  ) {
    console.log('コンストラクタ', this.setting);
    this.connector = new MycalinksConnectorReceipt(this.setting.port);

    if (!window.epson) {
      console.error('SDKが読み込めてません');
      return;
    }

    this.ePosDev = new window.epson.ePOSDevice() as ePosDevice;

    //画面から離れる時にdisconnectする
    if (this.setting.connectionMode === 'lan') {
      window.addEventListener('beforeunload', () => {
        this.ePosDev.disconnect();
        console.info(
          '画面から離れようとしているため、プリンターネットワークへのコネクションを切断しました',
        );
      });
    }
  }

  //セットアップでシリアルコードを入力し、すぐにプリンターネットワークに接続する
  public async setUp() {
    //モードによって処理を切り替える
    switch (this.setting.connectionMode) {
      case 'lan': {
        const hostName = await this.hostName;

        ///一度切断する
        this.ePosDev.disconnect();

        //接続する
        return new Promise((resolve, reject) => {
          this.ePosDev.connect(hostName, this.rule.connection.port, (res) => {
            if (res.includes('OK')) {
              console.log('プリンターネットワークへの接続に成功しました');
              console.log(this.ePosDev);
              resolve('');
            }
            reject('ネットワークへの接続に失敗しました：' + res);
          });
        });
      }
      case 'connector': {
        //疎通確認のみ
        await this.connector.setUp();
        break;
      }
      case 'child': {
        //特に何もしなくても通す
        break;
      }
    }
  }

  //デバイスへ接続する関数
  public async createDevice(
    kind: eposDeviceKind,
    eventCallback: PrinterEventCallback = (args) => {
      console.log(`EPOSイベント`, args);
    },
  ) {
    switch (this.setting.connectionMode) {
      case 'lan': {
        const deviceId = this.rule.device[kind].id;
        const deviceLabel = this.rule.device[kind].label;
        const options = this.rule.device.options;
        const typeHandle = this.rule.device[kind].typeHandle;
        const type = this.ePosDev[typeHandle];

        if (this.devices[kind]) {
          console.log(`すでに${deviceLabel}に接続されています`);
          return false;
        }

        return new Promise((resolve) => {
          //接続する
          this.ePosDev.createDevice(
            deviceId,
            type,
            options,
            (deviceObj, errorCode) => {
              if (deviceObj) {
                console.log(`${deviceLabel}との接続に成功しました`);
                this.devices[kind] = deviceObj;

                //カスタマーディスプレイの場合、一度表示をリセットする
                if (kind == 'display') {
                  this.resetDisplay();
                }
              } else {
                console.error(
                  `${deviceLabel}と接続できませんでした ${errorCode}`,
                );
              }

              resolve(''); //全てOKで返す
            },
          );
        });
      }
      case 'connector': {
        //接続を行う
        switch (kind) {
          case 'display': {
            if (!(await this.connector.checkIsDisplayOnline())) {
              return;
            }

            //一旦表示をリセットする
            this.devices.display = true;
            this.resetDisplay();
            break;
          }
          case 'printer': {
            if (!(await this.connector.checkIsPrinterOnline())) {
              return;
            }

            this.devices.printer = true;
            break;
          }
        }

        break;
      }
      case 'child': {
        this.devices.printer = true;
        break;
      }
    }
  }

  //カスタマーディスプレイで価格を表示する関数
  public async displayPrice(price: number, change?: number) {
    if (!this.devices.display)
      throw new Error('カスタマーディスプレイに接続できていません');

    switch (this.setting.connectionMode) {
      case 'lan': {
        const thisDevice = this.devices.display;

        // 画面をクリアする場合は以下の行を有効にする
        // 右づめにするための設定
        const displayTotalPricePosition =
          20 - (price.toLocaleString().length + 1);

        thisDevice.clearTextArea();
        thisDevice.addText('合計金額  ', 'ja');
        thisDevice.addText('¥ ', displayTotalPricePosition, 1);
        thisDevice.addText(price.toLocaleString());
        if (change !== undefined) {
          const displayChangePosition =
            20 - (change.toLocaleString().length + 1);
          thisDevice.addText('お釣り', 1, 2, 'ja');
          thisDevice.addText('¥ ', displayChangePosition, 2);
          thisDevice.addText(change?.toLocaleString());
        }
        thisDevice.send();
        break;
      }
      case 'connector': {
        await this.connector.displayPrice(price, change);
        break;
      }
      case 'child': {
        console.error('子機モードでは価格表示は対応していません');
        break;
      }
    }
  }

  //カスタマーディスプレイで商品を表示する関数
  public async displayProduct({
    productName,
    unitPrice,
    saleName,
    saleDiscountPrice,
  }: {
    productName: string;
    unitPrice: number;
    saleName?: string;
    saleDiscountPrice?: number;
  }) {
    if (!this.devices.display)
      throw new Error('カスタマーディスプレイに接続できていません');

    switch (this.setting.connectionMode) {
      case 'lan': {
        const thisDevice = this.devices.display;

        // 画面をクリアする場合は以下の行を有効にする
        thisDevice.clearTextArea();
        const displayTextInfo = this.getDisplayText(productName);
        thisDevice.addText(displayTextInfo.text, 'ja');
        thisDevice.addText('¥ ', 1, 2);
        thisDevice.addText(unitPrice?.toLocaleString(), 'ja');
        thisDevice.addText('-');
        thisDevice.send();

        //セールがある場合は1秒後にセールの情報も表示する
        if (saleName && saleDiscountPrice) {
          setTimeout(() => {
            thisDevice.clearTextArea();
            const displayTextInfo = this.getDisplayText(`セール:${saleName}`);
            thisDevice.addText(displayTextInfo.text, 'ja');
            thisDevice.addText('割引¥ ', 1, 2);
            thisDevice.addText(saleDiscountPrice?.toLocaleString(), 'ja');
            thisDevice.send();
          }, 1000);
        }
        break;
      }
      case 'connector': {
        await this.connector.displayProduct({
          productName,
          unitPrice,
          saleName: saleName ?? '',
          saleDiscountPrice: saleDiscountPrice ?? 0,
        });
        break;
      }
      case 'child': {
        console.error('子機モードでは商品表示は対応していません');
        break;
      }
    }
  }

  //カスタマーディスプレイをリセット
  public async resetDisplay() {
    if (!this.devices.display)
      throw new Error('カスタマーディスプレイに接続できていません');

    switch (this.setting.connectionMode) {
      case 'lan': {
        const thisDevice = this.devices.display;
        thisDevice.clearTextArea();
        thisDevice.addText('いらっしゃいませ', 'ja');
        thisDevice.send();
        break;
      }
      case 'connector': {
        await this.connector.resetDisplay();
        await this.connector.displayText('いらっしゃいませ');
        break;
      }
      case 'child': {
        console.error('子機モードでは表示リセットは対応していません');
        break;
      }
    }
  }

  //文字幅
  private getDisplayText = (s: string) =>
    [...String(s || '')].reduce(
      ({ length, text }, e) => {
        //全角だったら2足して半角だったら1足す
        const addNum = isHankaku(e) ? 1 : 2;
        if (length + addNum > 20) return { length, text };
        else return { length: (length += addNum), text: text + e };
      },
      {
        length: 0,
        text: '',
      },
    );

  private async sendPrinterCommand(command: string, storeId?: Store['id']) {
    if (!this.devices.printer)
      throw new Error('レシートプリンターに接続できていません');

    switch (this.setting.connectionMode) {
      case 'lan': {
        const device = this.devices.printer;
        device.message = command;
        device.send();
        break;
      }
      case 'connector': {
        await this.connector.printWithCommand(command);
        break;
      }
      case 'child': {
        if (!storeId) {
          throw new Error('子機モードでの印刷にはstoreIdが必要です');
        }
        const apiClient = new MycaPosApiClient({
          BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
        });
        await apiClient.device.sendCommandToReceiptPrinter({
          storeId,
          requestBody: {
            eposCommand: command,
          },
        });
        break;
      }
    }
  }

  //レシートをコマンドで印刷する
  public async printWithCommand(command: string, storeId?: Store['id']) {
    //処理を分ける
    //子機モードの場合、APIで親機にコマンドを送信する

    switch (this.setting.connectionMode) {
      case 'lan': {
        //ロゴimageがある場合、先にそれを全て印刷
        const imageSplitter = '</image>';
        const imageSplitted = command.split(imageSplitter);
        if (imageSplitted.length > 1) {
          const imageCommand = imageSplitted[0] + imageSplitter;
          await this.sendPrinterCommand(imageCommand);
          command = imageSplitted.slice(1).join(imageSplitter);
        }

        //コマンドを分割する 4000で分割することにする
        const chunkLength = 5000;
        const splitter = '</text>';
        const splittedCommand = [...command].reduce(
          (acc, c, i) =>
            i % chunkLength ? acc : [...acc, command.slice(i, i + chunkLength)],
          [] as Array<string>,
        );

        //コマンドを良い感じに分割しつつ進める

        const lastRemained = await splittedCommand.reduce(
          //@ts-expect-error becuase of because of
          async (remain, each) => {
            remain = await remain;
            //このコマンドの最後の</text>を取得し、それまでのコマンドを実行する
            const textCommands = (remain + each).split(splitter);

            //textCommandsの長さが2以上だったら、ラストのコマンドだけ残して実行する
            if (textCommands.length > 1) {
              const thisCommand =
                textCommands.slice(0, textCommands.length - 1).join(splitter) +
                splitter;
              await this.sendPrinterCommand(thisCommand);

              await sleep(1500);

              return textCommands[textCommands.length - 1];
            } else {
              const thisCommand = textCommands[0];

              await this.sendPrinterCommand(thisCommand);

              return '';
            }
          },
          '',
        );

        //カットを入れる
        await this.sendPrinterCommand(
          lastRemained +
            `
    <cut type="feed"/>
    `,
        );
        break;
      }
      case 'connector': {
        await this.sendPrinterCommand(
          command +
            `
    <cut type="feed"/>
    `,
        );
        break;
      }

      //子機モードではカット入れない（親機側で入れるため）
      case 'child': {
        await this.sendPrinterCommand(command, storeId);
        break;
      }
    }
  }

  public async printWithCommandAtOnce(command: string, storeId?: Store['id']) {
    switch (this.setting.connectionMode) {
      case 'lan':
      case 'connector':
        await this.sendPrinterCommand(
          command +
            `
    <cut type="feed"/>
    `,
        );
        break;
      case 'child': {
        await this.sendPrinterCommand(command, storeId);
        break;
      }
    }
  }

  //レシートの印刷
  public async printReceipt(
    transactionId: number,
    storeId: Store['id'],
    type: 'receipt' | 'ryoshu' = 'receipt',
    printAtOnce?: boolean,
    cashReceivedPrice?: number,
    cashChangePrice?: number,
    isReprint?: boolean,
  ) {
    const apiClient = createClientAPI();

    const res = await apiClient.transaction.getReceipt({
      params: {
        store_id: storeId,
        transaction_id: transactionId,
      },
      query: {
        type,
        cash_recieved_price: cashReceivedPrice,
        cash_change_price: cashChangePrice,
        is_reprint: isReprint,
      },
    });

    if (res instanceof CustomError) {
      alert('レシートの印刷に失敗しました');
      return false;
    }

    const command = res.receiptCommand;

    //レシート印刷
    if (printAtOnce) {
      this.printWithCommandAtOnce(command, storeId);
    } else {
      await this.printWithCommand(command, storeId);
    }

    // this.printWithCommandAtOnce(command);

    //買取レシートだったら顧客の分も印刷する
    if (res.receiptCommandForCustomer) {
      if (printAtOnce) {
        this.printWithCommandAtOnce(res.receiptCommandForCustomer, storeId);
      } else {
        await this.printWithCommand(res.receiptCommandForCustomer, storeId);
      }
    }
  }

  //キャッシュドロワーを開ける
  public async openDrawer() {
    console.log('開けようとしました');

    if (!this.devices.printer)
      throw new Error('レシートプリンターに接続できていません');

    switch (this.setting.connectionMode) {
      case 'lan': {
        const device = this.devices.printer;

        //ドロワーを開けてみる
        device.addPulse(device['DRAWER_1'], device['PULSE_100']);

        device.send();
        break;
      }
      case 'connector': {
        await this.connector.openDrawer();
        break;
      }
      case 'child': {
        console.error('子機モードではドロワーオープンには対応していません');
        break;
      }
    }
  }

  //ホスト名を生成する関数
  private get hostName() {
    return (async () => {
      if (!this.setting.serialCode) return '';
      const isIp = this.setting.serialCode.includes('.');

      if (isIp) {
        //IPだった場合はそのまま返す
        return this.setting.serialCode;
      } else {
        //SHA256
        const buff = new Uint8Array(
          Array.prototype.map.call(this.setting.serialCode, (c) =>
            c.charCodeAt(0),
          ) as unknown as ArrayBufferLike,
        ).buffer;

        //@ts-expect-error becuase of because of
        const hashHex = await crypto.subtle.digest('SHA-256', buff);

        // Encode the Base32
        //@ts-expect-error becuase of because of
        const base32Text = this.encodeBase32(new Uint8Array(hashHex));

        return `${base32Text}.${this.rule.connection.epsonDomain}`;
      }
    })();
  }

  //base32エンコード プリンターでしか使わないためここで定義
  private encodeBase32(byteArray: ArrayBuffer) {
    const bit5toBase32Dic = {
      '00000': 'A',
      '00001': 'B',
      '00010': 'C',
      '00011': 'D',
      '00100': 'E',
      '00101': 'F',
      '00110': 'G',
      '00111': 'H',
      '01000': 'I',
      '01001': 'J',
      '01010': 'K',
      '01011': 'L',
      '01100': 'M',
      '01101': 'N',
      '01110': 'O',
      '01111': 'P',
      '10000': 'Q',
      '10001': 'R',
      '10010': 'S',
      '10011': 'T',
      '10100': 'U',
      '10101': 'V',
      '10110': 'W',
      '10111': 'X',
      '11000': 'Y',
      '11001': 'Z',
      '11010': '2',
      '11011': '3',
      '11100': '4',
      '11101': '5',
      '11110': '6',
      '11111': '7',
    };

    let byteText = '';
    for (let i = 0; i < byteArray.byteLength; i++) {
      byteText += String(
        Number(byteArray.slice(i, i + 1)).toString(2),
      ).padStart(8, '0');
    }

    const bit5Array = byteText.match(/.{1,5}/g);
    let base32Text = '';

    if (!bit5Array) return false;

    for (let i = 0; i < bit5Array.length; i++) {
      let bit5Text = bit5Array[i];
      if (bit5Text.length < 5) {
        bit5Text = bit5Text + '0'.repeat(5 - bit5Text.length);
      }
      if (bit5Text in bit5toBase32Dic) {
        base32Text += bit5toBase32Dic[bit5Text as keyof typeof bit5toBase32Dic];
      }
    }

    return base32Text;
  }
}
