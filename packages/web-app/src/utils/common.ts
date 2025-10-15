//あえてクラス化しない

export const isHankaku = (s: string) =>
  !s.match(/[^\x01-\x7E]/) || !s.match(/[^\uFF65-\uFF9F]/);

export const getTextWidth = (s: string) =>
  [...String(s)].reduce((curSum, c) => curSum + (isHankaku(c) ? 1 : 2), 0);

//エキスパンションなどのメタ付きの商品名を取得する
export const getProductNameWithMeta = ({
  originalName,
  metas,
}: {
  originalName: string; //元々の名前
  metas: Array<string | null | undefined>; //メタたち
}) => {
  metas = metas.filter(Boolean); //無効なメタは排除
  originalName = String(originalName || '');

  const metaInfo =
    !metas.every((e) => originalName.includes(e as string)) && metas.length
      ? `（${metas.join(' ')}）`
      : '';

  return originalName + metaInfo;
};

export const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));
