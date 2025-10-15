import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// 複数のクエリパラメータをステートのように扱うカスタムフック
export const useMultipleParamsAsState = (
  propNames: string[],
): [
  { [key: string]: string | null },
  (newValues: { [key: string]: string }) => void,
] => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // 各クエリパラメータの初期値を状態として保持
  const [values, setValues] = useState<{ [key: string]: string | null }>({});

  useEffect(() => {
    const initialValues: { [key: string]: string | null } = {};

    // 各 propName の値を searchParams から取得して初期値としてセット
    propNames.forEach((propName) => {
      initialValues[propName] = searchParams.get(propName);
    });

    setValues(initialValues);
  }, [searchParams]);

  const setter = (newValues: { [key: string]: string }) => {
    const params = new URLSearchParams(window.location.search);
    console.log(newValues);
    // newValues に含まれるクエリパラメータを更新
    Object.entries(newValues).forEach(([key, value]) => {
      if (value === '') {
        params.delete(key); // 空文字の場合はクエリから削除
      } else {
        params.set(key, value); // 値が存在する場合はクエリを更新
      }
    });

    // URLを更新し、クエリパラメータを反映させる
    router.push(`${pathname}?${params.toString()}`);
  };

  return [values, setter];
};
