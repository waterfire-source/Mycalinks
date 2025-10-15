import { Readable } from 'node:stream';
import { createGunzip } from 'node:zlib';
import ndjson from 'ndjson';

type AnyLine = {
  __typename?: string;
  id: string;
  __parentId?: string;
  title?: string;
  inventoryItem?: { id: string };
};

export async function assembleWithProductNdjson(url: string): Promise<
  {
    productId: string;
    title?: string;
    variants: Array<{ variantId: string; inventoryItemId: string }>;
  }[]
> {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

  let nodeStream = Readable.fromWeb(res.body as any);
  const enc = res.headers.get('content-encoding')?.toLowerCase();
  if (enc?.includes('gzip')) nodeStream = nodeStream.pipe(createGunzip());

  const parser = ndjson.parse(); // -> 'data' で1行ずつオブジェクト
  nodeStream.pipe(parser);

  // ここは方針Aと同じインデックス結合
  const products = new Map<
    string,
    { productId: string; title?: string; variants: any[] }
  >();
  const pend = new Map<string, any[]>();

  await new Promise<void>((resolve, reject) => {
    parser.on('data', (obj: AnyLine) => {
      if (obj.__typename === 'Product') {
        const p = products.get(obj.id) ?? {
          productId: obj.id,
          title: obj.title,
          variants: [],
        };
        p.title = obj.title ?? p.title;
        const pv = pend.get(obj.id);
        if (pv) {
          p.variants.push(...pv);
          pend.delete(obj.id);
        }
        products.set(obj.id, p);
      } else if (obj.__typename === 'ProductVariant') {
        const v = { variantId: obj.id, inventoryItemId: obj.inventoryItem?.id };
        const parent = products.get(obj.__parentId!);
        if (parent) parent.variants.push(v);
        else {
          const list = pend.get(obj.__parentId!) ?? [];
          list.push(v);
          pend.set(obj.__parentId!, list);
        }
      }
    });
    parser.on('end', () => resolve());
    parser.on('error', reject);
  });

  return Array.from(products.values());
}
