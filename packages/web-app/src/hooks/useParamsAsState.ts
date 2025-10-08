import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

//クエリパラメータをステートのように扱うカスタムフック
export const useParamsAsState = (
  propName: string,
): [string | null, (newVal: string) => void] => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  //初期値から拾う
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    setValue(searchParams.get(propName));
  }, [searchParams]);

  const setter = (newVal: string) => {
    console.log(propName, newVal);
    // newValが空文字の場合はクエリから削除する
    if (newVal === '') {
      const params = new URLSearchParams(window.location.search);
      params.delete(propName);
      router.push(`${pathname}?${params.toString()}`);
      return;
    }
    router.push(
      `${pathname}?${new URLSearchParams({
        ...Object.fromEntries(searchParams),
        [propName]: newVal,
      })}`,
    );
  };

  return [value, setter];
};
