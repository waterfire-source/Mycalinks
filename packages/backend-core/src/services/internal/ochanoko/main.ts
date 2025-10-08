import { BackendCoreError } from '@/error/main';
import {
  BackendExternalOchanokoService,
  S3CustomClient,
} from '@/services/external';
import { BackendService } from '@/services/internal/main';
import { BackendCoreProductService } from '@/services/internal/product/main';
import { BackendImageUtil } from '@/utils/image';
import archiver from 'archiver';
import iconv from 'iconv-lite';

export class BackendCoreOchanokoService extends BackendService {
  public client: BackendExternalOchanokoService;

  constructor() {
    super();
    this.client = new BackendExternalOchanokoService();
  }

  /**
   * メールアドレスからストアIDを取得する
   */
  @BackendService.UseCache(300)
  public async fetchStoreIdAndToken(email: string) {
    const store = await this.db.ec_Setting.findUnique({
      where: {
        ochanoko_email: email,
        store: {
          ochanoko_ec_enabled: true,
        },
      },
      select: {
        store_id: true,
        ochanoko_api_token: true,
        ochanoko_email: true,
      },
    });

    if (!store || !store.ochanoko_api_token || !store.ochanoko_email) {
      throw new BackendCoreError({
        internalMessage:
          '指定されたメールアドレスに結びついているストアが見つかりませんでした',
      });
    }

    return {
      storeId: store.store_id,
      accessToken: store.ochanoko_api_token,
      email: store.ochanoko_email,
    };
  }

  /**
   * アクセストークンを取得する 5分はキャッシュ
   */
  @BackendService.WithIds(['storeId'])
  @BackendService.UseCache(300)
  public async fetchToken() {
    //おちゃのこが有効になっているのかと同時にアクセストークンも取得
    const storeInfo = await this.db.ec_Setting.findUnique({
      where: {
        store_id: this.ids.storeId,
        store: {
          ochanoko_ec_enabled: true,
        },
      },
      select: {
        ochanoko_api_token: true,
        ochanoko_email: true,
      },
    });

    if (
      !storeInfo ||
      !storeInfo.ochanoko_api_token ||
      !storeInfo.ochanoko_email
    )
      throw new BackendCoreError({
        internalMessage:
          'ストア情報が見つからないか、おちゃのこのECが有効になっていません',
        externalMessage:
          'ストア情報が見つからないか、おちゃのこのECが有効になっていません',
      });

    return {
      accessToken: storeInfo.ochanoko_api_token,
      email: storeInfo.ochanoko_email,
    };
  }

  /**
   * APIアクセスができる状態にする
   */
  public async grantToken(email?: string) {
    //あったら無視する
    if (this.client.config.accessToken && this.client.config.email) return;

    //なかったら、resourcesにあるか確認する
    if (this.resources.store?.ec_setting) {
      if (
        this.resources.store.ec_setting.ochanoko_api_token &&
        this.resources.store.ec_setting.ochanoko_email
      ) {
        this.client.config.accessToken =
          this.resources.store.ec_setting.ochanoko_api_token;
        this.client.config.email =
          this.resources.store.ec_setting.ochanoko_email;
        return;
      }
    }

    //なかったらトークンをフェッチしてくる

    if (this.ids.storeId) {
      const tokenInfo = await this.fetchToken();
      //設定する
      this.client.config.accessToken = tokenInfo.accessToken;
      this.client.config.email = tokenInfo.email;
    } else if (email) {
      const storeInfo = await this.fetchStoreIdAndToken(email);
      console.log(`メールアドレスからstoreIdとかを取得しました`);
      this.setIds({
        storeId: storeInfo.storeId,
      });
      this.client.config.accessToken = storeInfo.accessToken;
      this.client.config.email = storeInfo.email;
    } else {
      throw new BackendCoreError({
        internalMessage: 'ストアIDかメールアドレスが必要です',
      });
    }
  }

  @BackendService.WithIds(['storeId'])
  /**
   * 在庫データをおちゃのこのCSV形式にして返す
   */
  public async createProductCsvZip(productIds: number[]) {
    try {
      // 在庫データを取得
      const products = await this.db.product.findMany({
        where: {
          id: { in: productIds },
          store_id: this.ids.storeId,
          deleted: false,
          condition_option: {
            handle: {
              not: null,
            },
          },
        },
        include: {
          item: {
            include: {
              category: true,
            },
          },
          condition_option: true,
          specialty: true,
        },
      });

      const allProduct = productIds.map((id) => {
        const thisProductInfo = products.find((p) => p.id === id);
        if (!thisProductInfo) {
          throw new BackendCoreError({
            internalMessage: `指定された在庫が見つかりません productId: ${id}`,
            externalMessage: '在庫が見つかりません',
          });
        }

        return thisProductInfo;
      });

      // CSVヘッダーを直接定義
      const headers = [
        '商品番号',
        '商品名',
        '型番/品番',
        'JANコード',
        'カテゴリ',
        'サブカテゴリ',
        'グループ',
        'garittoカテゴリー',
        '販売価格',
        '希望小売価格',
        '全体割引設定からこの商品を除外する',
        '商品毎の追加ポイント',
        'ポイント発行の対象から除外する',
        'ポイント利用の対象から除外する',
        'オーダーメイドパターン',
        '在庫数',
        '在庫が0でも注文を受け付ける',
        '在庫切れ時のテキスト表示',
        'SOLD OUT画像テキスト',
        '「在庫わずか」表示ライン',
        '在庫単位',
        '在庫単位を表示しない',
        '数量ラベル：ラベル',
        '数量ラベル：単位',
        '一度に購入できる商品点数',
        'バリエーションがあっても商品単位で制限する',
        'この商品を購入する場合、お届け先の送料を無料にする',
        '送料',
        '送料：個別設定',
        '送料：単独設定',
        '重量別送料適用時の重さ',
        'UPS,FedEx送料適用時の重さ',
        '送料追加オプション1',
        '送料追加オプション1追加金額',
        '送料追加オプション2',
        '送料追加オプション2追加金額',
        '送料追加オプション3',
        '送料追加オプション3追加金額',
        '陳列期間開始',
        '陳列期間終了',
        'メイン写真1',
        '写真タイトル1',
        'メイン写真2',
        '写真タイトル2',
        'メイン写真3',
        '写真タイトル3',
        'メイン写真4',
        '写真タイトル4',
        'メイン写真5',
        '写真タイトル5',
        'メイン写真6',
        '写真タイトル6',
        'メイン写真7',
        '写真タイトル7',
        'メイン写真8',
        '写真タイトル8',
        'メイン写真9',
        '写真タイトル9',
        'メイン写真10',
        '写真タイトル10',
        'メイン写真11',
        '写真タイトル11',
        'メイン写真12',
        '写真タイトル12',
        'メイン写真13',
        '写真タイトル13',
        'メイン写真14',
        '写真タイトル14',
        'メイン写真15',
        '写真タイトル15',
        'メイン写真16',
        '写真タイトル16',
        'メイン写真17',
        '写真タイトル17',
        'メイン写真18',
        '写真タイトル18',
        'メイン写真19',
        '写真タイトル19',
        'メイン写真20',
        '写真タイトル20',
        'メイン写真21',
        '写真タイトル21',
        'メイン写真22',
        '写真タイトル22',
        'メイン写真23',
        '写真タイトル23',
        'メイン写真24',
        '写真タイトル24',
        'メイン写真25',
        '写真タイトル25',
        'メイン写真26',
        '写真タイトル26',
        'メイン写真27',
        '写真タイトル27',
        'メイン写真28',
        '写真タイトル28',
        'メイン写真29',
        '写真タイトル29',
        'メイン写真30',
        '写真タイトル30',
        'メイン写真31',
        '写真タイトル31',
        'メイン写真32',
        '写真タイトル32',
        'メイン写真33',
        '写真タイトル33',
        'メイン写真34',
        '写真タイトル34',
        'メイン写真35',
        '写真タイトル35',
        'メイン写真36',
        '写真タイトル36',
        'メイン写真37',
        '写真タイトル37',
        'メイン写真38',
        '写真タイトル38',
        'メイン写真39',
        '写真タイトル39',
        'メイン写真40',
        '写真タイトル40',
        'メイン写真41',
        '写真タイトル41',
        'メイン写真42',
        '写真タイトル42',
        'メイン写真43',
        '写真タイトル43',
        'メイン写真44',
        '写真タイトル44',
        'メイン写真45',
        '写真タイトル45',
        'メイン写真46',
        '写真タイトル46',
        'メイン写真47',
        '写真タイトル47',
        'メイン写真48',
        '写真タイトル48',
        'メイン写真49',
        '写真タイトル49',
        'メイン写真50',
        '写真タイトル50',
        'メイン写真リンクURL',
        '説明',
        '改行は<br />タグに置換する',
        'URLはリンクタグに置換する',
        '説明（スマートフォン版）',
        '改行は<br />タグに置換する',
        'URLはリンクタグに置換する',
        'YouTube',
        'SEO：タイトル',
        'SEO：ディスクリプション',
        'SEO：キーワード',
        'キャッチフレーズ',
        'キャッチフレーズ（スマートフォン版）',
        'ヘッダー',
        'ヘッダー（スマートフォン版）',
        '準備中',
        '新着商品',
        'おすすめ商品',
        'ショッピングカートに入れられない',
        '商品仕様：項目名',
        '商品仕様：内容',
        '他の写真1：写真',
        '他の写真1：説明',
        '改行は<br />タグに置換する',
        'URLはリンクタグに置換する',
        '他の写真1：説明（スマートフォン版）',
        '改行は<br />タグに置換する',
        'URLはリンクタグに置換する',
        '他の写真2：写真',
        '他の写真2：説明',
        '改行は<br />タグに置換する',
        'URLはリンクタグに置換する',
        '他の写真2：説明（スマートフォン版）',
        '改行は<br />タグに置換する',
        'URLはリンクタグに置換する',
        '他の写真3：写真',
        '他の写真3：説明',
        '改行は<br />タグに置換する',
        'URLはリンクタグに置換する',
        '他の写真3：説明（スマートフォン版）',
        '改行は<br />タグに置換する',
        'URLはリンクタグに置換する',
        '外部ショッピング：condition',
        '外部ショッピング：product_type',
        '外部ショッピング：gtin',
        '外部ショッピング：brand',
        '外部ショッピング：mpn',
        'バリエーション選択形式',
        'バリエーションが2つの場合に項目名を縦と横に並べない',
        '関連商品1',
        '関連商品2',
        '関連商品3',
        '関連商品4',
        '関連商品5',
        '関連商品6',
        '関連商品7',
        '関連商品8',
        '関連商品9',
        '関連商品10',
        'ランキング表示',
        'お支払い方法除外設定',
        '発送方法除外設定',
        '商品削除',
        '管理用メモ',
      ];

      // 50枚ずつにチャンク分割
      const chunkSize = 50;
      const productChunks: (typeof allProduct)[] = [];
      for (let i = 0; i < allProduct.length; i += chunkSize) {
        productChunks.push(allProduct.slice(i, i + chunkSize));
      }

      // 各フォルダを個別のZIPファイルとして作成
      const createFolderZip = async (chunk: typeof allProduct) => {
        return new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = [];
          const archive = archiver('zip', { zlib: { level: 9 } });

          archive.on('data', (chunk) => chunks.push(chunk));
          archive.on('end', () => resolve(Buffer.concat(chunks)));
          archive.on('error', reject);

          // CSVデータ作成
          const csvRows = chunk.map((product) => {
            const row = new Array(headers.length).fill('');

            // ヘッダー名で直接検索して設定
            const setField = (fieldName: string, value: string) => {
              const index = headers.indexOf(fieldName);
              if (index >= 0) {
                row[index] = value;
              }
            };

            // CSVに出力する商品名を組み立てる
            const productService = new BackendCoreProductService(product.id);
            const displayName = productService.getEcProductName(product);

            setField('商品名', displayName);
            setField('型番/品番', product.id.toString());
            setField('JANコード', product.readonly_product_code || '');
            setField('カテゴリ', product.item.category.display_name || '');
            // setField('サブカテゴリ', product.item.displaytype2 || ''); TODO: サブカテゴリを設定する
            setField(
              '販売価格',
              product.actual_ec_sell_price?.toString() || '0',
            );
            setField('在庫数', product.ec_stock_number?.toString() || '0');
            setField('「在庫わずか」表示ライン', '1');
            setField('メイン写真1', `product_${product.id}.jpg`);
            setField('写真タイトル1', displayName);
            // setField('説明', description); TODO: 説明を設定する
            // setField('説明（スマートフォン版）', description); TODO: 説明を設定する

            return row;
          });

          const csvContent = [headers, ...csvRows]
            .map((row) =>
              row
                .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
                .join(','),
            )
            .join('\n');

          // CSVファイルをShift_JISでエンコードしてルートに追加
          const startId = chunk[0].id;
          const endId = chunk[chunk.length - 1].id;
          const csvBuffer = iconv.encode(csvContent, 'shift_jis');
          archive.append(csvBuffer, { name: `${startId}-${endId}.csv` });

          // 画像データを収集して追加
          const processImages = async () => {
            for (const product of chunk) {
              const imageUrl = (product as any).item?.image_url;
              if (imageUrl) {
                try {
                  const processedImage =
                    await BackendImageUtil.productUrlToJpg(imageUrl);
                  if (processedImage.buffer) {
                    archive.append(processedImage.buffer, {
                      name: `product_${product.id}.jpg`,
                    });
                  }
                } catch (error) {
                  console.warn(
                    `画像取得失敗 (Product ID: ${product.id}):`,
                    error,
                  );
                }
              }
            }
            archive.finalize();
          };

          processImages().catch(reject);
        });
      };

      // 各チャンクを個別のZIPファイルとして作成
      const zipBuffers = await Promise.all(
        productChunks.map(async (chunk) => {
          const startId = chunk[0].id;
          const endId = chunk[chunk.length - 1].id;
          const folderName = `${startId}-${endId}`;
          const zipBuffer = await createFolderZip(chunk);
          return { folderName, zipBuffer };
        }),
      );

      // 最終ZIPファイル作成（親フォルダ内に子ZIPファイルを配置）
      const parentFolderName = `myca-to-ochanoko-${
        this.ids.storeId
      }-${Date.now()}`;
      const zipBuffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.on('data', (chunk) => chunks.push(chunk));
        archive.on('end', () => resolve(Buffer.concat(chunks)));
        archive.on('error', reject);

        // 各子ZIPファイルを直接追加（フォルダ階層なし）
        zipBuffers.forEach(({ folderName, zipBuffer }) => {
          archive.append(zipBuffer, {
            name: `${folderName}.zip`,
          });
        });

        archive.finalize();
      });

      //bufferをs3にアップロードする
      const s3 = new S3CustomClient('private');
      const uploadRes = await s3.upload({
        upDir: `pos/store/${this.ids.storeId}/ec/ochanoko/`,
        buffer: zipBuffer,
        extension: '.zip',
        fileName: parentFolderName,
      });

      const fileUrl = s3.getSignedUrl(uploadRes);

      return {
        fileUrl,
        chunkCount: productChunks.length,
      };
    } catch (error) {
      const storeId = this.ids?.storeId ?? '不明';
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new BackendCoreError({
        internalMessage: `zipファイルの生成に失敗しました。\nエラー内容: ${errorMessage}\nストアID: ${storeId}`,
        externalMessage: '在庫データの生成に失敗しました',
      });
    }
  }
}
