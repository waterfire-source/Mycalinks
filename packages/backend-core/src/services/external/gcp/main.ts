import { drive_v3, google, slides_v1 } from 'googleapis';
import { JWT } from 'google-auth-library';
import { BackendCoreError } from '@/error/main';

const jwtBasic = {
  email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GCP_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: [],
};

// const jwtAuth = google.auth.

/**
 * Googleドライブ系のAPI
 */
export class GoogleDriveService {
  public config = {
    requiredScopes: ['https://www.googleapis.com/auth/drive'],
  };

  public static dirs = {
    report: '1tjky3dVnlMEfW2wrLpcrM2LJbibPEedR',
  };

  public client: drive_v3.Drive;

  constructor() {
    this.client = google.drive({
      version: 'v3',
      auth: new JWT({
        ...jwtBasic,
        scopes: this.config.requiredScopes,
      }),
    });
  }

  /**
   * ファイル共有
   */
  public share = async (fileId: string, emails: string[]) => {
    const res = await this.client.permissions.create({
      fileId,
      requestBody: {
        role: 'writer',
        type: 'user',
        emailAddress: emails.join(','),
      },
    });

    return res.data;
  };
  /**
   * ファイルをフォルダに移動
   */
  public mvFrom = async (
    fileId: string,
    dir: keyof typeof GoogleDriveService.dirs,
  ) => {
    const res = await this.client.files.update({
      fileId,
      addParents: GoogleDriveService.dirs[dir],
      supportsAllDrives: true,
      removeParents: 'root',
    });

    return res.data;
  };
}

/**
 * Googleプレゼンテーション系のAPI
 */
export class GooglePresentationService {
  public config = {
    requiredScopes: ['https://www.googleapis.com/auth/presentations'],
  };

  public client: slides_v1.Slides;
  private presentationId?: string;

  public static templates = {
    report: '141zpYUtKY8ecfZBiNuROCtxAfuw1epSZwo8fW5vTyJs',
  };

  constructor() {
    this.client = google.slides({
      version: 'v1',
      auth: new JWT({
        ...jwtBasic,
        scopes: this.config.requiredScopes,
      }),
    });
  }

  public get editUrl() {
    if (!this.presentationId) {
      throw new BackendCoreError({
        internalMessage: 'Presentation ID is not set',
      });
    }

    return `https://docs.google.com/presentation/d/${this.presentationId}/edit`;
  }

  /**
   * テンプレートから作成
   */
  public createPresentationFromTemplate = async (
    template: keyof typeof GooglePresentationService.templates,
    dir: keyof typeof GoogleDriveService.dirs,
    title: string,
  ) => {
    const driveClient = new GoogleDriveService();

    const copyRes = await driveClient.client.files.copy({
      fileId: GooglePresentationService.templates[template],
      requestBody: {
        name: title, // 新しいファイル名
        parents: [GoogleDriveService.dirs[dir]],
        mimeType: 'application/vnd.google-apps.presentation', // 明示してもOK
      },
      supportsAllDrives: true, // 共有ドライブ対象ならこれ必須
    });

    const newFileId = copyRes.data.id;
    console.log('New presentation file created:', newFileId);

    this.presentationId = newFileId!;

    return this.presentationId;
  };
  /**
   * プレゼンを作成
   * @param dir フォルダID
   * @param title プレゼンタイトル
   * @returns プレゼンID
   */
  public createPresentation = async (
    dir: keyof typeof GoogleDriveService.dirs,
    title: string,
  ) => {
    // ① プレゼンを作成する
    const presRes = await this.client.presentations.create({
      requestBody: { title },
    });
    const presentationId = presRes.data.presentationId!;
    console.log('Created Presentation ID:', presentationId);
    this.presentationId = presentationId;

    // ② Drive APIでフォルダに移動
    const driveClient = new GoogleDriveService();

    await driveClient.mvFrom(this.presentationId, dir);

    console.log('Moved to folder:', GoogleDriveService.dirs[dir]);

    return this.presentationId;
  };

  /**
   * 画像を1スライドに1枚追加する
   */
  public addImageSlides = async (
    imageUrls: Array<{
      imageUrl: string[];
      title: string;
    }>,
  ) => {
    if (!this.presentationId) {
      throw new BackendCoreError({
        internalMessage: 'Presentation ID is not set',
      });
    }

    const requests: slides_v1.Schema$Request[] = [];

    //バッチリクエストを追加
    // ② 画像ごとにスライドを追加＋画像挿入
    imageUrls.forEach(({ imageUrl, title }, index) => {
      const slideId = `slide_${index + 1}`;
      const imageId = `image_${index + 1}`;
      const textBoxId = `textBox_${index + 1}`;

      requests.push({
        createSlide: {
          objectId: slideId,
          slideLayoutReference: { predefinedLayout: 'BLANK' },
        },
      });

      imageUrl.reduce((curBottom, url, i2) => {
        const height = 2100000;
        const thisImageId = `image_${index + 1}_${i2 + 1}`;
        requests.push({
          createImage: {
            objectId: thisImageId,
            url,
            elementProperties: {
              pageObjectId: slideId,
              size: {
                height: { magnitude: height, unit: 'EMU' },
                width: { magnitude: 4500000, unit: 'EMU' },
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 100000,
                translateY: curBottom,
                unit: 'EMU',
              },
            },
          },
        });
        return curBottom + height;
      }, 600000);

      requests.push(
        {
          // ③ テキストボックスを作成（画像の上に重ねる）
          createShape: {
            objectId: textBoxId,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: slideId,
              size: {
                width: { magnitude: 8500000, unit: 'EMU' },
                height: { magnitude: 500000, unit: 'EMU' },
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 150000, // ←画像よりちょっと内側に
                translateY: 100000, // ←画像の上部に合わせる
                unit: 'EMU',
              },
            },
          },
        },
        // ④ テキストを挿入
        {
          insertText: {
            objectId: textBoxId,
            text: title,
          },
        },
      );
    });

    // ③ 一括実行
    const res = await this.client.presentations.batchUpdate({
      presentationId: this.presentationId,
      requestBody: { requests },
    });

    console.log('All slides and images created!');

    return res.data;
  };
}
