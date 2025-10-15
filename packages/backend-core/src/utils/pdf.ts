//PDF系の処理

import puppeteer from 'puppeteer';
import { S3CustomClient } from '@/services';

export class BackendPdfUtil {
  public static async generatePdf({
    html,
    fileName,
    upDir,
    issueSignedUrl,
  }: {
    html: string;
    fileName: string;
    upDir: string;
    issueSignedUrl?: boolean;
  }) {
    const browser = await puppeteer.launch(
      process.env.RUN_MODE == 'local'
        ? { headless: true }
        : {
            executablePath: '/usr/bin/chromium-browser',
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
          },
    );
    const page = await browser.newPage();

    // HTMLをPDFに変換
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4', // フォーマットをA4に設定
      printBackground: true, // 背景を印刷する
      // マージンを0にする(HTML側でマージン定義しているため、ここは0にしたほうが都合いい)
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    });

    await browser.close();
    const buffer = Buffer.from(pdfBuffer);

    const aws = new S3CustomClient('private');
    let url = await aws.upload({
      upDir,
      buffer,
      extension: '.pdf',
      fileName,
    });

    if (issueSignedUrl) {
      url = aws.getSignedUrl(url);
    }

    return url;
  }
}
