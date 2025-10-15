import sharp from 'sharp';

export class BackendImageUtil {
  public static async logoUrlToPng(url: string) {
    if (!url) {
      return {
        buffer: null,
      };
    }

    const imageData = await fetch(url);
    const imageDataBlob = await imageData.blob();
    const imageDataBuffer = await imageDataBlob.arrayBuffer();

    const resized = sharp(imageDataBuffer).resize(300).png();

    return {
      buffer: await resized.toBuffer(),
    };
  }

  public static async productUrlToJpg(url: string) {
    if (!url) {
      return {
        buffer: null,
      };
    }

    const imageData = await fetch(url);
    const imageDataBlob = await imageData.blob();
    const imageDataBuffer = await imageDataBlob.arrayBuffer();

    const resized = sharp(imageDataBuffer).resize(400).jpeg({ quality: 90 });

    return {
      buffer: await resized.toBuffer(),
    };
  }
}
