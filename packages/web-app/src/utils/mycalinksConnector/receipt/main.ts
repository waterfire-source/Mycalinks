import { MycalinksConnector } from '@/utils/mycalinksConnector/main';

//レシートプリンターおよびカスタマーディスプレイ
export class MycalinksConnectorReceipt extends MycalinksConnector {
  constructor(port: string) {
    super(port);
  }

  public status = {
    connector: false,
    printer: false,
    display: false,
  };

  /**
   * プリンターがオンラインかどうか確認
   */
  public async checkIsPrinterOnline() {
    const response = await this.sendRequest('GET', '/api/receipt?check=online');
    const ok = response.status === 'online';
    this.status.printer = true;
    return ok;
  }

  /**
   * カスタマーディスプレイがオンラインかどうか確認
   */
  public async checkIsDisplayOnline() {
    const response = await this.sendRequest('GET', '/api/line?check=online');
    const ok = response.status === 'online';
    this.status.display = true;
    return ok;
  }

  /**
   * セットアップ
   */
  public async setUp() {
    //そもそもMycalinksコネクタが起動しているかどうか確認
    if (!(await this.checkIsConnectorRunning())) {
      throw new Error('Mycalinksコネクタが起動していません');
    }
    this.status.connector = true;

    return true;
  }

  /**
   * クリア
   */
  public async resetDisplay() {
    const response = await this.sendRequest('POST', '/api/line', {
      command: 'clear',
    });
    if (response.status !== 'ok') {
      throw new Error('カスタマーディスプレイのクリアに失敗しました');
    }
  }

  /**
   * テキスト表示
   */
  public async displayText(text: string) {
    const response = await this.sendRequest('POST', '/api/line', {
      command: 'text',
      singleText: text,
    });
    // if (response.status !== 'ok') {
    //   throw new Error('カスタマーディスプレイのテキスト表示に失敗しました');
    // }
  }

  /**
   * 価格表示
   */
  public async displayPrice(price: number, change?: number) {
    const response = await this.sendRequest('POST', '/api/line', {
      command: 'price',
      price,
      change: change ?? -1,
    });
  }

  /**
   * 商品表示
   */
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
    const response = await this.sendRequest('POST', '/api/line', {
      command: 'product',
      productName,
      unitPrice,
      saleName,
      saleDiscountPrice,
    });

    if (response.status !== 'ok') {
      throw new Error('商品の表示に失敗しました');
    }
  }

  /**
   * コマンドを使ってレシートを印刷
   */
  public async printWithCommand(command: string) {
    if (!this.status.printer) {
      throw new Error('プリンターがオンラインではありません');
    }

    const response = await this.sendRequest('POST', '/api/receipt', {
      command: 'print',
      contents: command,
    });

    if (response.status !== 'ok') {
      throw new Error('レシートの印刷に失敗しました');
    }

    return true;
  }

  /**
   * ドロワーのオープン
   */
  public async openDrawer() {
    if (!this.status.printer) {
      throw new Error('プリンターがオンラインではありません');
    }

    const response = await this.sendRequest('POST', '/api/receipt', {
      command: 'open',
    });

    if (response.status !== 'ok') {
      throw new Error('ドロワーのオープンに失敗しました');
    }
  }
}
