//配送関係

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import { BackendService, S3CustomClient } from 'backend-core';
import { customDayjs } from 'common';
import { readFileSync, writeFileSync } from 'fs';
import { PassThrough } from 'stream';

/**
 * ファイル関連のサービス
 * S3なども必要に応じて使う
 */
export class BackendApiFileService extends BackendApiService {
  constructor(API: BackendAPI<any>) {
    super(API);
  }

  public config = {
    namespace: 'pos',
  };

  /**
   * 画像をS3にアップロード
   * @param dirKind
   * @param fileHandle
   * @returns
   */
  @BackendService.WithIds(['storeId'])
  public async uploadImageToS3(
    dirKind: 'item' | 'product' | 'transaction' | 'store' | 'label-printer',
    fileHandle: string,
  ): Promise<string> {
    const fileData = this.API.files.find((e) => e.fileKind == fileHandle);
    if (!fileData)
      throw new ApiError({
        status: 500,
        messageText: '画像アップロードができませんでした',
      });

    const upDir = `${this.config.namespace}/store/${this.ids.storeId}/${dirKind}/img/`;

    const s3 = new S3CustomClient();

    return await s3.upload({
      upDir,
      extension: fileData.extension,
      buffer: fileData.fsData,
    });
  }

  /**
   * CSVをS3にアップロード アップロードできたらURLを返す
   * @param dirKind
   * @param fileData
   * @returns
   */
  @BackendService.WithIds(['storeId'])
  public async uploadCsvToS3({
    dirKind,
    fileData,
    writer,
    fileName,
  }: {
    dirKind:
      | 'item'
      | 'product'
      | 'transaction'
      | 'inventory'
      | 'ec'
      | 'stocking'
      | 'loss'
      | 'shopify';
    fileData?: any;
    writer?: (passThrough: PassThrough) => Promise<void>;
    fileName?: string;
  }) {
    const upDir = `${this.config.namespace}/store/${this.ids.storeId}/${dirKind}/csv/`;

    const s3 = new S3CustomClient('private');

    //一度既存のファイルを削除する
    await s3.emptyDir(upDir);

    //callbackが指定されていたらストリーミング書き出しモード
    let url: string = '';
    if (writer) {
      url = await s3.streamUpload({
        upDir,
        extension: '.csv',
        mimetype: 'text/csv',
        callback: writer,
        fileName,
      });
    } else if (fileData) {
      //S3に送信する
      url = await s3.upload({
        upDir,
        extension: '.csv',
        buffer: fileData,
      });
    }

    //signedUrlを取得
    const signedUrl = s3.getSignedUrl(url);

    return signedUrl;
  }

  /**
   * リクエストファイルの整理など
   */
  public setUp = async () => {
    const instance = this.API;

    if (
      instance.req!.headers.get('content-type')?.includes('multipart/form-data')
    ) {
      instance.body = Object.fromEntries(await instance.req!.formData());

      //fileという名前を含んでいるものは基本的にfileDataを取り扱う
      for (const prop in instance.body) {
        if (prop.includes('file') && instance.body[prop]) {
          const file: File = instance.body[prop];

          const serverFileData: any = {
            rawName: instance.body[prop].name,
            fileKind: prop,
          };

          const buffer = Buffer.from(await file.arrayBuffer());
          let fileName: string = instance.body[prop].name;

          let fileNameSplitted: Array<string> = [];
          if ((fileNameSplitted = fileName.split('.')).length) {
            fileName = '.' + fileNameSplitted[fileNameSplitted.length - 1];
          } else {
            fileName = '';
          }

          serverFileData.extension = fileName;

          fileName = customDayjs().valueOf().toString() + fileName;

          serverFileData.nameOnServer = fileName;

          //サーバー上に一時ファイルをアップロードする（のちに消す想定）
          writeFileSync(`./uploaded/${fileName}`, buffer, {
            encoding: 'utf-8',
          });

          //そこから読み込む
          serverFileData.fsData = readFileSync(`./uploaded/${fileName}`);

          instance.files.push(serverFileData);
        } else if (prop.includes('json') && instance.body[prop]) {
          instance.body[prop] = JSON.parse(instance.body[prop]);
        }
      }
    }
  };

  public getFileData(fileKind: string) {
    const fileData = (this.API.files || []).find((e) => e.fileKind == fileKind);

    return fileData;
  }
}
